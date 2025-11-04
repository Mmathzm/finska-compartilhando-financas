-- Fix search_path for validation functions to prevent security warnings
CREATE OR REPLACE FUNCTION validate_transaction_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF NEW.amount > 999999999.99 THEN
    RAISE EXCEPTION 'Amount exceeds maximum allowed value';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_shared_account_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'Shared account balance cannot be negative';
  END IF;
  
  IF NEW.balance > 999999999.99 THEN
    RAISE EXCEPTION 'Balance exceeds maximum allowed value';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_transaction_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.date > CURRENT_DATE + INTERVAL '1 year' THEN
    RAISE EXCEPTION 'Transaction date cannot be more than 1 year in the future';
  END IF;
  
  IF NEW.date < CURRENT_DATE - INTERVAL '10 years' THEN
    RAISE EXCEPTION 'Transaction date cannot be more than 10 years in the past';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_pix_key()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION validate_pix_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RAISE EXCEPTION 'PIX amount must be positive';
  END IF;
  
  IF NEW.amount > 999999999.99 THEN
    RAISE EXCEPTION 'PIX amount exceeds maximum allowed value';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_bank_transfer_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Transfer amount must be positive';
  END IF;
  
  IF NEW.amount > 999999999.99 THEN
    RAISE EXCEPTION 'Transfer amount exceeds maximum allowed value';
  END IF;
  
  RETURN NEW;
END;
$$;