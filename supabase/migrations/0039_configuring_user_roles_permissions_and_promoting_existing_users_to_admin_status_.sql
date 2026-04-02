-- Ensure the 'admin' role exists
INSERT INTO public.roles (id, description) 
VALUES ('admin', 'System Administrator with full access')
ON CONFLICT (id) DO NOTHING;

-- Grant 'admin' role to all existing profiles to ensure you have access
INSERT INTO public.user_roles (user_id, role_id)
SELECT id, 'admin' FROM public.profiles
ON CONFLICT DO NOTHING;

-- Update RLS policies for user_roles to allow admins to manage roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role_id = 'admin'
  )
);

-- Allow all authenticated users to view roles (needed for the directory)
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (true);