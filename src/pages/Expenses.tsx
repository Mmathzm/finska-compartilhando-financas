import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingDown, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  tags?: string[];
}

const Expenses = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Mock data - substitua por dados reais da sua API
  const [expenses] = useState<Expense[]>([
    {
      id: '1',
      category: 'Alimentação',
      description: 'Compra no supermercado',
      amount: 156.00,
      date: '2024-01-15',
      tags: ['essencial', 'casa']
    },
    {
      id: '2',
      category: 'Transporte',
      description: 'Combustível',
      amount: 89.50,
      date: '2024-01-14',
      tags: ['carro', 'trabalho']
    },
    {
      id: '3',
      category: 'Lazer',
      description: 'Cinema',
      amount: 45.00,
      date: '2024-01-12',
      tags: ['entretenimento']
    },
    {
      id: '4',
      category: 'Saúde',
      description: 'Farmácia',
      amount: 67.80,
      date: '2024-01-10',
      tags: ['medicamentos', 'essencial']
    },
    {
      id: '5',
      category: 'Educação',
      description: 'Curso online',
      amount: 199.90,
      date: '2024-01-08',
      tags: ['desenvolvimento', 'carreira']
    }
  ]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(expenses.map(expense => expense.category))];
    return uniqueCategories;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const expenseDate = new Date(expense.date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filterPeriod) {
          case '7d':
            matchesPeriod = daysDiff <= 7;
            break;
          case '30d':
            matchesPeriod = daysDiff <= 30;
            break;
          case '90d':
            matchesPeriod = daysDiff <= 90;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesPeriod;
    });
  }, [expenses, searchTerm, filterCategory, filterPeriod]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <TrendingDown className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Histórico de Gastos</h1>
            <p className="text-muted-foreground">Acompanhe seus gastos e categorias</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total filtrado</p>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Gastos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gastos ({filteredExpenses.length})</span>
            <Badge variant="destructive" className="text-sm">
              {formatCurrency(totalExpenses)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum gasto encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense, index) => (
                <div key={expense.id}>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{expense.description}</h3>
                          <Badge variant="outline" className="text-xs">
                            {expense.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(expense.date)}
                          </span>
                          {expense.tags && (
                            <div className="flex gap-1">
                              {expense.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-destructive">
                        -{formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </div>
                  {index < filteredExpenses.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;