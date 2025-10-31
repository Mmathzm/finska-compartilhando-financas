import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface SharedReport {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  report_type: 'analytics' | 'transactions' | 'categories' | 'goals' | 'custom';
  report_config: any;
  period_start: string;
  period_end: string;
  is_public: boolean;
  access_token: string;
  expires_at?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface SharedReportInput {
  title: string;
  description?: string;
  report_type: SharedReport['report_type'];
  report_config: any;
  period_start: string;
  period_end: string;
  is_public?: boolean;
  expires_at?: string;
}

export interface SharedReportAccess {
  id: string;
  shared_report_id: string;
  user_id?: string;
  email?: string;
  can_edit: boolean;
  accessed_at?: string;
  created_at: string;
}

export const useSharedReports = () => {
  const [reports, setReports] = useState<SharedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shared_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data || []) as SharedReport[]);
    } catch (error) {
      console.error('Error fetching shared reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSharedReport = async (report: SharedReportInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('shared_reports')
        .insert([{
          ...report,
          owner_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [data as SharedReport, ...prev]);
      
      // Gerar link de compartilhamento
      const shareUrl = `${window.location.origin}/shared-report/${data.id}?token=${data.access_token}`;
      
      // Copiar para clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Relatório compartilhado!",
        description: "Link copiado para a área de transferência.",
      });

      return { report: data, shareUrl };
    } catch (error) {
      console.error('Error creating shared report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar o relatório.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSharedReport = async (id: string, updates: Partial<SharedReportInput>) => {
    try {
      const { data, error } = await supabase
        .from('shared_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReports(prev => prev.map(r => r.id === id ? data as SharedReport : r));
      toast({
        title: "Sucesso",
        description: "Relatório atualizado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error updating shared report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o relatório.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSharedReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReports(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Sucesso",
        description: "Compartilhamento removido.",
      });
    } catch (error) {
      console.error('Error deleting shared report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o compartilhamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const grantAccess = async (reportId: string, email: string, canEdit: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('shared_report_access')
        .insert([{
          shared_report_id: reportId,
          email,
          can_edit: canEdit
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Acesso concedido a ${email}.`,
      });

      return data;
    } catch (error) {
      console.error('Error granting access:', error);
      toast({
        title: "Erro",
        description: "Não foi possível conceder acesso.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const revokeAccess = async (accessId: string) => {
    try {
      const { error } = await supabase
        .from('shared_report_access')
        .delete()
        .eq('id', accessId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Acesso revogado.",
      });
    } catch (error) {
      console.error('Error revoking access:', error);
      toast({
        title: "Erro",
        description: "Não foi possível revogar o acesso.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const incrementViews = async (reportId: string, accessToken?: string) => {
    try {
      const { error } = await supabase.rpc('increment_report_views', {
        p_report_id: reportId,
        p_access_token: accessToken
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  return {
    reports,
    loading,
    createSharedReport,
    updateSharedReport,
    deleteSharedReport,
    grantAccess,
    revokeAccess,
    incrementViews,
    refreshReports: fetchReports
  };
};
