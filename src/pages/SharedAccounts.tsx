import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Send, 
  Check, 
  X, 
  DollarSign,
  UserPlus,
  Mail,
  Trash2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSharedAccounts } from '@/hooks/useSharedAccounts';
import { useSharedAccountInvitations } from '@/hooks/useSharedAccountInvitations';
import { useAuth } from '@/hooks/useAuth';

const SharedAccounts = () => {
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [addMoneyAccountId, setAddMoneyAccountId] = useState<string | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { sharedAccounts, loading, createSharedAccount, addMoneyToAccount, refreshSharedAccounts } = useSharedAccounts();
  const { 
    invitations, 
    loading: invitationsLoading,
    sendInvitation, 
    acceptInvitation, 
    rejectInvitation,
    cancelInvitation,
    getAccountInvitations 
  } = useSharedAccountInvitations();

  const [accountInvitations, setAccountInvitations] = useState<Record<string, any[]>>({});

  const handleSendInvite = async () => {
    if (!newInviteEmail || !selectedAccount) {
      toast({
        title: "Erro",
        description: "Digite um email válido.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendInvitation(selectedAccount, newInviteEmail);
      setNewInviteEmail('');
      setSelectedAccount(null);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    setIsLoading(true);
    try {
      await acceptInvitation(inviteId);
      // Refresh shared accounts list to show the newly joined account
      await refreshSharedAccounts();
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    setIsLoading(true);
    try {
      await rejectInvitation(inviteId);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a conta.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await createSharedAccount({ name: newAccountName });
      setNewAccountName('');
      setShowNewAccountDialog(false);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePendingInvite = async (invitationId: string) => {
    setIsLoading(true);
    try {
      await cancelInvitation(invitationId);
      // Refresh account invitations
      sharedAccounts.forEach(async (account) => {
        const invites = await getAccountInvitations(account.id);
        setAccountInvitations(prev => ({ ...prev, [account.id]: invites }));
      });
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addMoneyAmount);
    
    if (!addMoneyAccountId || !addMoneyAmount || amount <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await addMoneyToAccount(addMoneyAccountId, amount);
      setAddMoneyAmount('');
      setAddMoneyAccountId(null);
      setShowAddMoneyDialog(false);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  const openAddMoneyDialog = (accountId: string) => {
    setAddMoneyAccountId(accountId);
    setShowAddMoneyDialog(true);
  };

  // Load account invitations when accounts change
  useEffect(() => {
    const loadAccountInvitations = async () => {
      for (const account of sharedAccounts) {
        const invites = await getAccountInvitations(account.id);
        setAccountInvitations(prev => ({ ...prev, [account.id]: invites }));
      }
    };
    
    if (sharedAccounts.length > 0) {
      loadAccountInvitations();
    }
  }, [sharedAccounts]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas Compartilhadas</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas contas em grupo</p>
          </div>
          <Dialog open={showNewAccountDialog} onOpenChange={setShowNewAccountDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta Compartilhada</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Nome da Conta</Label>
                  <Input
                    id="account-name"
                    placeholder="Ex: Conta da Casa"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowNewAccountDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-primary"
                    onClick={handleCreateAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Criar Conta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Modal para Adicionar Dinheiro */}
        <Dialog open={showAddMoneyDialog} onOpenChange={setShowAddMoneyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Dinheiro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="money-amount">Valor (R$)</Label>
                <Input
                  id="money-amount"
                  type="number"
                  placeholder="0,00"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddMoneyDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-gradient-primary"
                  onClick={handleAddMoney}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <DollarSign className="h-4 w-4 mr-2" />}
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Convites Pendentes */}
        {invitations.length > 0 && (
          <Card className="shadow-card border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Mail className="h-5 w-5" />
                Convites Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div>
                      <h3 className="font-semibold">{invite.shared_account?.name || 'Conta Compartilhada'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Convite recebido
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptInvite(invite.id)}
                        disabled={isLoading}
                        className="bg-success hover:bg-success/90"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                        Aceitar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectInvite(invite.id)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Minhas Contas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sharedAccounts.map((account) => (
            <Card key={account.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {account.name}
                  </CardTitle>
                  <Badge variant="secondary">
                    {account.members?.length || 0} membros
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                   {/* Saldo */}
                   <div className="p-4 rounded-lg bg-gradient-primary text-primary-foreground">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <DollarSign className="h-5 w-5" />
                         <span className="text-sm opacity-90">Saldo Atual</span>
                       </div>
                       <Button 
                         size="sm" 
                         variant="secondary"
                         onClick={() => openAddMoneyDialog(account.id)}
                         className="bg-white/20 hover:bg-white/30 text-white border-0"
                       >
                         <Plus className="h-4 w-4 mr-1" />
                         Adicionar
                       </Button>
                     </div>
                      <p className="text-2xl font-bold">
                        R$ {Number(account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                   </div>

                  {/* Membros */}
                  {account.members && account.members.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Membros</h4>
                      <div className="space-y-2">
                        {account.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {member.user_id === user?.id ? 'VO' : 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {member.user_id === user?.id ? 'Você' : 'Membro'}
                                </p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">{member.role}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Convites Pendentes */}
                  {accountInvitations[account.id]?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Convites Pendentes</h4>
                      <div className="space-y-2">
                        {accountInvitations[account.id].map((invitation: any) => (
                          <div key={invitation.id} className="flex items-center justify-between p-2 rounded bg-muted">
                            <span className="text-sm">{invitation.invited_email}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Pendente</Badge>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleRemovePendingInvite(invitation.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Convidar Novo Membro */}
                  <div className="border-t pt-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`invite-${account.id}`} className="sr-only">
                          Email para convidar
                        </Label>
                        <Input
                          id={`invite-${account.id}`}
                          placeholder="Email para convidar"
                          value={selectedAccount === account.id ? newInviteEmail : ''}
                          onChange={(e) => {
                            setNewInviteEmail(e.target.value);
                            setSelectedAccount(account.id);
                          }}
                        />
                      </div>
                      <Button 
                        size="sm"
                        onClick={handleSendInvite}
                        disabled={!newInviteEmail || selectedAccount !== account.id || isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Criar Nova Conta */}
        <Card className="shadow-card border-dashed border-2 border-primary/30">
          <CardContent className="p-8">
            <div className="text-center">
              <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Criar Nova Conta Compartilhada</h3>
              <p className="text-muted-foreground mb-4">
                Organize suas finanças em grupo de forma simples e eficiente
              </p>
              <Button 
                className="bg-gradient-primary"
                onClick={() => setShowNewAccountDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedAccounts;