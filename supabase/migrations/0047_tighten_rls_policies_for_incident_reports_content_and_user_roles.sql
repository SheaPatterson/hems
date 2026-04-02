-- 1. Secure Incident Reports
DROP POLICY IF EXISTS "Users can view all incident reports" ON public.incident_reports;

-- Regular users see only their own, Admins see all
CREATE POLICY "Users can view their own incident reports" ON public.incident_reports
FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id = 'admin')
);

-- 2. Secure Dynamic Content (Prevent unauthorized XSS injection at the DB level)
DROP POLICY IF EXISTS "Allow authenticated users to insert content" ON public.content;
DROP POLICY IF EXISTS "Allow authenticated users to update content" ON public.content;

CREATE POLICY "Admins can manage content" ON public.content 
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id = 'admin')
);

-- 3. Secure User Roles (Prevent self-promotion)
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Only admins can manage roles" ON public.user_roles
FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role_id = 'admin'
  )
);