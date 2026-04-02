-- Rename the existing single image_url column
ALTER TABLE public.hospital_scenery RENAME COLUMN image_url TO primary_image_url;

-- Add a new column to store multiple image URLs as JSONB
ALTER TABLE public.hospital_scenery ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing data (if any) from primary_image_url to the new image_urls array
UPDATE public.hospital_scenery
SET image_urls = jsonb_build_array(primary_image_url)
WHERE primary_image_url IS NOT NULL;

-- Drop the old column
ALTER TABLE public.hospital_scenery DROP COLUMN primary_image_url;