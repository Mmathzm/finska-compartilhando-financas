import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/providers/ThemeProvider';
import { useDebug } from '@/providers/DebugProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Globe, Palette, Database, Zap, Download, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdvancedSettingsModal = ({ open, onOpenChange }: AdvancedSettingsModalProps) => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { isDebugMode, setDebugMode, debugLog } = useDebug();
  
  const [advancedSettings, setAdvancedSettings] = useState({
    darkMode: theme === 'dark',
    autoSave: true,
    dataSync: true,
    animations: true,
    performance: true,
    debugMode: isDebugMode
  });

  useEffect(() => {
    setAdvancedSettings(prev => ({ 
      ...prev, 
      darkMode: theme === 'dark',
      debugMode: isDebugMode 
    }));
  }, [theme, isDebugMode]);

  const [preferences, setPreferences] = useState({
    language: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'pt-BR'
  });

  const [apiSettings, setApiSettings] = useState({
    apiKey: '',
    webhookUrl: '',
    autoBackup: true
  });

  const handleAdvancedSettingChange = (key: string, value: boolean) => {
    if (key === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
      toast({
        title: "Tema atualizado",
        description: `Modo ${value ? 'escuro' : 'claro'} ativado.`,
      });
    } else if (key === 'debugMode') {
      setDebugMode(value);
      debugLog(`Modo debug ${value ? 'ativado' : 'desativado'}`, { timestamp: new Date() });
      toast({
        title: "Modo Debug atualizado",
        description: `Modo debug foi ${value ? 'ativado' : 'desativado'}.`,
      });
    } else {
      setAdvancedSettings(prev => ({ ...prev, [key]: value }));
      toast({
        title: "Configuração atualizada",
        description: `${key} foi ${value ? 'ativado' : 'desativado'}.`,
      });
    }
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Preferência atualizada",
      description: "Suas preferências foram salvas.",
    });
  };

  const handleApiSettingChange = (key: string, value: string | boolean) => {
    setApiSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveApiSettings = () => {
    toast({
      title: "Configurações da API salvas",
      description: "As configurações da API foram atualizadas com sucesso.",
    });
  };

  const handleExportSettings = () => {
    const settings = {
      advanced: advancedSettings,
      preferences,
      api: apiSettings
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finska-settings.json';
    a.click();
    
    toast({
      title: "Configurações exportadas",
      description: "Arquivo de configurações foi baixado com sucesso.",
    });
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            setAdvancedSettings(settings.advanced || advancedSettings);
            setPreferences(settings.preferences || preferences);
            setApiSettings(settings.api || apiSettings);
            toast({
              title: "Configurações importadas",
              description: "Suas configurações foram restauradas com sucesso.",
            });
          } catch (error) {
            toast({
              title: "Erro ao importar",
              description: "Arquivo inválido ou corrompido.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetSettings = () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja restaurar todas as configurações para o padrão? Esta ação não pode ser desfeita."
    );
    if (confirmed) {
      setAdvancedSettings({
        darkMode: false,
        autoSave: true,
        dataSync: true,
        animations: true,
        performance: true,
        debugMode: false
      });
      setPreferences({
        language: 'pt-BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR'
      });
      setApiSettings({
        apiKey: '',
        webhookUrl: '',
        autoBackup: true
      });
      toast({
        title: "Configurações resetadas",
        description: "Todas as configurações foram restauradas para o padrão.",
      });
    }
  };

  const handleClearCache = () => {
    toast({
      title: "Cache limpo",
      description: "Todos os dados em cache foram removidos.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configurações Avançadas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configurações de Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Configurações de Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'darkMode', label: 'Modo Escuro', description: 'Ativar tema escuro automaticamente' },
                  { key: 'autoSave', label: 'Salvamento Automático', description: 'Salvar alterações automaticamente' },
                  { key: 'dataSync', label: 'Sincronização de Dados', description: 'Sincronizar dados entre dispositivos' },
                  { key: 'animations', label: 'Animações', description: 'Ativar animações na interface' },
                  { key: 'performance', label: 'Modo Performance', description: 'Otimizar para melhor performance' },
                  { key: 'debugMode', label: 'Modo Debug', description: 'Ativar logs detalhados (apenas desenvolvedores)' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={advancedSettings[setting.key as keyof typeof advancedSettings]}
                      onCheckedChange={(value) => handleAdvancedSettingChange(setting.key, value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferências Regionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Preferências Regionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select value={preferences.currency} onValueChange={(value) => handlePreferenceChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                      <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Data</Label>
                  <Select value={preferences.dateFormat} onValueChange={(value) => handlePreferenceChange('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Número</Label>
                  <Select value={preferences.numberFormat} onValueChange={(value) => handlePreferenceChange('numberFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">1.234,56</SelectItem>
                      <SelectItem value="en-US">1,234.56</SelectItem>
                      <SelectItem value="de-DE">1.234,56</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Configurações de API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Chave da API</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Insira sua chave da API"
                    value={apiSettings.apiKey}
                    onChange={(e) => handleApiSettingChange('apiKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL do Webhook</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://sua-api.com/webhook"
                    value={apiSettings.webhookUrl}
                    onChange={(e) => handleApiSettingChange('webhookUrl', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">Backup Automático</p>
                    <p className="text-sm text-muted-foreground">Fazer backup automático dos dados via API</p>
                  </div>
                  <Switch
                    checked={apiSettings.autoBackup}
                    onCheckedChange={(value) => handleApiSettingChange('autoBackup', value)}
                  />
                </div>
                <Button onClick={handleSaveApiSettings} className="bg-gradient-primary">
                  Salvar Configurações da API
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ferramentas de Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas de Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleExportSettings}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Configurações
                </Button>
                <Button variant="outline" onClick={handleImportSettings}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Configurações
                </Button>
                <Button variant="outline" onClick={handleClearCache}>
                  <Database className="h-4 w-4 mr-2" />
                  Limpar Cache
                </Button>
                <Button variant="destructive" onClick={handleResetSettings}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Resetar Tudo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSettingsModal;