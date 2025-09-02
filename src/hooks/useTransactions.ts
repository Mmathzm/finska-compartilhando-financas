import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  user_id: string;
  category_id?: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: string;
  shared_account_id?: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
}

export interface CreateTransactionData {
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  category_id?: string;
  date?: string;
  shared_account_id?: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar transações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: CreateTransactionData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          date: transactionData.date || new Date().toISOString().split('T')[0],
          user_id: user.id
        }])
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .single();

      if (error) throw error;

      setTransactions(prev => [data, ...prev]);
      toast({
        title: "Transação criada",
        description: "Transação adicionada com sucesso!"
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar transação",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateTransaction = async (id: string, updates: Partial<CreateTransactionData>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .single();

      if (error) throw error;

      setTransactions(prev => 
        prev.map(t => t.id === id ? data : t)
      );
      toast({
        title: "Transação atualizada",
        description: "Transação atualizada com sucesso!"
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar transação",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Transação excluída",
        description: "Transação removida com sucesso!"
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  };
};