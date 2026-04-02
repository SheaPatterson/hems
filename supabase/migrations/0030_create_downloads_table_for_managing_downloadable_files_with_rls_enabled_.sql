-- Create downloads table
CREATE TABLE public.downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Policies: Allow authenticated users to read all downloads
CREATE POLICY "Allow authenticated read access to downloads" ON public.downloads 
FOR SELECT TO authenticated USING (true);

-- Policies: Allow admins to manage downloads
CREATE POLICY "Admins can manage downloads" ON public.downloads 
FOR ALL TO authenticated 
USING (EXISTS ( SELECT 1 FROM user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role_id = 'admin'::text))))
WITH CHECK (EXISTS ( SELECT 1 FROM user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role_id = 'admin'::text))));