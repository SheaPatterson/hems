-- 1. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- 2. Create a flat read policy (Safe: allows users to see role assignments)
CREATE POLICY "user_roles_read_policy" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Create a management policy for admins
-- We use a subquery that specifically avoids recursion for the session user
CREATE POLICY "user_roles_admin_manage_policy" 
ON public.user_roles 
FOR ALL 
TO authenticated 
USING (
  (SELECT COUNT(*) FROM public.user_roles WHERE user_id = auth.uid() AND role_id = 'admin') > 0
)
WITH CHECK (
  (SELECT COUNT(*) FROM public.user_roles WHERE user_id = auth.uid() AND role_id = 'admin') > 0
);

-- 4. Ensure RLS is still active
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;