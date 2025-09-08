-- Fix critical shared_accounts RLS policy bug
DROP POLICY IF EXISTS "Users can view shared accounts they are members of" ON public.shared_accounts;

-- Create corrected policy for shared_accounts SELECT
CREATE POLICY "Users can view shared accounts they are members of" 
ON public.shared_accounts 
FOR SELECT 
USING (
  (auth.uid() = created_by) OR 
  (EXISTS (
    SELECT 1 
    FROM shared_account_members 
    WHERE shared_account_members.shared_account_id = shared_accounts.id 
    AND shared_account_members.user_id = auth.uid()
  ))
);

-- Fix infinite recursion by creating security definer functions
CREATE OR REPLACE FUNCTION public.is_shared_account_owner(account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM shared_accounts 
    WHERE id = account_id 
    AND created_by = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_shared_account_member(account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM shared_account_members 
    WHERE shared_account_id = account_id 
    AND user_id = auth.uid()
  );
$$;

-- Recreate shared_account_members policies using security definer functions
DROP POLICY IF EXISTS "Account owners can manage members" ON public.shared_account_members;
DROP POLICY IF EXISTS "Users can view shared account memberships" ON public.shared_account_members;

CREATE POLICY "Account owners can manage members" 
ON public.shared_account_members 
FOR ALL 
USING (public.is_shared_account_owner(shared_account_id));

CREATE POLICY "Users can view shared account memberships" 
ON public.shared_account_members 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  public.is_shared_account_owner(shared_account_id)
);