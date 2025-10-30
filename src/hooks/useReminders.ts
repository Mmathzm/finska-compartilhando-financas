import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Reminder = Database['public']['Tables']['reminders']['Row'];
type ReminderInsert = Database['public']['Tables']['reminders']['Insert'];
type ReminderUpdate = Database['public']['Tables']['reminders']['Update'];

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchReminders = async () => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os lembretes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (reminder: Omit<ReminderInsert, 'user_id'>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminder,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => [...prev, data]);
      
      toast({
        title: "Sucesso",
        description: "Lembrete criado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lembrete.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateReminder = async (id: string, updates: ReminderUpdate) => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => prev.map(r => r.id === id ? data : r));
      
      toast({
        title: "Sucesso",
        description: "Lembrete atualizado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lembrete.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Lembrete excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lembrete.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const markAsPaid = async (id: string) => {
    return updateReminder(id, { is_completed: true });
  };

  useEffect(() => {
    fetchReminders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('reminders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReminders(prev => [...prev, payload.new as Reminder]);
          } else if (payload.eventType === 'UPDATE') {
            setReminders(prev => prev.map(r => r.id === payload.new.id ? payload.new as Reminder : r));
          } else if (payload.eventType === 'DELETE') {
            setReminders(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    reminders,
    loading,
    createReminder,
    updateReminder,
    deleteReminder,
    markAsPaid,
    refreshReminders: fetchReminders
  };
};
