-- Create financial_goals table for tracking user financial goals
CREATE TABLE public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  deadline DATE,
  category_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT financial_goals_title_length CHECK (char_length(title) >= 2 AND char_length(title) <= 200),
  CONSTRAINT financial_goals_description_length CHECK (char_length(description) <= 1000 OR description IS NULL),
  CONSTRAINT financial_goals_target_amount_valid CHECK (target_amount > 0 AND target_amount <= 999999999.99),
  CONSTRAINT financial_goals_current_amount_valid CHECK (current_amount >= 0 AND current_amount <= 999999999.99),
  CONSTRAINT financial_goals_deadline_valid CHECK (deadline IS NULL OR deadline >= CURRENT_DATE)
);

-- Enable RLS
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_goals
CREATE POLICY "Users can view their own financial goals"
  ON public.financial_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial goals"
  ON public.financial_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial goals"
  ON public.financial_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial goals"
  ON public.financial_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create report_exports table for tracking generated reports
CREATE TABLE public.report_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  format TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT report_exports_type_valid CHECK (report_type IN ('monthly', 'yearly', 'custom', 'category', 'comparison')),
  CONSTRAINT report_exports_format_valid CHECK (format IN ('pdf', 'xlsx', 'csv', 'json')),
  CONSTRAINT report_exports_dates_valid CHECK (period_start <= period_end)
);

-- Enable RLS
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report_exports
CREATE POLICY "Users can view their own report exports"
  ON public.report_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own report exports"
  ON public.report_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own report exports"
  ON public.report_exports FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX idx_financial_goals_deadline ON public.financial_goals(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_report_exports_user_id ON public.report_exports(user_id);
CREATE INDEX idx_report_exports_created_at ON public.report_exports(created_at DESC);