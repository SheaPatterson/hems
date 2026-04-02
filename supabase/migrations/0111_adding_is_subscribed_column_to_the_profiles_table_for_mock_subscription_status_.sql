-- supabase/migrations/0111_add_is_subscribed_to_profiles_and_default_to_true.sql
ALTER TABLE public.profiles
ADD COLUMN is_subscribed BOOLEAN DEFAULT TRUE;

-- Update existing profiles to be subscribed by default
UPDATE public.profiles
SET is_subscribed = TRUE
WHERE is_subscribed IS NULL;