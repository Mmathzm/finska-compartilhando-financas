import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Eye, EyeOff, Smartphone, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrivacySecurityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacySecurityModal = ({ open, onOpenChange }: PrivacySecurityModalProps) => {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricAuth: true,
    loginNotifications: true,
    dataEncryption: true
  });

  const [sessions] = useState([
    { id: 1, device: 'Chrome - Windows', location: 'São Paulo, SP', lastActive: '2 minutos atrás', current: true },
    { id: 2, device: 'Safari - iPhone', location: 'São Paulo, SP', lastActive: '1 hora atrás', current: false },
    { id: 3, device: 'Firefox - Windows', location: 'Rio de Janeiro, RJ', lastActive: '2 dias atrás', current: false }
  ]);

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Senha alterada!",
      description: "Sua senha foi alterada com sucesso.",
    });
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleSecuritySettingChange = (key: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Configuração atualizada",
      description: "Sua configuração de segurança foi salva.",
    });
  };

  const handleTerminateSession = (sessionId: number) => {
    const confirmed = window.confirm("Tem certeza que deseja encerrar esta sessão?");
    if (confirmed) {
      toast({
        title: "Sessão encerrada",
        description: "A sessão foi encerrada com sucesso.",
      });
    }
  };

  const handleDownloadData = () => {
    toast({
      title: "Download iniciado",
      description: "Seus dados estão sendo preparados para download.",
    });
  };

  const handleDeleteData = () => {
    const confirmed = window.confirm(
      "ATENÇÃO: Esta ação irá excluir permanentemente todos os seus dados. Esta ação não pode ser desfeita. Tem certeza?"
    );
    if (confirmed) {
      toast({
        title: "Dados excluídos",
        description: "Todos os seus dados foram marcados para exclusão.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacidade e Segurança
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  />
                </div>
                <Button onClick={handlePasswordChange} className="bg-gradient-primary w-fit">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'twoFactorAuth', label: 'Autenticação de Dois Fatores', description: 'Adiciona uma camada extra de segurança' },
                  { key: 'biometricAuth', label: 'Autenticação Biométrica', description: 'Login com impressão digital ou Face ID' },
                  { key: 'loginNotifications', label: 'Notificações de Login', description: 'Receber alertas sobre novos logins' },
                  { key: 'dataEncryption', label: 'Criptografia de Dados', description: 'Criptografar dados sensíveis' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={securitySettings[setting.key as keyof typeof securitySettings]}
                      onCheckedChange={(value) => handleSecuritySettingChange(setting.key, value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sessões Ativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Sessões Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{session.device}</p>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                      <p className="text-xs text-muted-foreground">{session.lastActive}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.current && (
                        <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Atual</span>
                      )}
                      {!session.current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          Encerrar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Controle de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">Baixar Meus Dados</p>
                    <p className="text-sm text-muted-foreground">Faça download de todos os seus dados</p>
                  </div>
                  <Button variant="outline" onClick={handleDownloadData}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                  <div>
                    <p className="font-medium text-destructive">Excluir Todos os Dados</p>
                    <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteData}>
                    Excluir Dados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacySecurityModal;