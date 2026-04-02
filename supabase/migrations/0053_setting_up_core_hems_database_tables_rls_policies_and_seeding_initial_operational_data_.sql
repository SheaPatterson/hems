-- 1. Ensure core tables exist with correct structure
CREATE TABLE IF NOT EXISTS public.helicopters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model TEXT NOT NULL,
  registration TEXT NOT NULL UNIQUE,
  fuel_capacity_lbs INTEGER NOT NULL,
  cruise_speed_kts INTEGER NOT NULL,
  fuel_burn_rate_lb_hr INTEGER DEFAULT 450,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hems_bases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  faa_identifier TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  contact TEXT,
  helicopter_id UUID REFERENCES public.helicopters(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  faa_identifier TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_trauma_center BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS and add standard Read policies for Authenticated Users
ALTER TABLE public.helicopters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hems_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read helicopters" ON public.helicopters;
CREATE POLICY "Allow authenticated read helicopters" ON public.helicopters FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read hems_bases" ON public.hems_bases;
CREATE POLICY "Allow authenticated read hems_bases" ON public.hems_bases FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read hospitals" ON public.hospitals;
CREATE POLICY "Allow authenticated read hospitals" ON public.hospitals FOR SELECT TO authenticated USING (true);

-- 3. Seed initial data if tables are empty
-- Insert Helicopters
INSERT INTO public.helicopters (model, registration, fuel_capacity_lbs, cruise_speed_kts, fuel_burn_rate_lb_hr)
SELECT 'EC135', 'N135ST', 1200, 120, 450
WHERE NOT EXISTS (SELECT 1 FROM public.helicopters WHERE registration = 'N135ST');

INSERT INTO public.helicopters (model, registration, fuel_capacity_lbs, cruise_speed_kts, fuel_burn_rate_lb_hr)
SELECT 'EC145', 'N145AH', 1500, 130, 550
WHERE NOT EXISTS (SELECT 1 FROM public.helicopters WHERE registration = 'N145AH');

-- Insert HEMS Bases (coordinates roughly in Western PA)
INSERT INTO public.hems_bases (name, location, faa_identifier, latitude, longitude)
SELECT 'STAT MedEvac 1', 'Pittsburgh, PA', 'PS2', 40.4406, -79.9959
WHERE NOT EXISTS (SELECT 1 FROM public.hems_bases WHERE name = 'STAT MedEvac 1');

INSERT INTO public.hems_bases (name, location, faa_identifier, latitude, longitude)
SELECT 'LifeFlight 2', 'Tarentum, PA', 'LF2', 40.6015, -79.7534
WHERE NOT EXISTS (SELECT 1 FROM public.hems_bases WHERE name = 'LifeFlight 2');

-- Insert Hospitals
INSERT INTO public.hospitals (name, city, faa_identifier, latitude, longitude, is_trauma_center)
SELECT 'UPMC Presbyterian', 'Pittsburgh', 'PA01', 40.4411, -79.9585, true
WHERE NOT EXISTS (SELECT 1 FROM public.hospitals WHERE name = 'UPMC Presbyterian');

INSERT INTO public.hospitals (name, city, faa_identifier, latitude, longitude, is_trauma_center)
SELECT 'Allegheny General Hospital', 'Pittsburgh', 'PA02', 40.4566, -80.0039, true
WHERE NOT EXISTS (SELECT 1 FROM public.hospitals WHERE name = 'Allegheny General Hospital');

INSERT INTO public.hospitals (name, city, faa_identifier, latitude, longitude, is_trauma_center)
SELECT 'Washington Hospital', 'Washington', 'PA03', 40.1740, -80.2462, false
WHERE NOT EXISTS (SELECT 1 FROM public.hospitals WHERE name = 'Washington Hospital');