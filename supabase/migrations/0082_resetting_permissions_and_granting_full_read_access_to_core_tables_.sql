-- Ensure RLS is enabled but permissive for reading
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hospitals" ON public.hospitals;
CREATE POLICY "Allow public read hospitals" ON public.hospitals FOR SELECT USING (true);

ALTER TABLE public.hems_bases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hems_bases" ON public.hems_bases;
CREATE POLICY "Allow public read hems_bases" ON public.hems_bases FOR SELECT USING (true);

ALTER TABLE public.helicopters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read helicopters" ON public.helicopters;
CREATE POLICY "Allow public read helicopters" ON public.helicopters FOR SELECT USING (true);

-- Ensure the public can actually 'see' the tables
GRANT SELECT ON public.hospitals TO anon, authenticated;
GRANT SELECT ON public.hems_bases TO anon, authenticated;
GRANT SELECT ON public.helicopters TO anon, authenticated;