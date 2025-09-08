import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category_id: string;
  category?: {
    name: string;
    color: string;
    icon: string;
  };
  description: string;
  amount: number;
  date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionInput {
  type: 'income' | 'expense';
  category_id: string;
  description: string;
  amount: number;
  date?: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, color, icon)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add transaction
  const addTransaction = async (transaction: TransactionInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: user.id,
          date: transaction.date || new Date().toISOString().split('T')[0]
        }])
        .select(`
          *,
          category:categories(name, color, icon)
        `)
        .single();

      if (error) throw error;

      setTransactions(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a transação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Sucesso",
        description: "Transação removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a transação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update transaction
  const updateTransaction = async (id: string, updates: Partial<TransactionInput>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:categories(name, color, icon)
        `)
        .single();

      if (error) throw error;

      setTransactions(prev => prev.map(t => t.id === id ? data : t));
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a transação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]); // Re-fetch when user changes

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    refreshTransactions: fetchTransactions
  };
};