-- Add RLS policies for shared account transactions
-- Allow members to view transactions from their shared accounts
CREATE POLICY "Members can view shared account transactions"
ON transactions
FOR SELECT
USING (
  shared_account_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM shared_account_members 
    WHERE shared_account_members.shared_account_id = transactions.shared_account_id 
    AND shared_account_members.user_id = auth.uid()
  )
);

-- Allow members to insert transactions to their shared accounts
CREATE POLICY "Members can insert shared account transactions"
ON transactions
FOR INSERT
WITH CHECK (
  shared_account_id IS NOT NULL 
  AND auth.uid() = user_id
  AND EXISTS (
    SELECT 1 
    FROM shared_account_members 
    WHERE shared_account_members.shared_account_id = transactions.shared_account_id 
    AND shared_account_members.user_id = auth.uid()
  )
);

-- Allow transaction owners to update their own shared account transactions
CREATE POLICY "Users can update their own shared account transactions"
ON transactions
FOR UPDATE
USING (
  shared_account_id IS NOT NULL 
  AND auth.uid() = user_id
  AND EXISTS (
    SELECT 1 
    FROM shared_account_members 
    WHERE shared_account_members.shared_account_id = transactions.shared_account_id 
    AND shared_account_members.user_id = auth.uid()
  )
);

-- Allow transaction owners to delete their own shared account transactions
CREATE POLICY "Users can delete their own shared account transactions"
ON transactions
FOR DELETE
USING (
  shared_account_id IS NOT NULL 
  AND auth.uid() = user_id
  AND EXISTS (
    SELECT 1 
    FROM shared_account_members 
    WHERE shared_account_members.shared_account_id = transactions.shared_account_id 
    AND shared_account_members.user_id = auth.uid()
  )
);

-- Create a table for shared account contributions history
CREATE TABLE IF NOT EXISTS public.shared_account_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_account_id UUID NOT NULL REFERENCES public.shared_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contributions table
ALTER TABLE public.shared_account_contributions ENABLE ROW LEVEL SECURITY;

-- Members can view contributions from their shared accounts
CREATE POLICY "Members can view shared account contributions"
ON shared_account_contributions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM shared_account_members 
    WHERE shared_account_members.shared_account_id = shared_account_contributions.shared_account_id 
    AND shared_account_members.user_id = auth.uid()
  )
);

-- Members can insert contributions to their shared accounts
CREATE POLICY "Members can insert shared account contributions"
ON shared_account_contributions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 
    FROM shared_account_members 
    WHERE shared_account_members.shared_account_id = shared_account_contributions.shared_account_id 
    AND shared_account_members.user_id = auth.uid()
  )
);

-- Create function to handle adding money and recording contribution
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