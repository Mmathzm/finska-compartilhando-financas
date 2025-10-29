import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Contribution {
  id: string;
  amount: number;
  description: string | null;
  created_at: string;
  user_id: string;
}

interface SharedAccountContributionsProps {
  accountId: string;
}

export const SharedAccountContributions = ({ accountId }: SharedAccountContributionsProps) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContributions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('shared_account_contributions')
          .select('*')
          .eq('shared_account_id', accountId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setContributions(data || []);
      } catch (error) {
        console.error('Error fetching contributions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('shared-account-contributions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shared_account_contributions',
          filter: `shared_account_id=eq.${accountId}`
        },
        () => {
          fetchContributions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId, user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Contribuições</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (contributions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Contribuições</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma contribuição registrada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Contribuições</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {contribution.user_id === user?.id ? 'VO' : 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {contribution.user_id === user?.id ? 'Você' : 'Membro'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(contribution.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {contribution.description && (
                      <p className="text-xs text-muted-foreground mt-1">{contribution.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-success font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {Number(contribution.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
