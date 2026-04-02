-- Add new professional columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS email_public TEXT,
ADD COLUMN IF NOT EXISTS simulators TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Comment on columns for clarity
COMMENT ON COLUMN public.profiles.simulators IS 'Text list of flight simulators used (e.g., X-Plane 12, MSFS)';
COMMENT ON COLUMN public.profiles.experience IS 'Description of HEMS or flight experience';
COMMENT ON COLUMN public.profiles.social_links IS 'JSON object for social media URLs';