import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, CreditCard, Send, Calendar, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePixTransactions } from '@/hooks/usePixTransactions';
import { useBankTransfers } from '@/hooks/useBankTransfers';
import { useInstallmentPlans } from '@/hooks/useInstallmentPlans';

const Transactions = () => {
  const [pixData, setPixData] = useState({ key: '', amount: '', description: '' });
  const [transferData, setTransferData] = useState({ account: '', amount: '', description: '' });
  const [installmentData, setInstallmentData] = useState({ 
    description: '', 
    amount: '', 
    installments: '1',
    type: 'expense' as 'expense' | 'income'
  });
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();
  const { addTransaction: addPixTransaction } = usePixTransactions();
  const { addTransfer } = useBankTransfers();
  const { addPlan } = useInstallmentPlans();

  const handlePixTransaction = async () => {
    if (!pixData.key || !pixData.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPixTransaction({
        pix_key: pixData.key,
        amount: parseFloat(pixData.amount),
        description: pixData.description || undefined,
        transaction_type: 'send'
      });
      setPixData({ key: '', amount: '', description: '' });
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleTransfer = async () => {
    if (!transferData.account || !transferData.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTransfer({
        account_type: transferData.account as 'savings' | 'checking' | 'investment' | 'external',
        amount: parseFloat(transferData.amount),
        description: transferData.description || undefined
      });
      setTransferData({ account: '', amount: '', description: '' });
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleInstallmentTransaction = async () => {
    if (!installmentData.description || !installmentData.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPlan({
        description: installmentData.description,
        total_amount: parseFloat(installmentData.amount),
        installment_count: parseInt(installmentData.installments),
        type: installmentData.type
      });
      setInstallmentData({ description: '', amount: '', installments: '1', type: 'expense' });
    } catch (error) {
      // Error already handled by hook
    }
  };

  const generateQRCode = () => {
    if (!pixData.key || !pixData.amount) {
      toast({
        title: "Erro",
        description: "Preencha a chave PIX e o valor para gerar o QR Code",
        variant: "destructive",
      });
      return;
    }

    setShowQRCode(true);
    toast({
      title: "QR Code gerado!",
      description: "QR Code criado com sucesso para o PIX",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Transações</h1>
        <p className="text-muted-foreground">
          Gerencie todas as suas transações financeiras
        </p>
      </div>

      <Tabs defaultValue="pix" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pix" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            PIX
          </TabsTrigger>
          <TabsTrigger value="qrcode" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transferência
          </TabsTrigger>
          <TabsTrigger value="installments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Parcelas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pix">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                PIX
              </CardTitle>
              <CardDescription>
                Transfira dinheiro instantaneamente usando PIX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pix-key">Chave PIX</Label>
                <Input
                  id="pix-key"
                  placeholder="Email, CPF, telefone ou chave aleatória"
                  value={pixData.key}
                  onChange={(e) => setPixData({ ...pixData, key: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pix-amount">Valor (R$)</Label>
                <Input
                  id="pix-amount"
                  type="number"
                  placeholder="0,00"
                  value={pixData.amount}
                  onChange={(e) => setPixData({ ...pixData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pix-description">Descrição (opcional)</Label>
                <Textarea
                  id="pix-description"
                  placeholder="Descrição da transferência"
                  value={pixData.description}
                  onChange={(e) => setPixData({ ...pixData, description: e.target.value })}
                />
              </div>
              <Button onClick={handlePixTransaction} className="w-full">
                Enviar PIX
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                QR Code PIX
              </CardTitle>
              <CardDescription>
                Gere um QR Code para receber pagamentos via PIX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qr-key">Sua Chave PIX</Label>
                <Input
                  id="qr-key"
                  placeholder="Sua chave PIX para receber"
                  value={pixData.key}
                  onChange={(e) => setPixData({ ...pixData, key: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="qr-amount">Valor (R$)</Label>
                <Input
                  id="qr-amount"
                  type="number"
                  placeholder="0,00"
                  value={pixData.amount}
                  onChange={(e) => setPixData({ ...pixData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="qr-description">Descrição (opcional)</Label>
                <Textarea
                  id="qr-description"
                  placeholder="Descrição do pagamento"
                  value={pixData.description}
                  onChange={(e) => setPixData({ ...pixData, description: e.target.value })}
                />
              </div>
              <Button onClick={generateQRCode} className="w-full">
                Gerar QR Code
              </Button>
              
              {showQRCode && pixData.key && pixData.amount && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <QRCodeSVG 
                      value={`pix://${pixData.key}?amount=${pixData.amount}${pixData.description ? `&description=${encodeURIComponent(pixData.description)}` : ''}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    QR Code para receber R$ {pixData.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chave: {pixData.key}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Transferência Bancária
              </CardTitle>
              <CardDescription>
                Transfira para conta bancária ou conta do mesmo banco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="transfer-account">Conta de Destino</Label>
                <Select 
                  value={transferData.account}
                  onValueChange={(value) => setTransferData({ ...transferData, account: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Conta Poupança</SelectItem>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="investment">Conta Investimento</SelectItem>
                    <SelectItem value="external">Conta Externa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transfer-amount">Valor (R$)</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="0,00"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="transfer-description">Descrição (opcional)</Label>
                <Textarea
                  id="transfer-description"
                  placeholder="Descrição da transferência"
                  value={transferData.description}
                  onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                />
              </div>
              <Button onClick={handleTransfer} className="w-full">
                Realizar Transferência
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Transações Parceladas
              </CardTitle>
              <CardDescription>
                Divida uma compra ou receita em parcelas mensais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="installment-type">Tipo</Label>
                <Select 
                  value={installmentData.type}
                  onValueChange={(value) => setInstallmentData({ ...installmentData, type: value as 'expense' | 'income' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="installment-description">Descrição</Label>
                <Input
                  id="installment-description"
                  placeholder="Ex: Compra do sofá, Freelance projeto X"
                  value={installmentData.description}
                  onChange={(e) => setInstallmentData({ ...installmentData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="installment-amount">Valor Total (R$)</Label>
                <Input
                  id="installment-amount"
                  type="number"
                  placeholder="0,00"
                  value={installmentData.amount}
                  onChange={(e) => setInstallmentData({ ...installmentData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="installment-count">Número de Parcelas</Label>
                <Select 
                  value={installmentData.installments}
                  onValueChange={(value) => setInstallmentData({ ...installmentData, installments: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {installmentData.amount && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium">Resumo do Parcelamento:</p>
                  <p className="text-sm text-muted-foreground">
                    {installmentData.installments}x de R$ {
                      (parseFloat(installmentData.amount || '0') / parseInt(installmentData.installments)).toFixed(2)
                    }
                  </p>
                </div>
              )}
              
              <Button onClick={handleInstallmentTransaction} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Parcelamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Transactions;