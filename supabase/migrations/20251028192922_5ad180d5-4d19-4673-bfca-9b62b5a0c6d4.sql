-- Create shared account invitations table
CREATE TABLE public.shared_account_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_account_id uuid NOT NULL REFERENCES public.shared_accounts(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL,
  invited_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(shared_account_id, invited_email, status)
);

-- Enable RLS
ALTER TABLE public.shared_account_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations
CREATE POLICY "Account owners can manage invitations"
ON public.shared_account_invitations
FOR ALL
USING (is_shared_account_owner(shared_account_id));

CREATE POLICY "Invited users can view their invitations"
ON public.shared_account_invitations
FOR SELECT
USING (
  invited_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Invited users can update their invitations"
ON public.shared_account_invitations
FOR UPDATE
USING (
  invited_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_shared_account_invitations_email ON public.shared_account_invitations(invited_email);
CREATE INDEX idx_shared_account_invitations_status ON public.shared_account_invitations(status);

-- Create function to automatically add creator as owner member
CREATE OR REPLACE FUNCTION public.handle_new_shared_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add the creator as an owner member
  INSERT INTO public.shared_account_members (shared_account_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-add creator as member
CREATE TRIGGER on_shared_account_created
AFTER INSERT ON public.shared_accounts
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_shared_account();