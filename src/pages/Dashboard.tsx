import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FinancialCard from '@/components/FinancialCard';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bell
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data sets for different periods
  const data7d = {
    expense: [
      { name: 'Seg', receitas: 850, gastos: 420 },
      { name: 'Ter', receitas: 920, gastos: 350 },
      { name: 'Qua', receitas: 780, gastos: 590 },
      { name: 'Qui', receitas: 1100, gastos: 480 },
      { name: 'Sex', receitas: 950, gastos: 620 },
      { name: 'Sáb', receitas: 680, gastos: 380 },
      { name: 'Dom', receitas: 520, gastos: 290 },
    ],
    daily: [
      { day: 'Seg', valor: 420 },
      { day: 'Ter', valor: 350 },
      { day: 'Qua', valor: 590 },
      { day: 'Qui', valor: 480 },
      { day: 'Sex', valor: 620 },
      { day: 'Sáb', valor: 380 },
      { day: 'Dom', valor: 290 },
    ]
  };

  const data30d = {
    expense: [
      { name: 'Sem 1', receitas: 4000, gastos: 2400 },
      { name: 'Sem 2', receitas: 3000, gastos: 1398 },
      { name: 'Sem 3', receitas: 2000, gastos: 2800 },
      { name: 'Sem 4', receitas: 2780, gastos: 1908 },
    ],
    daily: [
      { day: 'Seg', valor: 120 },
      { day: 'Ter', valor: 80 },
      { day: 'Qua', valor: 200 },
      { day: 'Qui', valor: 150 },
      { day: 'Sex', valor: 300 },
      { day: 'Sáb', valor: 180 },
      { day: 'Dom', valor: 90 },
    ]
  };

  const data90d = {
    expense: [
      { name: 'Jan', receitas: 12000, gastos: 8400 },
      { name: 'Fev', receitas: 11500, gastos: 7800 },
      { name: 'Mar', receitas: 13200, gastos: 9200 },
    ],
    daily: [
      { day: 'Jan', valor: 8400 },
      { day: 'Fev', valor: 7800 },
      { day: 'Mar', valor: 9200 },
    ]
  };

  // Get current data based on selected period
  const getCurrentData = () => {
    switch (selectedPeriod) {
      case '7d':
        return data7d;
      case '30d':
        return data30d;
      case '90d':
        return data90d;
      default:
        return data30d;
    }
  };

  const currentData = getCurrentData();

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    toast({
      title: "Período Atualizado",
      description: `Visualizando dados dos últimos ${period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : '90 dias'}.`,
    });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-transaction':
        toast({
          title: "Nova Transação",
          description: "Funcionalidade será implementada com integração Supabase.",
        });
        break;
      case 'invite-friend':
        navigate('/shared-accounts');
        break;
      case 'new-reminder':
        navigate('/reminders');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
            <p className="text-muted-foreground mt-1">Acompanhe suas finanças em tempo real</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant={selectedPeriod === '7d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handlePeriodChange('7d')}
            >
              7 dias
            </Button>
            <Button 
              variant={selectedPeriod === '30d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handlePeriodChange('30d')}
            >
              30 dias
            </Button>
            <Button 
              variant={selectedPeriod === '90d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handlePeriodChange('90d')}
            >
              90 dias
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialCard
            title="Saldo Total"
            value="R$ 12.430,00"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: "8.2%", isPositive: true }}
          />
          <FinancialCard
            title="Receitas"
            value="R$ 5.670,00"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{ value: "12.5%", isPositive: true }}
          />
          <FinancialCard
            title="Gastos"
            value="R$ 3.240,00"
            icon={<TrendingDown className="h-4 w-4" />}
            trend={{ value: "4.1%", isPositive: false }}
          />
          <FinancialCard
            title="Contas Compartilhadas"
            value="3 ativas"
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico Mensal */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Receitas vs Gastos (Mensal)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentData.expense}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Line 
                    type="monotone" 
                    dataKey="receitas" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gastos" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico Diário */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Gastos Diários (Esta Semana)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentData.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Bar 
                    dataKey="valor" 
                    fill="url(#gradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-auto p-4 flex flex-col items-center gap-2" 
                variant="outline"
                onClick={() => handleQuickAction('new-transaction')}
              >
                <Plus className="h-6 w-6" />
                <span>Nova Transação</span>
              </Button>
              <Button 
                className="h-auto p-4 flex flex-col items-center gap-2" 
                variant="outline"
                onClick={() => handleQuickAction('invite-friend')}
              >
                <Users className="h-6 w-6" />
                <span>Convidar Amigo</span>
              </Button>
              <Button 
                className="h-auto p-4 flex flex-col items-center gap-2" 
                variant="outline"
                onClick={() => handleQuickAction('new-reminder')}
              >
                <Bell className="h-6 w-6" />
                <span>Novo Lembrete</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'expense', description: 'Compra no supermercado', value: 'R$ 156,00', time: '2 horas atrás' },
                { type: 'income', description: 'Salário recebido', value: 'R$ 3.500,00', time: '1 dia atrás' },
                { type: 'shared', description: 'João adicionou R$ 200 à conta compartilhada', value: 'R$ 200,00', time: '2 dias atrás' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    {activity.type === 'expense' && <ArrowDownRight className="h-4 w-4 text-destructive" />}
                    {activity.type === 'income' && <ArrowUpRight className="h-4 w-4 text-success" />}
                    {activity.type === 'shared' && <Users className="h-4 w-4 text-primary" />}
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    activity.type === 'expense' ? 'text-destructive' : 'text-success'
                  }`}>
                    {activity.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;