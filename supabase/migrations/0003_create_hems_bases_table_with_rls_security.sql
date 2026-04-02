-- Create hems_bases table
CREATE TABLE public.hems_bases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.hems_bases ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all HEMS base data
CREATE POLICY "hems_bases_select_policy" ON public.hems_bases 
FOR SELECT TO authenticated USING (true);