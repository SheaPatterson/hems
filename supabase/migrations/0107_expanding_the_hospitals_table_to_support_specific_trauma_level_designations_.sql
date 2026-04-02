-- Add trauma_level column to hospitals table
ALTER TABLE public.hospitals ADD COLUMN trauma_level INTEGER DEFAULT NULL;

-- Migrate existing data: if is_trauma_center was true, assume Level 1 as the default for existing records
UPDATE public.hospitals SET trauma_level = 1 WHERE is_trauma_center = true;