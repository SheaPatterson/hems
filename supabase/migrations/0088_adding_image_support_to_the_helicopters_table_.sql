-- Add the image_url column to helicopters
ALTER TABLE public.helicopters ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ensure authenticated users can still read the table (it should already be enabled, but reinforcing)
ALTER TABLE public.helicopters ENABLE ROW LEVEL SECURITY;