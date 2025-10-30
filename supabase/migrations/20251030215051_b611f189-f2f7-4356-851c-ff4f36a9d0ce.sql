-- Fix security definer functions with proper input validation

-- 1. Update add_contribution_to_shared_account with comprehensive validation
CREATE OR REPLACE FUNCTION public.add_contribution_to_shared_account(
  p_account_id UUID,
  p_amount NUMERIC,
  p_description TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate membership - user must be a member of the shared account
  IF NOT EXISTS (
    SELECT 1 FROM shared_account_members 
    WHERE shared_account_id = p_account_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized: user is not a member of this shared account';
  END IF;
  
  -- Validate amount is positive and within reasonable limits
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount: must be positive';
  END IF;
  
  IF p_amount > 999999999.99 THEN
    RAISE EXCEPTION 'Invalid amount: exceeds maximum allowed value';
  END IF;
  
  -- Validate description length if provided
  IF p_description IS NOT NULL AND char_length(p_description) > 500 THEN
    RAISE EXCEPTION 'Description too long: maximum 500 characters';
  END IF;
  
  -- Update shared account balance
  UPDATE public.shared_accounts
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE id = p_account_id;
  
  -- Record contribution
  INSERT INTO public.shared_account_contributions (shared_account_id, user_id, amount, description)
  VALUES (p_account_id, auth.uid(), p_amount, p_description);
END;
$$;

-- 2. Update handle_new_user to sanitize user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  -- Sanitize display_name: remove HTML tags and limit length
  v_display_name := COALESCE(
    substring(
      regexp_replace(
        NEW.raw_user_meta_data ->> 'display_name',
        '<[^>]*>',
        '',
        'g'
      ),
      1,
      100
    ),
    substring(split_part(NEW.email, '@', 1), 1, 100)
  );

  -- Insert sanitized profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, v_display_name);
  
  -- Create default categories for the new user
  PERFORM public.create_default_categories(NEW.id);
  
  RETURN NEW;
END;
$$;

-- 3. Update create_default_categories to validate user_uuid
CREATE OR REPLACE FUNCTION public.create_default_categories(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate user_uuid is provided and matches authenticated user
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User UUID is required';
  END IF;
  
  IF auth.uid() IS NOT NULL AND user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized: can only create categories for authenticated user';
  END IF;

  -- Default income categories
  INSERT INTO public.categories (name, type, color, icon, user_id) VALUES
    ('Salário', 'income', '#10B981', '💰', user_uuid),
    ('Freelance', 'income', '#3B82F6', '💻', user_uuid),
    ('Investimentos', 'income', '#8B5CF6', '📈', user_uuid),
    ('Outros', 'income', '#6B7280', '🔄', user_uuid);
  
  -- Default expense categories  
  INSERT INTO public.categories (name, type, color, icon, user_id) VALUES
    ('Alimentação', 'expense', '#EF4444', '🍽️', user_uuid),
    ('Transporte', 'expense', '#F59E0B', '🚗', user_uuid),
    ('Moradia', 'expense', '#84CC16', '🏠', user_uuid),
    ('Saúde', 'expense', '#06B6D4', '⚕️', user_uuid),
    ('Educação', 'expense', '#8B5CF6', '📚', user_uuid),
    ('Entretenimento', 'expense', '#EC4899', '🎮', user_uuid),
    ('Roupas', 'expense', '#F97316', '👕', user_uuid),
    ('Outros', 'expense', '#6B7280', '📦', user_uuid);
END;
$$;