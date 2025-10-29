import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  user_id: string;
  shared_account_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface SharedAccountInput {
  name: string;
  description?: string;
  balance?: number;
}

export const useSharedAccounts = () => {
  const [sharedAccounts, setSharedAccounts] = useState<SharedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch shared accounts
  const fetchSharedAccounts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shared_accounts')
        .select(`
          *,
          members:shared_account_members(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSharedAccounts(data || []);
    } catch (error) {
      console.error('Error fetching shared accounts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas compartilhadas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create shared account
  const createSharedAccount = async (account: SharedAccountInput) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('shared_accounts')
        .insert([{
          ...account,
          created_by: user.id,
          balance: account.balance || 0
        }])
        .select(`
          *,
          members:shared_account_members(*)
        `)
        .single();

      if (error) throw error;

      setSharedAccounts(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Conta compartilhada criada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error creating shared account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta compartilhada.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Add money to shared account with contribution tracking
  const addMoneyToAccount = async (accountId: string, amount: number, description?: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase.rpc('add_contribution_to_shared_account', {
        p_account_id: accountId,
        p_amount: amount,
        p_description: description || null
      });

      if (error) throw error;

      // Refresh shared accounts to get updated balance
      await fetchSharedAccounts();

      toast({
        title: "Sucesso",
        description: `R$ ${amount.toFixed(2)} adicionado à conta.`,
      });
    } catch (error) {
      console.error('Error adding money to shared account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar dinheiro à conta.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Add member to shared account
  const addMemberToAccount = async (accountId: string, userId: string, role: 'member' = 'member') => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('shared_account_members')
        .insert([{
          shared_account_id: accountId,
          user_id: userId,
          role
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh shared accounts to get updated members
      await fetchSharedAccounts();

      toast({
        title: "Sucesso",
        description: "Membro adicionado à conta compartilhada.",
      });

      return data;
    } catch (error) {
      console.error('Error adding member to shared account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar membro à conta.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete shared account
  const deleteSharedAccount = async (accountId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('shared_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      // Remove from local state
      setSharedAccounts(prev => prev.filter(account => account.id !== accountId));

      toast({
        title: "Sucesso",
        description: "Conta compartilhada excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting shared account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta compartilhada.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSharedAccounts();
  }, [user]); // Re-fetch when user changes

  return {
    sharedAccounts,
    loading,
    createSharedAccount,
    addMoneyToAccount,
    addMemberToAccount,
    deleteSharedAccount,
    refreshSharedAccounts: fetchSharedAccounts
  };
};