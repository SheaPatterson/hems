-- 1. Create roles table
CREATE TABLE public.roles (
  id TEXT PRIMARY KEY, -- e.g., 'admin', 'dispatcher', 'pilot'
  description TEXT
);

-- Insert default roles
INSERT INTO public.roles (id, description) VALUES
('admin', 'System Administrator with full access'),
('dispatcher', 'HEMS Dispatcher with operational access'),
('pilot', 'Flight Crew member');

-- Enable RLS on roles (Read access for all authenticated users)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to roles" ON public.roles 
FOR SELECT TO authenticated USING (true);


-- 2. Create user_roles table to link users to roles
CREATE TABLE public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id TEXT REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Policy: Only admins can insert/update/delete roles (for simplicity, we won't implement admin check here, but rely on service role for initial setup)
-- For now, we will restrict insert/update/delete entirely, as roles should be managed via backend/admin tools.
-- If you need to assign roles via the app later, we will need a more complex policy.