import { useState } from 'react';
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

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const expenseData = [
    { name: 'Jan', receitas: 4000, gastos: 2400 },
    { name: 'Fev', receitas: 3000, gastos: 1398 },
    { name: 'Mar', receitas: 2000, gastos: 9800 },
    { name: 'Abr', receitas: 2780, gastos: 3908 },
    { name: 'Mai', receitas: 1890, gastos: 4800 },
    { name: 'Jun', receitas: 2390, gastos: 3800 },
  ];

  const dailyData = [
    { day: 'Seg', valor: 120 },
    { day: 'Ter', valor: 80 },
    { day: 'Qua', valor: 200 },
    { day: 'Qui', valor: 150 },
    { day: 'Sex', valor: 300 },
    { day: 'Sáb', valor: 180 },
    { day: 'Dom', valor: 90 },
  ];

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
              onClick={() => setSelectedPeriod('7d')}
            >
              7 dias
            </Button>
            <Button 
              variant={selectedPeriod === '30d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedPeriod('30d')}
            >
              30 dias
            </Button>
            <Button 
              variant={selectedPeriod === '90d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedPeriod('90d')}
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
                <LineChart data={expenseData}>
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
                <BarChart data={dailyData}>
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
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Plus className="h-6 w-6" />
                <span>Nova Transação</span>
              </Button>
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>Convidar Amigo</span>
              </Button>
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
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