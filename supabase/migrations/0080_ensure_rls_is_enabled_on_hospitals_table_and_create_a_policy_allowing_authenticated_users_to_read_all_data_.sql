-- 1. Ensure RLS is enabled
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if it exists (to ensure clean recreation)
DROP POLICY IF EXISTS "Allow authenticated read hospitals" ON public.hospitals;

-- 3. Create policy allowing authenticated users to read all data
CREATE POLICY "Allow authenticated read hospitals" ON public.hospitals
FOR SELECT TO authenticated
USING (true);