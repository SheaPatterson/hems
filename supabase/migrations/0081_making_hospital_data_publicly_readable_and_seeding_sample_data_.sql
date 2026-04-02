-- 1. Enable RLS and set public read access for all users
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hospitals" ON public.hospitals;
CREATE POLICY "Allow public read hospitals" ON public.hospitals FOR SELECT USING (true);

ALTER TABLE public.hems_bases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hems_bases" ON public.hems_bases;
CREATE POLICY "Allow public read hems_bases" ON public.hems_bases FOR SELECT USING (true);

ALTER TABLE public.helicopters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read helicopters" ON public.helicopters;
CREATE POLICY "Allow public read helicopters" ON public.helicopters FOR SELECT USING (true);

-- 2. Seed sample hospitals if the table is empty
INSERT INTO public.hospitals (name, city, faa_identifier, latitude, longitude, is_trauma_center)
SELECT 'Penn Presbyterian Medical Center', 'Philadelphia', 'PS01', 39.9575, -75.1927, true
WHERE NOT EXISTS (SELECT 1 FROM public.hospitals LIMIT 1);

INSERT INTO public.hospitals (name, city, faa_identifier, latitude, longitude, is_trauma_center)
SELECT 'Hospital of the University of Pennsylvania', 'Philadelphia', 'PS02', 39.9490, -75.1932, true
WHERE NOT EXISTS (SELECT 1 FROM public.hospitals WHERE name = 'Hospital of the University of Pennsylvania');