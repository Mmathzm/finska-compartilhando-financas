import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface SharedAccountInvitation {
  id: string;
  shared_account_id: string;
  invited_by: string;
  invited_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  expires_at: string;
  shared_account?: {
    id: string;
    name: string;
    description?: string;
  };
}

export const useSharedAccountInvitations = () => {
  const [invitations, setInvitations] = useState<SharedAccountInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch invitations for current user
  const fetchInvitations = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shared_account_invitations')
        .select(`
          *,
          shared_account:shared_accounts(id, name, description)
        `)
        .eq('invited_email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((data as SharedAccountInvitation[]) || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os convites.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Send invitation
  const sendInvitation = async (sharedAccountId: string, email: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('shared_account_invitations')
        .insert([{
          shared_account_id: sharedAccountId,
          invited_by: user.id,
          invited_email: email.toLowerCase().trim(),
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este email já possui um convite pendente para esta conta.');
        }
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Convite enviado para ${email}`,
      });

      return data;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o convite.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Accept invitation
  const acceptInvitation = async (invitationId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Get invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('shared_account_invitations')
        .select('shared_account_id')
        .eq('id', invitationId)
        .single();

      if (inviteError) throw inviteError;

      // Add user as member
      const { error: memberError } = await supabase
        .from('shared_account_members')
        .insert([{
          shared_account_id: invitation.shared_account_id,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) throw memberError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('shared_account_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

      toast({
        title: "Sucesso",
        description: "Convite aceito! Você agora é membro da conta compartilhada.",
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o convite.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Reject invitation
  const rejectInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('shared_account_invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId);

      if (error) throw error;

      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

      toast({
        title: "Convite rejeitado",
        description: "O convite foi rejeitado.",
      });
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o convite.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Cancel invitation (by sender)
  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('shared_account_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado.",
      });
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o convite.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Get pending invitations for a specific account
  const getAccountInvitations = async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from('shared_account_invitations')
        .select('*')
        .eq('shared_account_id', accountId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching account invitations:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  return {
    invitations,
    loading,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    cancelInvitation,
    getAccountInvitations,
    refreshInvitations: fetchInvitations
  };
};
