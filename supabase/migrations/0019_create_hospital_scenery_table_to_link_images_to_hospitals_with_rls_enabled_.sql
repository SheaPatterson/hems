-- Create hospital_scenery table
CREATE TABLE public.hospital_scenery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (hospital_id) -- Ensure only one scenery entry per hospital for simplicity
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.hospital_scenery ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated users can read all scenery (public gallery)
CREATE POLICY "Allow authenticated users to read all scenery" ON public.hospital_scenery 
FOR SELECT TO authenticated USING (true);

-- Policies: Only admins can insert, update, or delete scenery (Admin Guard handles role check)
CREATE POLICY "Admins can manage scenery" ON public.hospital_scenery 
FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role_id = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role_id = 'admin'));