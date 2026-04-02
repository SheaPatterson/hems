-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  faa_identifier TEXT UNIQUE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_trauma_center BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all hospital data
CREATE POLICY "hospitals_select_policy" ON public.hospitals 
FOR SELECT TO authenticated USING (true);