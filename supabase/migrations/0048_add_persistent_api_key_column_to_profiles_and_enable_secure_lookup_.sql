-- Add api_key column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS api_key UUID DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS profiles_api_key_idx ON public.profiles(api_key);

-- Ensure RLS allows users to see their own key
-- (Already covered by existing profiles_select_policy)