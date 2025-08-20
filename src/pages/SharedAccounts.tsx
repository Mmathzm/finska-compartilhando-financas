import { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SharedAccounts = () => {
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const { toast } = useToast();

  const [sharedAccounts, setSharedAccounts] = useState([
    {
      id: '1',
      name: 'Conta da Casa',
      balance: 2500.00,
      members: [
        { id: '1', name: 'Você', email: 'voce@email.com', avatar: '', isOwner: true },
        { id: '2', name: 'Maria Silva', email: 'maria@email.com', avatar: '', isOwner: false },
        { id: '3', name: 'João Santos', email: 'joao@email.com', avatar: '', isOwner: false },
      ],
      pendingInvites: ['carlos@email.com']
    },
    {
      id: '2',
      name: 'Viagem para Europa',
      balance: 8300.00,
      members: [
        { id: '1', name: 'Você', email: 'voce@email.com', avatar: '', isOwner: true },
        { id: '4', name: 'Ana Costa', email: 'ana@email.com', avatar: '', isOwner: false },
      ],
      pendingInvites: []
    }
  ]);

  const [pendingInvites, setPendingInvites] = useState([
    {
      id: '1',
      accountName: 'Conta do Trabalho',
      inviterName: 'Pedro Oliveira',
      inviterEmail: 'pedro@empresa.com',
      inviteDate: '2024-01-15'
    }
  ]);

  const handleSendInvite = () => {
    if (newInviteEmail && selectedAccount) {
      setSharedAccounts(prev => prev.map(account => 
        account.id === selectedAccount 
          ? { ...account, pendingInvites: [...account.pendingInvites, newInviteEmail] }
          : account
      ));
      
      toast({
        title: "Convite enviado!",
        description: `Convite para ${newInviteEmail} foi enviado com sucesso.`,
      });
      setNewInviteEmail('');
      setSelectedAccount(null);
    } else {
      toast({
        title: "Erro",
        description: "Selecione uma conta e digite um email válido.",
        variant: "destructive"
      });
    }
  };

  const handleAcceptInvite = (inviteId: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
    toast({
      title: "Convite aceito!",
      description: "Você agora faz parte da conta compartilhada.",
    });
  };

  const handleRejectInvite = (inviteId: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
    toast({
      title: "Convite recusado",
      description: "O convite foi recusado.",
    });
  };

  const handleCreateAccount = () => {
    if (!newAccountName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a conta.",
        variant: "destructive"
      });
      return;
    }

    const newAccount = {
      id: Date.now().toString(),
      name: newAccountName,
      balance: 0,
      members: [
        { id: '1', name: 'Você', email: 'voce@email.com', avatar: '', isOwner: true }
      ],
      pendingInvites: []
    };

    setSharedAccounts(prev => [...prev, newAccount]);
    setNewAccountName('');
    setShowNewAccountDialog(false);
    
    toast({
      title: "Conta criada!",
      description: "Nova conta compartilhada criada com sucesso.",
    });
  };

  const handleRemovePendingInvite = (accountId: string, email: string) => {
    setSharedAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, pendingInvites: account.pendingInvites.filter(invite => invite !== email) }
        : account
    ));
    
    toast({
      title: "Convite cancelado",
      description: "O convite foi cancelado com sucesso.",
    });
  };

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
                  >
                    Criar Conta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Convites Pendentes */}
        {pendingInvites.length > 0 && (
          <Card className="shadow-card border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Mail className="h-5 w-5" />
                Convites Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div>
                      <h3 className="font-semibold">{invite.accountName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Convidado por {invite.inviterName} ({invite.inviterEmail})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptInvite(invite.id)}
                        className="bg-success hover:bg-success/90"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aceitar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectInvite(invite.id)}
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
                    {account.members.length} membros
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Saldo */}
                  <div className="p-4 rounded-lg bg-gradient-primary text-primary-foreground">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-sm opacity-90">Saldo Atual</span>
                    </div>
                    <p className="text-2xl font-bold">
                      R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Membros */}
                  <div>
                    <h4 className="font-semibold mb-3">Membros</h4>
                    <div className="space-y-2">
                      {account.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          {member.isOwner && (
                            <Badge variant="outline" className="text-xs">Dono</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Convites Pendentes */}
                  {account.pendingInvites.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Convites Pendentes</h4>
                      <div className="space-y-2">
                        {account.pendingInvites.map((email, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded bg-muted">
                            <span className="text-sm">{email}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Pendente</Badge>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleRemovePendingInvite(account.id, email)}
                              >
                                <X className="h-3 w-3" />
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
                        disabled={!newInviteEmail || selectedAccount !== account.id}
                      >
                        <Send className="h-4 w-4" />
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