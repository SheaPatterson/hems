-- 1. Create a safe function to check admin status (SECURITY DEFINER bypasses recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_id = 'admin'
  );
END;
$$;

-- 2. Completely reset user_roles policies to be non-recursive
DROP POLICY IF EXISTS "user_roles_read_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_manage_policy" ON public.user_roles;

-- Allow all authenticated users to see roles (safe for internal team app)
CREATE POLICY "user_roles_read_auth" ON public.user_roles 
FOR SELECT TO authenticated USING (true);

-- Allow admins to manage roles using the new safe function
CREATE POLICY "user_roles_manage_admin" ON public.user_roles 
FOR ALL TO authenticated USING (is_admin());

-- 3. Fix other tables that were using recursive subqueries
-- Incident Reports
DROP POLICY IF EXISTS "Users can view their own incident reports" ON public.incident_reports;
CREATE POLICY "incident_reports_read_policy" ON public.incident_reports 
FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_admin());

-- Content
DROP POLICY IF EXISTS "Admins can manage content" ON public.content;
CREATE POLICY "content_manage_policy" ON public.content 
FOR ALL TO authenticated USING (is_admin());

-- Scenery and Downloads
DROP POLICY IF EXISTS "Admins can manage scenery" ON public.hospital_scenery;
CREATE POLICY "hospital_scenery_manage_admin" ON public.hospital_scenery FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage base scenery" ON public.base_scenery;
CREATE POLICY "base_scenery_manage_admin" ON public.base_scenery FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage downloads" ON public.downloads;
CREATE POLICY "downloads_manage_admin" ON public.downloads FOR ALL TO authenticated USING (is_admin());

-- Config
DROP POLICY IF EXISTS "Admins can read config" ON public.config;
DROP POLICY IF EXISTS "Admins can insert config" ON public.config;
DROP POLICY IF EXISTS "Admins can update config" ON public.config;
DROP POLICY IF EXISTS "Admins can delete config" ON public.config;
CREATE POLICY "config_manage_admin" ON public.config FOR ALL TO authenticated USING (is_admin());