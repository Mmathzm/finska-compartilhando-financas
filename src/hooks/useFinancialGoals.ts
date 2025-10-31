import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface FinancialGoal {
  id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  category_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoalInput {
  title: string;
  description?: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string;
  category_id?: string;
}

export const useFinancialGoals = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching financial goals:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as metas financeiras.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: FinancialGoalInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('financial_goals')
        .insert([{
          ...goal,
          user_id: user.id,
          current_amount: goal.current_amount || 0
        }])
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Meta financeira criada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error adding financial goal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a meta financeira.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoalInput>) => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => prev.map(g => g.id === id ? data : g));
      toast({
        title: "Sucesso",
        description: "Meta financeira atualizada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error updating financial goal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a meta financeira.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== id));
      toast({
        title: "Sucesso",
        description: "Meta financeira removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting financial goal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a meta financeira.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    refreshGoals: fetchGoals
  };
};
