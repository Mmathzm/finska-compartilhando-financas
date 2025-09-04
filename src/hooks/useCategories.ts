import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
}

export interface CategoryInput {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add category
  const addCategory = async (category: CategoryInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...category,
          user_id: user.id,
          color: category.color || '#3B82F6',
          icon: category.icon || '📦'
        }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a categoria.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Get categories by type
  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.filter(category => category.type === type);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    addCategory,
    getCategoriesByType,
    refreshCategories: fetchCategories
  };
};