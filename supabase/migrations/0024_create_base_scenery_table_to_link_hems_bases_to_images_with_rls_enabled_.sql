-- Create base_scenery table
CREATE TABLE public.base_scenery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_id UUID NOT NULL REFERENCES public.hems_bases(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.base_scenery ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all base scenery
CREATE POLICY "Allow authenticated read access to base scenery" ON public.base_scenery 
FOR SELECT TO authenticated USING (true);

-- Allow admins to manage base scenery
CREATE POLICY "Admins can manage base scenery" ON public.base_scenery 
FOR ALL TO authenticated USING (EXISTS ( SELECT 1 FROM user_roles WHERE (user_roles.user_id = auth.uid()) AND (user_roles.role_id = 'admin'::text)))
WITH CHECK (EXISTS ( SELECT 1 FROM user_roles WHERE (user_roles.user_id = auth.uid()) AND (user_roles.role_id = 'admin'::text)));