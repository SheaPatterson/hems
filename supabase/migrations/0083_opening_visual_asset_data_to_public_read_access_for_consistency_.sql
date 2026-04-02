-- Ensure hospital scenery is publicly readable
ALTER TABLE public.hospital_scenery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read all scenery" ON public.hospital_scenery;
DROP POLICY IF EXISTS "Allow public read hospital scenery" ON public.hospital_scenery;
CREATE POLICY "Allow public read hospital scenery" ON public.hospital_scenery FOR SELECT USING (true);

-- Ensure base scenery is publicly readable
ALTER TABLE public.base_scenery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access to base scenery" ON public.base_scenery;
DROP POLICY IF EXISTS "Allow public read base scenery" ON public.base_scenery;
CREATE POLICY "Allow public read base scenery" ON public.base_scenery FOR SELECT USING (true);

-- Ensure permissions are correctly set for anonymous users
GRANT SELECT ON public.hospital_scenery TO anon, authenticated;
GRANT SELECT ON public.base_scenery TO anon, authenticated;