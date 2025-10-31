import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ReportExport {
  id: string;
  user_id: string;
  report_type: string;
  format: string;
  period_start: string;
  period_end: string;
  filters?: any;
  created_at: string;
}

export interface ReportExportInput {
  report_type: string;
  format: string;
  period_start: string;
  period_end: string;
  filters?: any;
}

export const useReportExports = () => {
  const [exports, setExports] = useState<ReportExport[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchExports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('report_exports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExports(data || []);
    } catch (error) {
      console.error('Error fetching report exports:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExport = async (exportData: ReportExportInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('report_exports')
        .insert([{
          ...exportData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setExports(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: `Relatório em ${exportData.format.toUpperCase()} exportado com sucesso.`,
      });

      return data;
    } catch (error) {
      console.error('Error creating report export:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteExport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('report_exports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExports(prev => prev.filter(e => e.id !== id));
      toast({
        title: "Sucesso",
        description: "Histórico de exportação removido.",
      });
    } catch (error) {
      console.error('Error deleting report export:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o histórico.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchExports();
  }, [user]);

  return {
    exports,
    loading,
    createExport,
    deleteExport,
    refreshExports: fetchExports
  };
};
