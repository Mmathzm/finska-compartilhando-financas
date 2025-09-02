import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SharedAccount {
  id: string;
  name: string;
  description?: string;
  balance: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: SharedAccountMember[];
}

export interface SharedAccountMember {
  id: string;
  shared_account_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profile?: {
    display_name?: string;
  };
}

export interface CreateSharedAccountData {
  name: string;
  description?: string;
  balance?: number;
}

export const useSharedAccounts = () => {
  const [sharedAccounts, setSharedAccounts] = useState<SharedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSharedAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shared_accounts')
        .select(`
          *,
          members:shared_account_members(
            *,
            profiles!shared_account_members_user_id_fkey(display_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSharedAccounts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar contas compartilhadas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSharedAccount = async (accountData: CreateSharedAccountData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('shared_accounts')
        .insert([{
          ...accountData,
          balance: accountData.balance || 0,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Add the creator as owner
      await supabase
        .from('shared_account_members')
        .insert([{
          shared_account_id: data.id,
          user_id: data.created_by,
          role: 'owner'
        }]);

      await fetchSharedAccounts();
      toast({
        title: "Conta compartilhada criada",
        description: "Conta criada com sucesso!"
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta compartilhada",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const addMoneyToAccount = async (accountId: string, amount: number) => {
    try {
      const account = sharedAccounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Conta não encontrada');

      const newBalance = account.balance + amount;
      
      const { data, error } = await supabase
        .from('shared_accounts')
        .update({ balance: newBalance })
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;

      setSharedAccounts(prev => 
        prev.map(acc => acc.id === accountId ? { ...acc, balance: newBalance } : acc)
      );

      toast({
        title: "Dinheiro adicionado",
        description: `R$ ${amount.toFixed(2)} adicionado à conta "${account.name}"`
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar dinheiro",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateSharedAccount = async (id: string, updates: Partial<CreateSharedAccountData>) => {
    try {
      const { data, error } = await supabase
        .from('shared_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSharedAccounts(prev => 
        prev.map(acc => acc.id === id ? { ...acc, ...data } : acc)
      );
      toast({
        title: "Conta atualizada",
        description: "Conta compartilhada atualizada com sucesso!"
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar conta",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteSharedAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSharedAccounts(prev => prev.filter(acc => acc.id !== id));
      toast({
        title: "Conta excluída",
        description: "Conta compartilhada removida com sucesso!"
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao excluir conta",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchSharedAccounts();
  }, []);

  return {
    sharedAccounts,
    loading,
    createSharedAccount,
    addMoneyToAccount,
    updateSharedAccount,
    deleteSharedAccount,
    refetch: fetchSharedAccounts
  };
};