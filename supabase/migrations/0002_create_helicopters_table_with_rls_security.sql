-- Create helicopters table
CREATE TABLE public.helicopters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model TEXT NOT NULL,
  registration TEXT NOT NULL UNIQUE,
  fuel_capacity_lbs INTEGER NOT NULL,
  cruise_speed_kts INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.helicopters ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all helicopter data
CREATE POLICY "helicopters_select_policy" ON public.helicopters 
FOR SELECT TO authenticated USING (true);

-- Allow admins to insert, update, and delete helicopter data (assuming 'admin' role exists)
-- Note: We will rely on application logic or admin tools to manage this data, but for now, we'll allow authenticated users to insert/update/delete for testing, which can be restricted later.
-- For simplicity and immediate functionality, we will skip INSERT/UPDATE/DELETE policies for now, as the user only requested data setup.