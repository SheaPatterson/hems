-- 1. Policies for Hospitals
CREATE POLICY "hospitals_manage_admin" ON public.hospitals 
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 2. Policies for Helicopters
CREATE POLICY "helicopters_manage_admin" ON public.helicopters 
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3. Policies for HEMS Bases
CREATE POLICY "hems_bases_manage_admin" ON public.hems_bases 
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 4. Ensure the current user has the admin role
-- This is a safety check to make sure you can actually use the policies above
INSERT INTO public.user_roles (user_id, role_id)
SELECT auth.uid(), 'admin'
FROM auth.users
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, role_id) DO NOTHING;