import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  filter_config: {
    period?: string;
    categories?: string[];
    dateRange?: { start: string; end: string };
    minAmount?: number;
    maxAmount?: number;
    transactionType?: 'income' | 'expense' | 'all';
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedFilterInput {
  name: string;
  description?: string;
  filter_config: SavedFilter['filter_config'];
  is_default?: boolean;
}

export const useSavedFilters = () => {
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchFilters = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFilters((data || []) as SavedFilter[]);
    } catch (error) {
      console.error('Error fetching saved filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFilter = async (filter: SavedFilterInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Se este filtro for padrão, desmarcar outros
      if (filter.is_default) {
        await supabase
          .from('saved_filters')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('saved_filters')
        .insert([{
          ...filter,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setFilters(prev => [data as SavedFilter, ...prev]);
      toast({
        title: "Sucesso",
        description: "Filtro salvo com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error saving filter:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o filtro.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateFilter = async (id: string, updates: Partial<SavedFilterInput>) => {
    try {
      // Se este filtro for marcado como padrão, desmarcar outros
      if (updates.is_default) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('saved_filters')
            .update({ is_default: false })
            .eq('user_id', user.id)
            .eq('is_default', true)
            .neq('id', id);
        }
      }

      const { data, error } = await supabase
        .from('saved_filters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFilters(prev => prev.map(f => f.id === id ? data as SavedFilter : f));
      toast({
        title: "Sucesso",
        description: "Filtro atualizado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error updating filter:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o filtro.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteFilter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFilters(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Sucesso",
        description: "Filtro removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o filtro.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchFilters();
  }, [user]);

  return {
    filters,
    loading,
    saveFilter,
    updateFilter,
    deleteFilter,
    refreshFilters: fetchFilters
  };
};
