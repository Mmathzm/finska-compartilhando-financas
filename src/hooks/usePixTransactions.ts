import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface PixTransaction {
  id: string;
  user_id: string;
  pix_key: string;
  amount: number;
  description: string | null;
  transaction_type: 'send' | 'receive';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PixTransactionInput {
  pix_key: string;
  amount: number;
  description?: string;
  transaction_type: 'send' | 'receive';
}

export const usePixTransactions = () => {
  const [transactions, setTransactions] = useState<PixTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pix_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions((data as PixTransaction[]) || []);
    } catch (error) {
      console.error('Error fetching PIX transactions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações PIX.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: PixTransactionInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pix_transactions')
        .insert([{
          ...transaction,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [data as PixTransaction, ...prev]);
      toast({
        title: "Sucesso",
        description: `PIX ${transaction.transaction_type === 'send' ? 'enviado' : 'recebido'} com sucesso.`,
      });

      return data;
    } catch (error) {
      console.error('Error adding PIX transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a transação PIX.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pix_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Sucesso",
        description: "Transação PIX removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting PIX transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a transação PIX.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions
  };
};
