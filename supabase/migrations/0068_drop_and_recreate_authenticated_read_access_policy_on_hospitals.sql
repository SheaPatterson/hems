DROP POLICY IF EXISTS "Allow authenticated read access to hospitals" ON public.hospitals;
CREATE POLICY "Allow authenticated read access to hospitals" ON public.hospitals
FOR SELECT TO authenticated USING (true);