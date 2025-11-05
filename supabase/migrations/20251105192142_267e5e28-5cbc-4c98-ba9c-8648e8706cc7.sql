-- Tabela de estatísticas do usuário
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  level_name TEXT NOT NULL DEFAULT 'Iniciante',
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela de conquistas (templates)
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL,
  requirement_type TEXT NOT NULL, -- 'transaction_count', 'savings_amount', 'streak_days', 'goal_completion'
  requirement_value INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conquistas do usuário
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned BOOLEAN NOT NULL DEFAULT false,
  progress INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Tabela de desafios (templates)
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Fácil', 'Médio', 'Difícil')),
  category TEXT NOT NULL,
  reward_points INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  requirement_type TEXT NOT NULL, -- 'avoid_category', 'save_amount', 'no_transactions'
  requirement_value NUMERIC,
  requirement_category_id UUID REFERENCES categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de desafios do usuário
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de frases motivacionais
CREATE TABLE public.motivational_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de dicas financeiras
CREATE TABLE public.financial_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivational_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_tips ENABLE ROW LEVEL SECURITY;

-- Policies for user_stats
CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for achievements (everyone can view templates)
CREATE POLICY "Everyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for challenges (everyone can view templates)
CREATE POLICY "Everyone can view active challenges"
  ON public.challenges FOR SELECT
  USING (is_active = true);

-- Policies for user_challenges
CREATE POLICY "Users can view their own challenges"
  ON public.user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
  ON public.user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON public.user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges"
  ON public.user_challenges FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for motivational_quotes (everyone can view)
CREATE POLICY "Everyone can view active quotes"
  ON public.motivational_quotes FOR SELECT
  USING (is_active = true);

-- Policies for financial_tips (everyone can view)
CREATE POLICY "Everyone can view active tips"
  ON public.financial_tips FOR SELECT
  USING (is_active = true);

-- Triggers for updated_at
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at
  BEFORE UPDATE ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at
  BEFORE UPDATE ON public.user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para inicializar stats do usuário
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger para criar stats quando novo usuário é criado
CREATE TRIGGER on_auth_user_created_init_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_stats();

-- Inserir conquistas padrão
INSERT INTO public.achievements (title, description, icon, points, requirement_type, requirement_value) VALUES
  ('Primeiro Passo', 'Completou seu primeiro registro de gastos', 'CheckCircle', 50, 'transaction_count', 1),
  ('Economizador', 'Economizou mais de R$ 1.000 em um mês', 'Trophy', 200, 'savings_amount', 1000),
  ('Consistente', 'Registrou gastos por 30 dias consecutivos', 'Flame', 300, 'streak_days', 30),
  ('Meta Master', 'Atingiu todas as metas financeiras do mês', 'Crown', 500, 'goal_completion', 1);

-- Inserir desafios padrão
INSERT INTO public.challenges (title, description, difficulty, category, reward_points, duration_days, requirement_type, requirement_value) VALUES
  ('Desafio 30 Dias Sem Supérfluos', 'Evite gastos desnecessários por 30 dias', 'Difícil', 'Economia', 1000, 30, 'avoid_category', 0),
  ('Meta de Economia Semanal', 'Economize R$ 200 esta semana', 'Médio', 'Poupança', 300, 7, 'save_amount', 200),
  ('Zero Gastos com Delivery', 'Não peça delivery por 7 dias', 'Fácil', 'Alimentação', 200, 7, 'no_transactions', 0);

-- Inserir frases motivacionais
INSERT INTO public.motivational_quotes (quote, category) VALUES
  ('Não é o quanto você ganha, mas o quanto você economiza que faz a diferença.', 'Economia'),
  ('Pequenos passos diários levam a grandes mudanças financeiras.', 'Progresso'),
  ('Cada real economizado hoje é um investimento no seu futuro.', 'Investimento'),
  ('A disciplina financeira de hoje é a liberdade de amanhã.', 'Disciplina');

-- Inserir dicas financeiras
INSERT INTO public.financial_tips (title, description, category, priority) VALUES
  ('Regra 50-30-20', 'Destine 50% para necessidades, 30% para desejos e 20% para poupança', 'Planejamento', 1),
  ('Automatize suas Economias', 'Configure transferências automáticas para sua poupança no dia do salário', 'Automação', 2),
  ('Revise Assinaturas', 'Cancele serviços que você não usa há mais de 30 dias', 'Otimização', 3),
  ('Compre com Lista', 'Sempre faça uma lista antes de ir ao supermercado e mantenha-se fiel a ela', 'Compras', 4);