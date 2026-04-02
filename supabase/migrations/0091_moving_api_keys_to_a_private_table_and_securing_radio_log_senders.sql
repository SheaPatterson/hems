-- 1. Secure API Keys: Move from 'profiles' to a private 'user_api_keys' table
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key UUID DEFAULT gen_random_uuid() NOT NULL,
  PRIMARY KEY (user_id)
);

-- Enable RLS on the new table
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Only allow users to see and rotate their own keys
CREATE POLICY "user_api_keys_select_own" ON public.user_api_keys 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "user_api_keys_update_own" ON public.user_api_keys 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Migrate existing keys
INSERT INTO public.user_api_keys (user_id, api_key) 
SELECT id, api_key FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- REMOVE the leaked column from profiles (CRITICAL FIX)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS api_key;

-- Update the new user trigger to populate the secret table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name'
  );
  
  -- Create the private API key entry
  INSERT INTO public.user_api_keys (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$;

-- 2. Prevent Impersonation: Add trigger to sanitize radio log senders
CREATE OR REPLACE FUNCTION public.sanitize_radio_log_sender()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- If the user is NOT an admin, force the sender name to 'Crew'
  IF NOT public.is_admin() THEN
    NEW.sender := 'Crew';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sanitize_radio_log_sender ON public.global_dispatch_logs;
CREATE TRIGGER tr_sanitize_radio_log_sender
BEFORE INSERT ON public.global_dispatch_logs
FOR EACH ROW EXECUTE FUNCTION public.sanitize_radio_log_sender();