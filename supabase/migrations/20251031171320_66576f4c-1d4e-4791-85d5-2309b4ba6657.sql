-- Tabela para salvar filtros personalizados do usuário
CREATE TABLE public.saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  filter_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT saved_filters_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  CONSTRAINT saved_filters_description_length CHECK (char_length(description) <= 500 OR description IS NULL)
);

-- Tabela para compartilhamento de relatórios entre usuários
CREATE TABLE public.shared_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  report_config JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64'),
  expires_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT shared_reports_title_length CHECK (char_length(title) >= 2 AND char_length(title) <= 200),
  CONSTRAINT shared_reports_description_length CHECK (char_length(description) <= 1000 OR description IS NULL),
  CONSTRAINT shared_reports_type_valid CHECK (report_type IN ('analytics', 'transactions', 'categories', 'goals', 'custom')),
  CONSTRAINT shared_reports_views_positive CHECK (views_count >= 0)
);

-- Tabela para controlar quem pode acessar relatórios compartilhados
CREATE TABLE public.shared_report_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_report_id UUID NOT NULL REFERENCES public.shared_reports(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT,
  can_edit BOOLEAN DEFAULT false,
  accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT shared_report_access_unique UNIQUE (shared_report_id, user_id),
  CONSTRAINT shared_report_access_email_or_user CHECK (user_id IS NOT NULL OR email IS NOT NULL),
  CONSTRAINT shared_report_access_email_format CHECK (
    email IS NULL OR (
      email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
      AND char_length(email) <= 320
    )
  )
);

-- Índices para melhorar performance
CREATE INDEX idx_saved_filters_user_id ON public.saved_filters(user_id);
CREATE INDEX idx_saved_filters_is_default ON public.saved_filters(user_id, is_default);
CREATE INDEX idx_shared_reports_owner_id ON public.shared_reports(owner_id);
CREATE INDEX idx_shared_reports_access_token ON public.shared_reports(access_token) WHERE access_token IS NOT NULL;
CREATE INDEX idx_shared_reports_is_public ON public.shared_reports(is_public) WHERE is_public = true;
CREATE INDEX idx_shared_report_access_report_id ON public.shared_report_access(shared_report_id);
CREATE INDEX idx_shared_report_access_user_id ON public.shared_report_access(user_id) WHERE user_id IS NOT NULL;

-- RLS para saved_filters
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own filters"
ON public.saved_filters
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own filters"
ON public.saved_filters
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filters"
ON public.saved_filters
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filters"
ON public.saved_filters
FOR DELETE
USING (auth.uid() = user_id);

-- RLS para shared_reports
ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shared reports"
ON public.shared_reports
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public shared reports"
ON public.shared_reports
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users with access can view shared reports"
ON public.shared_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_report_access
    WHERE shared_report_id = shared_reports.id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own shared reports"
ON public.shared_reports
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own shared reports"
ON public.shared_reports
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own shared reports"
ON public.shared_reports
FOR DELETE
USING (auth.uid() = owner_id);

-- RLS para shared_report_access
ALTER TABLE public.shared_report_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Report owners can manage access"
ON public.shared_report_access
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.shared_reports
    WHERE id = shared_report_id
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own access grants"
ON public.shared_report_access
FOR SELECT
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_saved_filters_updated_at
BEFORE UPDATE ON public.saved_filters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shared_reports_updated_at
BEFORE UPDATE ON public.shared_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para incrementar visualizações de relatórios compartilhados
CREATE OR REPLACE FUNCTION public.increment_report_views(p_report_id UUID, p_access_token TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validar que o relatório existe e está acessível
  IF NOT EXISTS (
    SELECT 1 FROM shared_reports
    WHERE id = p_report_id
    AND (
      is_public = true
      OR owner_id = auth.uid()
      OR (p_access_token IS NOT NULL AND access_token = p_access_token)
      OR EXISTS (
        SELECT 1 FROM shared_report_access
        WHERE shared_report_id = p_report_id
        AND user_id = auth.uid()
      )
    )
  ) THEN
    RAISE EXCEPTION 'Report not found or access denied';
  END IF;

  -- Incrementar visualizações
  UPDATE shared_reports
  SET views_count = views_count + 1
  WHERE id = p_report_id;

  -- Registrar acesso se for um usuário autenticado
  IF auth.uid() IS NOT NULL THEN
    UPDATE shared_report_access
    SET accessed_at = now()
    WHERE shared_report_id = p_report_id
    AND user_id = auth.uid();
  END IF;
END;
$$;

-- Função para limpar relatórios expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_shared_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM shared_reports
  WHERE expires_at IS NOT NULL
  AND expires_at < now();
END;
$$;