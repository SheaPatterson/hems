-- 1. Add the helicopter_id column to hems_bases
ALTER TABLE public.hems_bases ADD COLUMN IF NOT EXISTS helicopter_id UUID REFERENCES public.helicopters(id) ON DELETE SET NULL;

-- 2. Link some existing mock data for consistency (example mapping)
-- Note: This assumes specific registration patterns match base names for the initial data.
UPDATE public.hems_bases 
SET helicopter_id = (SELECT id FROM public.helicopters WHERE registration = 'N123HA' LIMIT 1) 
WHERE name = 'LifeFlight 1';

UPDATE public.hems_bases 
SET helicopter_id = (SELECT id FROM public.helicopters WHERE registration = 'N456HB' LIMIT 1) 
WHERE name = 'Stat MedEvac 3';