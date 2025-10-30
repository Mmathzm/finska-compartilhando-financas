import { useState, useMemo } from 'react';
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
  Trash2,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useReminders } from '@/hooks/useReminders';
import { useCategories } from '@/hooks/useCategories';

const Reminders = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    amount: '',
    category_id: '',
  });
  
  const { reminders, loading, createReminder, updateReminder, deleteReminder, markAsPaid } = useReminders();
  const { categories } = useCategories();
  
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const handleMarkAsPaid = async (id: string) => {
    await markAsPaid(id);
  };

  const handleDeleteReminder = async (id: string) => {
    await deleteReminder(id);
  };

  const handleEditReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      setEditingId(id);
      setNewReminder({
        title: reminder.title,
        description: reminder.description || '',
        amount: reminder.amount?.toString() || '',
        category_id: reminder.category_id || '',
      });
      setSelectedDate(reminder.due_date ? new Date(reminder.due_date) : undefined);
      setShowNewReminder(true);
    }
  };

  const handleSaveReminder = async () => {
    if (!newReminder.title || !newReminder.amount || !selectedDate) {
      return;
    }

    const reminderData = {
      title: newReminder.title,
      description: newReminder.description || null,
      amount: parseFloat(newReminder.amount),
      due_date: format(selectedDate, 'yyyy-MM-dd'),
      category_id: newReminder.category_id || null,
    };

    if (editingId) {
      await updateReminder(editingId, reminderData);
      setEditingId(null);
    } else {
      await createReminder(reminderData);
    }

    setNewReminder({ title: '', description: '', amount: '', category_id: '' });
    setSelectedDate(undefined);
    setShowNewReminder(false);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const dueToday = reminders.filter(r => {
      if (r.is_completed) return false;
      const due = new Date(r.due_date);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    });
    
    const dueNextWeek = reminders.filter(r => {
      if (r.is_completed) return false;
      const due = new Date(r.due_date);
      due.setHours(0, 0, 0, 0);
      return due > today && due <= sevenDaysFromNow;
    });
    
    const paidThisMonth = reminders.filter(r => {
      if (!r.is_completed) return false;
      const due = new Date(r.due_date);
      return due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear();
    });
    
    return {
      dueToday: {
        count: dueToday.length,
        total: dueToday.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
      },
      dueNextWeek: {
        count: dueNextWeek.length,
        total: dueNextWeek.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
      },
      paidThisMonth: {
        count: paidThisMonth.length,
        total: paidThisMonth.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
      }
    };
  }, [reminders]);

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
              <div className="text-2xl font-bold">{stats.dueToday.count}</div>
              <p className="text-xs text-muted-foreground">
                R$ {stats.dueToday.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-warning/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-warning">Próximos 7 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dueNextWeek.count}</div>
              <p className="text-xs text-muted-foreground">
                R$ {stats.dueNextWeek.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-success/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-success">Pagas este mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidThisMonth.count}</div>
              <p className="text-xs text-muted-foreground">
                R$ {stats.paidThisMonth.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
              </p>
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
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum lembrete cadastrado
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => {
                  const daysUntilDue = getDaysUntilDue(reminder.due_date);
                  const isOverdue = daysUntilDue < 0;
                  const isDueToday = daysUntilDue === 0;
                
                return (
                  <div
                    key={reminder.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      isOverdue && "bg-destructive/5 border-destructive/20",
                      isDueToday && "bg-warning/5 border-warning/20",
                      reminder.is_completed && "bg-success/5 border-success/20 opacity-75"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {reminder.is_completed && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{reminder.title}</h3>
                          <Badge variant="outline">
                            {getCategoryName(reminder.category_id)}
                          </Badge>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground">{reminder.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(reminder.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          {reminder.amount && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R$ {Number(reminder.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {!reminder.is_completed && (
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
                      {reminder.is_completed && (
                        <Badge variant="outline" className="text-success border-success">
                          Pago
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Novo Lembrete */}
        {showNewReminder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{editingId ? 'Editar Lembrete' : 'Novo Lembrete'}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewReminder(false);
                      setEditingId(null);
                      setNewReminder({ title: '', description: '', amount: '', category_id: '' });
                      setSelectedDate(undefined);
                    }}
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
                  <Label htmlFor="category">Categoria (opcional)</Label>
                  <Select value={newReminder.category_id} onValueChange={(value) => setNewReminder(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowNewReminder(false);
                      setEditingId(null);
                      setNewReminder({ title: '', description: '', amount: '', category_id: '' });
                      setSelectedDate(undefined);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-primary"
                    onClick={handleSaveReminder}
                  >
                    {editingId ? 'Salvar' : 'Criar Lembrete'}
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