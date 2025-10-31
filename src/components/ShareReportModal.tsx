import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useSharedReports, SharedReportInput } from '@/hooks/useSharedReports';
import { Share, Copy, Check } from 'lucide-react';

interface ShareReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: {
    period: string;
    monthlyData: any[];
    categoryData: any[];
    kpis: any;
  };
}

export const ShareReportModal = ({ open, onOpenChange, reportData }: ShareReportModalProps) => {
  const { createSharedReport } = useSharedReports();
  const [title, setTitle] = useState('Relatório Financeiro');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [expiresIn, setExpiresIn] = useState('7');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startDate = new Date(now);
      const monthsBack = reportData.period === '1m' ? 1 : reportData.period === '3m' ? 3 : reportData.period === '6m' ? 6 : 12;
      startDate.setMonth(now.getMonth() - monthsBack);

      const expiresAt = expiresIn !== 'never' 
        ? new Date(now.getTime() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const reportInput: SharedReportInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        report_type: 'analytics',
        report_config: {
          period: reportData.period,
          monthlyData: reportData.monthlyData,
          categoryData: reportData.categoryData,
          kpis: reportData.kpis
        },
        period_start: startDate.toISOString().split('T')[0],
        period_end: now.toISOString().split('T')[0],
        is_public: isPublic,
        expires_at: expiresAt
      };

      const result = await createSharedReport(reportInput);
      setShareUrl(result.shareUrl);
    } catch (error) {
      console.error('Error sharing report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Compartilhar Relatório
          </DialogTitle>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Relatório</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite um título"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione uma descrição"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatório Público</Label>
                <p className="text-sm text-muted-foreground">
                  Qualquer pessoa com o link pode visualizar
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Expira em</Label>
              <select
                id="expires"
                className="w-full p-2 border rounded-md"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
              >
                <option value="1">1 dia</option>
                <option value="7">7 dias</option>
                <option value="30">30 dias</option>
                <option value="never">Nunca</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleShare} disabled={loading || !title.trim()}>
                {loading ? 'Gerando...' : 'Gerar Link'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-success/10 border border-success rounded-lg">
              <p className="text-sm font-medium text-success">
                ✓ Relatório compartilhado com sucesso!
              </p>
            </div>

            <div className="space-y-2">
              <Label>Link de Compartilhamento</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button onClick={() => {
                setShareUrl('');
                onOpenChange(false);
              }}>
                Concluir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
