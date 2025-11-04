-- Add validation triggers for amount limits
CREATE OR REPLACE FUNCTION validate_transaction_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF NEW.amount > 999999999.99 THEN
    RAISE EXCEPTION 'Amount exceeds maximum allowed value';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_transaction_amount_trigger
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION validate_transaction_amount();

-- Add validation for shared account balance
CREATE OR REPLACE FUNCTION validate_shared_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'Shared account balance cannot be negative';
  END IF;
  
  IF NEW.balance > 999999999.99 THEN
    RAISE EXCEPTION 'Balance exceeds maximum allowed value';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_shared_account_balance_trigger
BEFORE INSERT OR UPDATE ON shared_accounts
FOR EACH ROW
EXECUTE FUNCTION validate_shared_account_balance();

-- Add validation for transaction dates
CREATE OR REPLACE FUNCTION validate_transaction_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date > CURRENT_DATE + INTERVAL '1 year' THEN
    RAISE EXCEPTION 'Transaction date cannot be more than 1 year in the future';
  END IF;
  
  IF NEW.date < CURRENT_DATE - INTERVAL '10 years' THEN
    RAISE EXCEPTION 'Transaction date cannot be more than 10 years in the past';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_transaction_date_trigger
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION validate_transaction_date();

-- Add validation for PIX keys
CREATE OR REPLACE FUNCTION validate_pix_key()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize PIX key: remove HTML tags and limit length
  NEW.pix_key := substring(
    regexp_replace(NEW.pix_key, '<[^>]*>', '', 'g'),
    1,
    500
  );
  
  IF NEW.pix_key IS NULL OR trim(NEW.pix_key) = '' THEN
    RAISE EXCEPTION 'PIX key cannot be empty';
  END IF;
  
  IF length(NEW.pix_key) > 500 THEN
    RAISE EXCEPTION 'PIX key too long';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_pix_key_trigger
BEFORE INSERT OR UPDATE ON pix_transactions
FOR EACH ROW
EXECUTE FUNCTION validate_pix_key();

-- Add validation for PIX transaction amounts
CREATE OR REPLACE FUNCTION validate_pix_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RAISE EXCEPTION 'PIX amount must be positive';
  END IF;
  
  IF NEW.amount > 999999999.99 THEN
    RAISE EXCEPTION 'PIX amount exceeds maximum allowed value';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_pix_amount_trigger
BEFORE INSERT OR UPDATE ON pix_transactions
FOR EACH ROW
EXECUTE FUNCTION validate_pix_amount();

-- Add validation for bank transfer amounts
CREATE OR REPLACE FUNCTION validate_bank_transfer_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Transfer amount must be positive';
  END IF;
  
  IF NEW.amount > 999999999.99 THEN
    RAISE EXCEPTION 'Transfer amount exceeds maximum allowed value';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_bank_transfer_amount_trigger
BEFORE INSERT OR UPDATE ON bank_transfers
FOR EACH ROW
EXECUTE FUNCTION validate_bank_transfer_amount();

-- Improve SECURITY DEFINER function with better validation
CREATE OR REPLACE FUNCTION public.add_contribution_to_shared_account(
  p_account_id uuid, 
  p_amount numeric, 
  p_description text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate membership
  IF NOT EXISTS (
    SELECT 1 FROM shared_account_members 
    WHERE shared_account_id = p_account_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized: user is not a member of this shared account';
  END IF;
  
  -- Validate amount
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount: must be positive';
  END IF;
  
  IF p_amount > 999999999.99 THEN
    RAISE EXCEPTION 'Invalid amount: exceeds maximum allowed value';
  END IF;
  
  -- Sanitize and validate description
  IF p_description IS NOT NULL THEN
    p_description := substring(
      regexp_replace(p_description, '<[^>]*>', '', 'g'),
      1,
      500
    );
    
    IF char_length(p_description) > 500 THEN
      RAISE EXCEPTION 'Description too long: maximum 500 characters';
    END IF;
  END IF;
  
  -- Check if resulting balance would exceed limit
  IF EXISTS (
    SELECT 1 FROM shared_accounts 
    WHERE id = p_account_id 
    AND (balance + p_amount) > 999999999.99
  ) THEN
    RAISE EXCEPTION 'Contribution would exceed maximum account balance';
  END IF;
  
  -- Update shared account balance
  UPDATE public.shared_accounts
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE id = p_account_id;
  
  -- Record contribution
  INSERT INTO public.shared_account_contributions (
    shared_account_id, 
    user_id, 
    amount, 
    description
  )
  VALUES (p_account_id, auth.uid(), p_amount, p_description);
END;
$function$;