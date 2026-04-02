-- Create configuration table
CREATE TABLE public.config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Policies: Only Admins can read, insert, update, or delete configuration settings.
CREATE POLICY "Admins can read config" ON public.config 
FOR SELECT TO authenticated USING (EXISTS ( SELECT 1 FROM user_roles WHERE (user_roles.user_id = auth.uid()) AND (user_roles.role_id = 'admin')));

CREATE POLICY "Admins can insert config" ON public.config 
FOR INSERT TO authenticated WITH CHECK (EXISTS ( SELECT 1 FROM user_roles WHERE (user_roles.user_id = auth.uid()) AND (user_roles.role_id = 'admin')));

CREATE POLICY "Admins can update config" ON public.config 
FOR UPDATE TO authenticated USING (EXISTS ( SELECT 1 FROM user_roles WHERE (user_roles.user_id = auth.uid()) AND (user_roles.role_id = 'admin')));

CREATE POLICY "Admins can delete config" ON public.config 
FOR DELETE TO authenticated USING (EXISTS ( SELECT 1 FROM user_roles WHERE (user_roles.user_id = auth.uid()) AND (user_roles.role_id = 'admin')));