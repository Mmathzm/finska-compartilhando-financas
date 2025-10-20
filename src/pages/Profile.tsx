import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Target,
  Camera,
  Save,
  Trash2,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PaymentMethodsModal from '@/components/PaymentMethodsModal';
import PrivacySecurityModal from '@/components/PrivacySecurityModal';
import AdvancedSettingsModal from '@/components/AdvancedSettingsModal';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

  const [profileData, setProfileData] = useState({
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-9999',
    location: 'São Paulo, SP',
    bio: 'Apaixonada por organização financeira e investimentos.',
    birthDate: '1990-05-15'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    paymentReminders: true,
    budgetAlerts: true
  });

  const financialGoals = [
    { name: 'Fundo de Emergência', current: 8500, target: 12000, percentage: 71 },
    { name: 'Viagem para Europa', current: 3200, target: 8000, percentage: 40 },
    { name: 'Novo Carro', current: 15000, target: 45000, percentage: 33 }
  ];

  const recentActivity = [
    { action: 'Meta atingida', description: 'Economia mensal de R$ 1.500', date: '2 dias atrás' },
    { action: 'Novo convite', description: 'João te convidou para conta compartilhada', date: '5 dias atrás' },
    { action: 'Lembrete criado', description: 'Conta de luz vencendo em 25/01', date: '1 semana atrás' }
  ];

  const handleSave = () => {
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
    setIsEditing(false);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Configuração atualizada",
      description: "Sua preferência de notificação foi salva.",
    });
  };

  const handlePaymentMethods = () => {
    setShowPaymentModal(true);
  };

  const handlePrivacySecurity = () => {
    setShowPrivacyModal(true);
  };

  const handleAdvancedSettings = () => {
    setShowAdvancedModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
    );
    if (confirmed) {
      toast({
        title: "Conta excluída",
        description: "Sua conta foi marcada para exclusão.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais e preferências</p>
          </div>
          <Button 
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="" alt={profileData.name} />
                      <AvatarFallback className="text-lg">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{profileData.name}</h3>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <Badge className="mt-2 bg-gradient-primary">Usuário Premium</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 mt-6">
                    <Button onClick={handleSave} className="bg-gradient-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Notificações por Email', description: 'Receber atualizações por email' },
                    { key: 'pushNotifications', label: 'Notificações Push', description: 'Receber notificações no dispositivo' },
                    { key: 'weeklyReports', label: 'Relatórios Semanais', description: 'Resumo semanal das suas finanças' },
                    { key: 'paymentReminders', label: 'Lembretes de Pagamento', description: 'Notificações sobre contas a vencer' },
                    { key: 'budgetAlerts', label: 'Alertas de Orçamento', description: 'Avisos quando exceder limites' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={(value) => handleNotificationChange(item.key, value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Settings className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-center">Suas Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <p className="text-2xl font-bold text-primary">127</p>
                  <p className="text-sm text-muted-foreground">Dias no Finska</p>
                </div>
                <Separator />
                <div>
                  <p className="text-2xl font-bold text-success">R$ 8.430</p>
                  <p className="text-sm text-muted-foreground">Total Economizado</p>
                </div>
                <Separator />
                <div>
                  <p className="text-2xl font-bold text-warning">1.250</p>
                  <p className="text-sm text-muted-foreground">Pontos Conquistados</p>
                </div>
              </CardContent>
            </Card>

            {/* Metas Financeiras */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Metas Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{goal.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {goal.percentage}%
                        </Badge>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-primary transition-all duration-300"
                          style={{ width: `${goal.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        R$ {goal.current.toLocaleString('pt-BR')} / R$ {goal.target.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configurações Avançadas */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handlePaymentMethods}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Métodos de Pagamento
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handlePrivacySecurity}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privacidade e Segurança
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleAdvancedSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações Avançadas
                </Button>
                <Separator />
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da Conta
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modais */}
        <PaymentMethodsModal 
          open={showPaymentModal} 
          onOpenChange={setShowPaymentModal} 
        />
        <PrivacySecurityModal 
          open={showPrivacyModal} 
          onOpenChange={setShowPrivacyModal} 
        />
        <AdvancedSettingsModal 
          open={showAdvancedModal} 
          onOpenChange={setShowAdvancedModal} 
        />
      </div>
    </div>
  );
};

export default Profile;