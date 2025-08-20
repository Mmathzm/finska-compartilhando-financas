import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Trophy, 
  Target, 
  TrendingUp,
  Star,
  Gift,
  Zap,
  CheckCircle,
  Crown,
  Flame
} from 'lucide-react';

const Motivation = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  const achievements = [
    {
      id: '1',
      title: 'Primeiro Passo',
      description: 'Completou seu primeiro registro de gastos',
      icon: <CheckCircle className="h-8 w-8 text-success" />,
      earned: true,
      points: 50
    },
    {
      id: '2',
      title: 'Economizador',
      description: 'Economizou mais de R$ 1.000 em um mês',
      icon: <Trophy className="h-8 w-8 text-warning" />,
      earned: true,
      points: 200
    },
    {
      id: '3',
      title: 'Consistente',
      description: 'Registrou gastos por 30 dias consecutivos',
      icon: <Flame className="h-8 w-8 text-destructive" />,
      earned: false,
      points: 300,
      progress: 15,
      total: 30
    },
    {
      id: '4',
      title: 'Meta Master',
      description: 'Atingiu todas as metas financeiras do mês',
      icon: <Crown className="h-8 w-8 text-primary" />,
      earned: false,
      points: 500
    }
  ];

  const challenges = [
    {
      id: '1',
      title: 'Desafio 30 Dias Sem Supérfluos',
      description: 'Evite gastos desnecessários por 30 dias',
      progress: 12,
      total: 30,
      reward: 1000,
      difficulty: 'Difícil',
      category: 'Economia'
    },
    {
      id: '2',
      title: 'Meta de Economia Semanal',
      description: 'Economize R$ 200 esta semana',
      progress: 150,
      total: 200,
      reward: 300,
      difficulty: 'Médio',
      category: 'Poupança'
    },
    {
      id: '3',
      title: 'Zero Gastos com Delivery',
      description: 'Não peça delivery por 7 dias',
      progress: 3,
      total: 7,
      reward: 200,
      difficulty: 'Fácil',
      category: 'Alimentação'
    }
  ];

  const tips = [
    {
      title: 'Regra 50-30-20',
      description: 'Destine 50% para necessidades, 30% para desejos e 20% para poupança',
      category: 'Planejamento'
    },
    {
      title: 'Automatize suas Economias',
      description: 'Configure transferências automáticas para sua poupança no dia do salário',
      category: 'Automação'
    },
    {
      title: 'Revise Assinaturas',
      description: 'Cancele serviços que você não usa há mais de 30 dias',
      category: 'Otimização'
    },
    {
      title: 'Compre com Lista',
      description: 'Sempre faça uma lista antes de ir ao supermercado e mantenha-se fiel a ela',
      category: 'Compras'
    }
  ];

  const motivationalQuotes = [
    "Não é o quanto você ganha, mas o quanto você economiza que faz a diferença.",
    "Pequenos passos diários levam a grandes mudanças financeiras.",
    "Cada real economizado hoje é um investimento no seu futuro.",
    "A disciplina financeira de hoje é a liberdade de amanhã."
  ];

  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-success text-success-foreground';
      case 'Médio': return 'bg-warning text-warning-foreground';
      case 'Difícil': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Centro de Motivação</h1>
          <p className="text-muted-foreground">Mantenha-se motivado em sua jornada financeira</p>
        </div>

        {/* Frase Motivacional */}
        <Card className="bg-gradient-primary text-primary-foreground shadow-card border-0">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <blockquote className="text-lg font-medium italic">
              "{currentQuote}"
            </blockquote>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.earned
                      ? 'border-success bg-success/5'
                      : 'border-dashed border-muted'
                  }`}
                >
                  <div className="text-center">
                    <div className={achievement.earned ? '' : 'opacity-30'}>
                      {achievement.icon}
                    </div>
                    <h3 className="font-semibold mt-2">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <Badge className="mt-2 bg-warning text-warning-foreground">
                        +{achievement.points} pts
                      </Badge>
                    ) : achievement.progress !== undefined ? (
                      <div className="mt-2">
                        <Progress value={(achievement.progress / achievement.total!) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.progress}/{achievement.total}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="mt-2">
                        {achievement.points} pts
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Desafios Ativos */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Desafios Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="outline">{challenge.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-warning">
                      <Gift className="h-4 w-4" />
                      <span className="font-medium">{challenge.reward} pts</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span>{challenge.progress}/{challenge.total}</span>
                    </div>
                    <Progress 
                      value={(challenge.progress / challenge.total) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                    {challenge.progress === challenge.total && (
                      <Button size="sm" className="bg-success hover:bg-success/90">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas e Progresso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pontos Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-warning" />
                <span className="text-2xl font-bold">1,250</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+200 esta semana</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sequência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-destructive" />
                <span className="text-2xl font-bold">15</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">dias consecutivos</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Nível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-2xl font-bold">7</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Economizador Experiente</p>
            </CardContent>
          </Card>
        </div>

        {/* Dicas Financeiras */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Dicas para Melhorar suas Finanças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <div key={index} className="p-4 rounded-lg bg-secondary/50 border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {tip.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Motivation;