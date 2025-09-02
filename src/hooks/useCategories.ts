import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  user_id: string;
  created_at: string;
}

export interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: CreateCategoryData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          color: categoryData.color || '#3B82F6',
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast({
        title: "Categoria criada",
        description: "Categoria adicionada com sucesso!"
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateCategory = async (id: string, updates: Partial<CreateCategoryData>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => 
        prev.map(c => c.id === id ? data : c)
      );
      toast({
        title: "Categoria atualizada",
        description: "Categoria atualizada com sucesso!"
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Categoria excluída",
        description: "Categoria removida com sucesso!"
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.filter(cat => cat.type === type);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
    refetch: fetchCategories
  };
};