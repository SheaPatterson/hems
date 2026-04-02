DROP POLICY IF EXISTS "Allow authenticated read access to HEMS bases" ON public.hems_bases;
CREATE POLICY "Allow authenticated read access to HEMS bases" ON public.hems_bases
FOR SELECT TO authenticated USING (true);