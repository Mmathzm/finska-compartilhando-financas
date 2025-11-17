import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { TransactionInput } from '@/hooks/useTransactions';
import { Category } from '@/hooks/useCategories';
import { useInputValidation } from '@/hooks/useInputValidation';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: (transaction: TransactionInput) => Promise<any>;
  categories: Category[];
}

const TransactionModal = ({ open, onOpenChange, onAddTransaction, categories }: TransactionModalProps) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { validateAmount, sanitizeText } = useInputValidation();
  const { handleAsyncError } = useErrorHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const sanitizedDescription = sanitizeText(description);
    const amountValidation = validateAmount(amount);
    
    if (!categoryId || !sanitizedDescription || !amount) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!amountValidation.isValid) {
      toast({
        title: "Valor inválido",
        description: amountValidation.errors[0],
        variant: "destructive"
      });
      return;
    }

    if (sanitizedDescription.length < 3) {
      toast({
        title: "Descrição muito curta",
        description: "A descrição deve ter pelo menos 3 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    const success = await handleAsyncError(async () => {
      const transaction: TransactionInput = {
        type,
        category_id: categoryId,
        description: sanitizedDescription,
        amount: parseFloat(amount)
      };

      await onAddTransaction(transaction);
      
      // Reset form
      setCategoryId('');
      setDescription('');
      setAmount('');
      
      onOpenChange(false);
    }, 'Transaction creation');
    
    setLoading(false);
  };

  const filteredCategories = categories.filter(cat => cat.type === type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova receita ou gasto ao seu controle financeiro.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Transação</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max="999999999.99"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Adicionando...' : 'Adicionar Transação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;