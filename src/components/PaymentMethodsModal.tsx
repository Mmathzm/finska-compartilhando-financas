import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Plus, Trash2, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethodsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentMethodsModal = ({ open, onOpenChange }: PaymentMethodsModalProps) => {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const [paymentMethods] = useState([
    {
      id: 1,
      type: 'credit',
      brand: 'Visa',
      last4: '4532',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'credit',
      brand: 'Mastercard',
      last4: '8765',
      expiry: '08/26',
      isDefault: false
    }
  ]);

  const handleAddCard = () => {
    if (!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Cartão adicionado!",
      description: "Novo método de pagamento foi adicionado com sucesso.",
    });
    setNewCard({ number: '', name: '', expiry: '', cvv: '' });
    setShowAddForm(false);
  };

  const handleDeleteCard = (id: number) => {
    const confirmed = window.confirm("Tem certeza que deseja remover este cartão?");
    if (confirmed) {
      toast({
        title: "Cartão removido",
        description: "Método de pagamento foi removido com sucesso.",
      });
    }
  };

  const handleSetDefault = (id: number) => {
    toast({
      title: "Cartão padrão alterado",
      description: "Este cartão agora é seu método de pagamento padrão.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Métodos de Pagamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cartões Existentes */}
          <div>
            <h3 className="font-semibold mb-4">Cartões Salvos</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {method.brand} •••• {method.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expira em {method.expiry}
                        </p>
                      </div>
                      {method.isDefault && (
                        <Badge className="bg-gradient-primary">Padrão</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Tornar Padrão
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCard(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Adicionar Novo Cartão */}
          <div>
            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Novo Cartão
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adicionar Novo Cartão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={newCard.number}
                        onChange={(e) => setNewCard(prev => ({ ...prev, number: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        placeholder="João Silva"
                        value={newCard.name}
                        onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Validade</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/AA"
                        value={newCard.expiry}
                        onChange={(e) => setNewCard(prev => ({ ...prev, expiry: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        maxLength={4}
                        value={newCard.cvv}
                        onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button onClick={handleAddCard} className="bg-gradient-primary">
                      Adicionar Cartão
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodsModal;