DROP POLICY IF EXISTS "Allow authenticated read helicopters" ON public.helicopters;
CREATE POLICY "Allow authenticated read helicopters" ON public.helicopters
FOR SELECT TO authenticated USING (true);