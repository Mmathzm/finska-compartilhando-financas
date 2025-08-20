import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  Plus, 
  CalendarIcon, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Reminders = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [reminders, setReminders] = useState([
    {
      id: '1',
      title: 'Conta de Luz',
      description: 'Pagamento da conta de energia elétrica',
      amount: 250.00,
      dueDate: '2024-01-25',
      category: 'utilities',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Cartão de Crédito',
      description: 'Fatura do cartão Nubank',
      amount: 1200.00,
      dueDate: '2024-01-30',
      category: 'credit-card',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Internet',
      description: 'Mensalidade da internet',
      amount: 99.90,
      dueDate: '2024-02-05',
      category: 'utilities',
      status: 'paid',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Seguro do Carro',
      description: 'Parcela do seguro do veículo',
      amount: 180.00,
      dueDate: '2024-02-15',
      category: 'insurance',
      status: 'pending',
      priority: 'medium'
    }
  ]);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    priority: ''
  });
  const { toast } = useToast();
  
  const getCategoryColor = (category: string) => {
    const colors = {
      'utilities': 'bg-blue-100 text-blue-800',
      'credit-card': 'bg-purple-100 text-purple-800',
      'insurance': 'bg-green-100 text-green-800',
      'subscription': 'bg-orange-100 text-orange-800',
      'loan': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (priority === 'medium') return <Clock className="h-4 w-4 text-warning" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const handleMarkAsPaid = (id: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, status: 'paid' } : reminder
    ));
    toast({
      title: "Conta marcada como paga!",
      description: "O lembrete foi atualizado com sucesso.",
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    toast({
      title: "Lembrete excluído",
      description: "O lembrete foi removido com sucesso.",
    });
  };

  const handleEditReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      setNewReminder({
        title: reminder.title,
        description: reminder.description,
        amount: reminder.amount.toString(),
        category: reminder.category,
        priority: reminder.priority
      });
      setShowNewReminder(true);
    }
  };

  const handleCreateReminder = () => {
    if (!newReminder.title || !newReminder.amount || !selectedDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, valor e data de vencimento.",
        variant: "destructive"
      });
      return;
    }

    const reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description,
      amount: parseFloat(newReminder.amount),
      dueDate: format(selectedDate, 'yyyy-MM-dd'),
      category: newReminder.category || 'utilities',
      status: 'pending' as const,
      priority: newReminder.priority || 'medium'
    };

    setReminders(prev => [...prev, reminder]);
    setNewReminder({ title: '', description: '', amount: '', category: '', priority: '' });
    setSelectedDate(undefined);
    setShowNewReminder(false);
    
    toast({
      title: "Lembrete criado!",
      description: "Novo lembrete adicionado com sucesso.",
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lembretes de Contas</h1>
            <p className="text-muted-foreground mt-1">Nunca mais esqueça de pagar suas contas</p>
          </div>
          <Button 
            className="bg-gradient-primary"
            onClick={() => setShowNewReminder(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Lembrete
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-destructive">Vencendo Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">R$ 1.450,00 total</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-warning/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-warning">Próximos 7 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">R$ 180,00 total</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-success/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-success">Pagas este mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">R$ 99,90 total</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Lembretes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Todos os Lembretes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const daysUntilDue = getDaysUntilDue(reminder.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isDueToday = daysUntilDue === 0;
                
                return (
                  <div
                    key={reminder.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      isOverdue && "bg-destructive/5 border-destructive/20",
                      isDueToday && "bg-warning/5 border-warning/20",
                      reminder.status === 'paid' && "bg-success/5 border-success/20 opacity-75"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(reminder.priority)}
                        {reminder.status === 'paid' && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{reminder.title}</h3>
                          <Badge className={getCategoryColor(reminder.category)}>
                            {reminder.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{reminder.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(reminder.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {reminder.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {reminder.status === 'pending' && (
                        <>
                          {isOverdue && (
                            <Badge variant="destructive" className="mb-2">
                              {Math.abs(daysUntilDue)} dias atrasado
                            </Badge>
                          )}
                          {isDueToday && (
                            <Badge variant="default" className="mb-2 bg-warning">
                              Vence hoje
                            </Badge>
                          )}
                          {daysUntilDue > 0 && (
                            <Badge variant="outline" className="mb-2">
                              {daysUntilDue} dias
                            </Badge>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleMarkAsPaid(reminder.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marcar como Pago
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditReminder(reminder.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteReminder(reminder.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                      {reminder.status === 'paid' && (
                        <Badge variant="outline" className="text-success border-success">
                          Pago
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Modal Novo Lembrete */}
        {showNewReminder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Novo Lembrete</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewReminder(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Conta de Luz"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descrição opcional..."
                    rows={2}
                    value={newReminder.description}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0,00"
                    step="0.01"
                    value={newReminder.amount}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data de Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "Selecione uma data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={newReminder.category} onValueChange={(value) => setNewReminder(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utilities">Utilidades</SelectItem>
                      <SelectItem value="credit-card">Cartão de Crédito</SelectItem>
                      <SelectItem value="insurance">Seguro</SelectItem>
                      <SelectItem value="subscription">Assinatura</SelectItem>
                      <SelectItem value="loan">Empréstimo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={newReminder.priority} onValueChange={(value) => setNewReminder(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowNewReminder(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-primary"
                    onClick={handleCreateReminder}
                  >
                    Criar Lembrete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminders;