-- 1. Reset access rules for HEMS Bases
DROP POLICY IF EXISTS "hems_bases_public_select" ON public.hems_bases;
DROP POLICY IF EXISTS "Allow authenticated read hems_bases" ON public.hems_bases;

-- Simple, fast read access for all team members
CREATE POLICY "hems_bases_read_policy" 
ON public.hems_bases 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Clear and re-seed the primary HEMS bases to ensure data is fresh
DELETE FROM public.hems_bases;

-- Note: We link these to the helicopters seeded in earlier steps
INSERT INTO public.hems_bases (name, location, faa_identifier, latitude, longitude, helicopter_id)
VALUES 
('LifeFlight 1', 'Metro Health (PA)', 'LF1', 40.4406, -79.9959, (SELECT id FROM helicopters WHERE registration = 'N123LF' LIMIT 1)),
('LifeFlight 2', 'Allegheny Co. (PA)', 'LF2', 40.3544, -79.9300, (SELECT id FROM helicopters WHERE registration = 'N456LF' LIMIT 1)),
('STAT 1', 'Pittsburgh (PA)', 'ST1', 40.4500, -80.0000, (SELECT id FROM helicopters WHERE registration = 'N789ST' LIMIT 1)),
('STAT 3', 'Johnstown (PA)', 'ST3', 40.3267, -78.9220, (SELECT id FROM helicopters WHERE registration = 'N101ST' LIMIT 1));

ALTER TABLE public.hems_bases ENABLE ROW LEVEL SECURITY;