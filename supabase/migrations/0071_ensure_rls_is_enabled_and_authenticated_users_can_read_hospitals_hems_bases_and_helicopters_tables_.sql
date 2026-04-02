-- 1. Hospitals
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hospitals_read_auth ON public.hospitals;
CREATE POLICY hospitals_read_auth ON public.hospitals
FOR SELECT TO authenticated USING (true);

-- 2. HEMS Bases
ALTER TABLE public.hems_bases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hems_bases_read_auth ON public.hems_bases;
CREATE POLICY hems_bases_read_auth ON public.hems_bases
FOR SELECT TO authenticated USING (true);

-- 3. Helicopters
ALTER TABLE public.helicopters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS helicopters_read_auth ON public.helicopters;
CREATE POLICY helicopters_read_auth ON public.helicopters
FOR SELECT TO authenticated USING (true);