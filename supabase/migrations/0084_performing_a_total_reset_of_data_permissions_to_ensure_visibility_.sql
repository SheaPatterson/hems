-- 1. Reset and open Hospitals
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "hospitals_read_auth" ON public.hospitals;
DROP POLICY IF EXISTS "hospitals_select_policy" ON public.hospitals;
CREATE POLICY "hospitals_public_select" ON public.hospitals FOR SELECT USING (true);

-- 2. Reset and open HEMS Bases
ALTER TABLE public.hems_bases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hems_bases" ON public.hems_bases;
DROP POLICY IF EXISTS "hems_bases_read_auth" ON public.hems_bases;
DROP POLICY IF EXISTS "hems_bases_select_policy" ON public.hems_bases;
CREATE POLICY "hems_bases_public_select" ON public.hems_bases FOR SELECT USING (true);

-- 3. Reset and open Helicopters (needed for the join)
ALTER TABLE public.helicopters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read helicopters" ON public.helicopters;
DROP POLICY IF EXISTS "helicopters_read_auth" ON public.helicopters;
DROP POLICY IF EXISTS "helicopters_select_policy" ON public.helicopters;
CREATE POLICY "helicopters_public_select" ON public.helicopters FOR SELECT USING (true);

-- Ensure permissions are granted to all roles
GRANT SELECT ON public.hospitals TO anon, authenticated;
GRANT SELECT ON public.hems_bases TO anon, authenticated;
GRANT SELECT ON public.helicopters TO anon, authenticated;