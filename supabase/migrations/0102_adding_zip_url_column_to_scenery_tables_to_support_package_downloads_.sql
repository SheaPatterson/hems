-- Add zip_url to hospital_scenery
ALTER TABLE public.hospital_scenery ADD COLUMN IF NOT EXISTS zip_url TEXT;

-- Add zip_url to base_scenery
ALTER TABLE public.base_scenery ADD COLUMN IF NOT EXISTS zip_url TEXT;