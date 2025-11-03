import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface BankTransfer {
  id: string;
  user_id: string;
  account_type: 'savings' | 'checking' | 'investment' | 'external';
  amount: number;
  description: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface BankTransferInput {
  account_type: 'savings' | 'checking' | 'investment' | 'external';
  amount: number;
  description?: string;
}

export const useBankTransfers = () => {
  const [transfers, setTransfers] = useState<BankTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransfers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bank_transfers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers((data as BankTransfer[]) || []);
    } catch (error) {
      console.error('Error fetching bank transfers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transferências.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransfer = async (transfer: BankTransferInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bank_transfers')
        .insert([{
          ...transfer,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setTransfers(prev => [data as BankTransfer, ...prev]);
      toast({
        title: "Sucesso",
        description: "Transferência realizada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error adding bank transfer:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a transferência.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTransfer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_transfers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransfers(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Sucesso",
        description: "Transferência removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting bank transfer:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a transferência.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [user]);

  return {
    transfers,
    loading,
    addTransfer,
    deleteTransfer,
    refreshTransfers: fetchTransfers
  };
};
