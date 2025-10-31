import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  PieChart,
  Target,
  Download,
  Share,
  Filter,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';
import { useReportExports } from '@/hooks/useReportExports';
import { useAnalytics } from '@/hooks/useAnalytics';
import { FilterModal } from '@/components/FilterModal';
import { ShareReportModal } from '@/components/ShareReportModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  Pie
} from 'recharts';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const { toast } = useToast();
  
  // Hooks para dados do banco
  const { transactions, loading: loadingTransactions } = useTransactions();
  const { goals, loading: loadingGoals } = useFinancialGoals();
  const { createExport } = useReportExports();
  
  // Calcular período em meses
  const monthsBack = selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;
  
  // Obter dados analíticos
  const { monthlyData, categoryData, dailySpendingData, kpis } = useAnalytics(transactions, monthsBack);
  
  // Formatar metas para exibição
  const formattedGoals = goals.map(goal => ({
    name: goal.title,
    current: goal.current_amount,
    target: goal.target_amount,
    percentage: goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0
  }));

  const handleExportData = async (format: string) => {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setMonth(now.getMonth() - monthsBack);
    
    try {
      await createExport({
        report_type: 'analytics',
        format: format,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: now.toISOString().split('T')[0],
        filters: { period: selectedPeriod }
      });
      
      setShowExportDialog(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleShareReport = () => {
    setShowShareModal(true);
  };

  const handleFilterData = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilter = (filter: any) => {
    setAppliedFilters(filter);
    setSelectedPeriod(filter.period || '6m');
    toast({
      title: "Filtros aplicados",
      description: "Os dados foram filtrados com sucesso.",
    });
  };

  const loading = loadingTransactions || loadingGoals;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando análises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios e Análises</h1>
            <p className="text-muted-foreground mt-1">Insights detalhados sobre suas finanças</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {['1m', '3m', '6m', '1a'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '1m' && '1 mês'}
                {period === '3m' && '3 meses'}
                {period === '6m' && '6 meses'}
                {period === '1a' && '1 ano'}
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleFilterData}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {appliedFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  ativo
                </span>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShareReport}
            >
              <Share className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-primary text-primary-foreground shadow-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Receita Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {kpis.avgIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {kpis.incomeChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{kpis.incomeChange >= 0 ? '+' : ''}{kpis.incomeChange.toFixed(1)}% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gasto Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {kpis.avgExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-xs mt-1 text-success">
                {kpis.expenseChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                <span>{kpis.expenseChange >= 0 ? '+' : ''}{kpis.expenseChange.toFixed(1)}% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Economia Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {kpis.avgSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-xs mt-1 text-success">
                {kpis.savingsChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{kpis.savingsChange >= 0 ? '+' : ''}{kpis.savingsChange.toFixed(1)}% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Economia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.savingsRate.toFixed(1)}%</div>
              <div className="flex items-center gap-1 text-xs mt-1 text-success">
                <Target className="h-3 w-3" />
                <span>Meta: 30%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução Mensal */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="receitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="gastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke="hsl(var(--success))"
                    fillOpacity={1}
                    fill="url(#receitas)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gastos"
                    stroke="hsl(var(--destructive))"
                    fillOpacity={1}
                    fill="url(#gastos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gastos por Categoria */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Gastos por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gastos Diários */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Gastos Diários (Este Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySpendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metas Financeiras */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Progresso das Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {formattedGoals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma meta financeira cadastrada ainda.
                </p>
              ) : (
                formattedGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{goal.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        R$ {goal.current.toLocaleString('pt-BR')} / R$ {goal.target.toLocaleString('pt-BR')}
                      </span>
                      <Badge 
                        variant={goal.percentage >= 100 ? "destructive" : goal.percentage >= 80 ? "default" : "secondary"}
                      >
                        {goal.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.percentage >= 100 
                          ? 'bg-destructive' 
                          : goal.percentage >= 80 
                            ? 'bg-warning' 
                            : 'bg-gradient-primary'
                      }`}
                      style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )))}
            </div>
          </CardContent>
        </Card>
        
        {/* Modal de Exportação */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Exportar Relatório
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExportDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Escolha o formato para exportar seus dados financeiros:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => handleExportData('pdf')}
                >
                  <div className="p-2 rounded bg-red-100 text-red-600">
                    PDF
                  </div>
                  <span className="text-sm">Relatório completo</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => handleExportData('excel')}
                >
                  <div className="p-2 rounded bg-green-100 text-green-600">
                    XLSX
                  </div>
                  <span className="text-sm">Planilha de dados</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => handleExportData('csv')}
                >
                  <div className="p-2 rounded bg-blue-100 text-blue-600">
                    CSV
                  </div>
                  <span className="text-sm">Dados tabulares</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => handleExportData('json')}
                >
                  <div className="p-2 rounded bg-purple-100 text-purple-600">
                    JSON
                  </div>
                  <span className="text-sm">Dados estruturados</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Filtros */}
        <FilterModal
          open={showFilterModal}
          onOpenChange={setShowFilterModal}
          onApplyFilter={handleApplyFilter}
        />

        {/* Modal de Compartilhamento */}
        <ShareReportModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          reportData={{
            period: selectedPeriod,
            monthlyData,
            categoryData,
            kpis
          }}
        />
      </div>
    </div>
  );
};

export default Analytics;