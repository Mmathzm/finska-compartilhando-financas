import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/providers/CurrencyProvider';
import { useExchangeRates } from '@/hooks/useExchangeRates';

interface Income {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  source?: string;
  tags?: string[];
}

const Income = () => {
  const { toast } = useToast();
  const { selectedCurrency } = useCurrency();
  const { convertCurrency } = useExchangeRates();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Mock data - substitua por dados reais da sua API
  const [incomes] = useState<Income[]>([
    {
      id: '1',
      category: 'Salário',
      description: 'Salário mensal',
      amount: 4500.00,
      date: '2024-01-01',
      source: 'Empresa XYZ',
      tags: ['mensal', 'fixo']
    },
    {
      id: '2',
      category: 'Freelance',
      description: 'Projeto web',
      amount: 1200.00,
      date: '2024-01-15',
      source: 'Cliente ABC',
      tags: ['projeto', 'extra']
    },
    {
      id: '3',
      category: 'Investimentos',
      description: 'Dividendos',
      amount: 350.75,
      date: '2024-01-10',
      source: 'Corretora DEF',
      tags: ['passiva', 'ações']
    },
    {
      id: '4',
      category: 'Vendas',
      description: 'Venda de produto',
      amount: 890.00,
      date: '2024-01-12',
      source: 'Marketplace',
      tags: ['produto', 'online']
    },
    {
      id: '5',
      category: 'Consultoria',
      description: 'Consultoria financeira',
      amount: 2500.00,
      date: '2024-01-08',
      source: 'Empresa GHI',
      tags: ['consultoria', 'especializada']
    }
  ]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(incomes.map(income => income.category))];
    return uniqueCategories;
  }, [incomes]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(income => {
      const matchesSearch = income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          income.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          income.source?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || income.category === filterCategory;
      
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const incomeDate = new Date(income.date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - incomeDate.getTime()) / (1000 * 60 * 60 * 24));
        
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
  }, [incomes, searchTerm, filterCategory, filterPeriod]);

  const totalIncomes = useMemo(() => {
    const total = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
    return convertCurrency(total, 'BRL', selectedCurrency);
  }, [filteredIncomes, selectedCurrency, convertCurrency]);

  const getCurrencySymbol = () => {
    switch (selectedCurrency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return 'R$';
    }
  };

  const formatCurrency = (amount: number) => {
    const converted = convertCurrency(amount, 'BRL', selectedCurrency);
    return `${getCurrencySymbol()} ${converted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
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
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Histórico de Receitas</h1>
            <p className="text-muted-foreground">Acompanhe suas receitas e fontes de renda</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total filtrado</p>
          <p className="text-2xl font-bold text-primary">{getCurrencySymbol()} {totalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
                  placeholder="Buscar por descrição, categoria ou fonte..."
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

      {/* Lista de Receitas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Receitas ({filteredIncomes.length})</span>
            <Badge variant="default" className="text-sm bg-primary">
              {formatCurrency(totalIncomes)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIncomes.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma receita encontrada com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIncomes.map((income, index) => (
                <div key={income.id}>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{income.description}</h3>
                          <Badge variant="outline" className="text-xs">
                            {income.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(income.date)}
                          </span>
                          {income.source && (
                            <span>Fonte: {income.source}</span>
                          )}
                          {income.tags && (
                            <div className="flex gap-1">
                              {income.tags.map((tag, tagIndex) => (
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
                      <p className="text-lg font-bold text-primary">
                        +{formatCurrency(income.amount)}
                      </p>
                    </div>
                  </div>
                  {index < filteredIncomes.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;