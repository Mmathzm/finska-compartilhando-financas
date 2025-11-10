-- Tabela para armazenar taxas de câmbio
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency_code TEXT NOT NULL UNIQUE,
  currency_name TEXT NOT NULL,
  rate_to_brl NUMERIC(10, 4) NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para busca rápida por moeda
CREATE INDEX idx_exchange_rates_currency ON public.exchange_rates(currency_code);

-- Índice para ordenar por data de atualização
CREATE INDEX idx_exchange_rates_updated ON public.exchange_rates(last_updated DESC);

-- Habilitar RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem visualizar as taxas
CREATE POLICY "Everyone can view exchange rates"
  ON public.exchange_rates
  FOR SELECT
  USING (true);

-- Inserir valores iniciais para USD e EUR
INSERT INTO public.exchange_rates (currency_code, currency_name, rate_to_brl, source) VALUES
  ('USD', 'Dólar Americano', 5.00, 'Sistema'),
  ('EUR', 'Euro', 5.50, 'Sistema')
ON CONFLICT (currency_code) DO NOTHING;

-- Tabela para histórico de conversões do usuário (opcional)
CREATE TABLE public.user_currency_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  from_amount NUMERIC(15, 2) NOT NULL,
  to_amount NUMERIC(15, 2) NOT NULL,
  exchange_rate NUMERIC(10, 4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_currency_conversions ENABLE ROW LEVEL SECURITY;

-- Políticas para conversões do usuário
CREATE POLICY "Users can view their own conversions"
  ON public.user_currency_conversions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversions"
  ON public.user_currency_conversions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversions"
  ON public.user_currency_conversions
  FOR DELETE
  USING (auth.uid() = user_id);