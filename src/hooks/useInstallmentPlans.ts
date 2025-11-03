import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface InstallmentPlan {
  id: string;
  user_id: string;
  description: string;
  total_amount: number;
  installment_count: number;
  installment_value: number;
  type: 'income' | 'expense';
  category_id: string | null;
  current_installment: number;
  status: 'active' | 'completed' | 'cancelled';
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface InstallmentPlanInput {
  description: string;
  total_amount: number;
  installment_count: number;
  type: 'income' | 'expense';
  category_id?: string;
  start_date?: string;
}

export const useInstallmentPlans = () => {
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPlans = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('installment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans((data as InstallmentPlan[]) || []);
    } catch (error) {
      console.error('Error fetching installment plans:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os parcelamentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPlan = async (plan: InstallmentPlanInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const installmentValue = plan.total_amount / plan.installment_count;

      const { data, error } = await supabase
        .from('installment_plans')
        .insert([{
          ...plan,
          user_id: user.id,
          installment_value: installmentValue,
          start_date: plan.start_date || new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;

      setPlans(prev => [data as InstallmentPlan, ...prev]);
      toast({
        title: "Sucesso",
        description: `Parcelamento criado: ${plan.installment_count}x de R$ ${installmentValue.toFixed(2)}`,
      });

      return data;
    } catch (error) {
      console.error('Error adding installment plan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o parcelamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePlan = async (id: string, updates: Partial<InstallmentPlanInput>) => {
    try {
      const { data, error } = await supabase
        .from('installment_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPlans(prev => prev.map(p => p.id === id ? data as InstallmentPlan : p));
      toast({
        title: "Sucesso",
        description: "Parcelamento atualizado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error updating installment plan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o parcelamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('installment_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlans(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Parcelamento removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting installment plan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o parcelamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user]);

  return {
    plans,
    loading,
    addPlan,
    updatePlan,
    deletePlan,
    refreshPlans: fetchPlans
  };
};
