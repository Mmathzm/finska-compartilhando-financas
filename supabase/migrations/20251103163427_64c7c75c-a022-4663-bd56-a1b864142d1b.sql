-- Table for PIX transactions
CREATE TABLE public.pix_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pix_key TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('send', 'receive')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for bank transfers
CREATE TABLE public.bank_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'checking', 'investment', 'external')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for installment plans
CREATE TABLE public.installment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  installment_count INTEGER NOT NULL CHECK (installment_count > 0 AND installment_count <= 24),
  installment_value NUMERIC NOT NULL CHECK (installment_value > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID,
  current_installment INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.pix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pix_transactions
CREATE POLICY "Users can view their own PIX transactions"
  ON public.pix_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PIX transactions"
  ON public.pix_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PIX transactions"
  ON public.pix_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PIX transactions"
  ON public.pix_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for bank_transfers
CREATE POLICY "Users can view their own bank transfers"
  ON public.bank_transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank transfers"
  ON public.bank_transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank transfers"
  ON public.bank_transfers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank transfers"
  ON public.bank_transfers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for installment_plans
CREATE POLICY "Users can view their own installment plans"
  ON public.installment_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own installment plans"
  ON public.installment_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installment plans"
  ON public.installment_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installment plans"
  ON public.installment_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_pix_transactions_updated_at
  BEFORE UPDATE ON public.pix_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_transfers_updated_at
  BEFORE UPDATE ON public.bank_transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_installment_plans_updated_at
  BEFORE UPDATE ON public.installment_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_pix_transactions_user_id ON public.pix_transactions(user_id);
CREATE INDEX idx_pix_transactions_created_at ON public.pix_transactions(created_at DESC);
CREATE INDEX idx_bank_transfers_user_id ON public.bank_transfers(user_id);
CREATE INDEX idx_bank_transfers_created_at ON public.bank_transfers(created_at DESC);
CREATE INDEX idx_installment_plans_user_id ON public.installment_plans(user_id);
CREATE INDEX idx_installment_plans_status ON public.installment_plans(status);