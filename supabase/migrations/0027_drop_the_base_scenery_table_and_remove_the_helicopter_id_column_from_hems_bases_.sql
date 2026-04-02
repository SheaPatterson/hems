-- Drop the base_scenery table
DROP TABLE IF EXISTS public.base_scenery;

-- Remove the helicopter_id column from hems_bases
ALTER TABLE public.hems_bases
DROP COLUMN IF EXISTS helicopter_id;