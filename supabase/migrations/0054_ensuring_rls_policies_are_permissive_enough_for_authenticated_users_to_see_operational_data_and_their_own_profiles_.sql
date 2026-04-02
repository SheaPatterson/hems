-- Fix permissions for user_roles so users can see their own status
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Allow authenticated users to read all roles" ON public.user_roles FOR SELECT TO authenticated USING (true);

-- Fix permissions for profiles so users can see basic info for the directory
DROP POLICY IF EXISTS "profiles_public_read_policy" ON public.profiles;
CREATE POLICY "profiles_authenticated_read_policy" ON public.profiles FOR SELECT TO authenticated USING (true);

-- Ensure missions table exists and is readable
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  mission_type TEXT NOT NULL,
  hems_base JSONB NOT NULL,
  helicopter JSONB NOT NULL,
  crew JSONB NOT NULL,
  origin JSONB NOT NULL,
  pickup JSONB,
  destination JSONB NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  patient_weight_lbs INTEGER,
  patient_details TEXT,
  medical_response TEXT,
  waypoints JSONB,
  tracking JSONB DEFAULT '{"latitude": 0, "longitude": 0, "fuelRemainingLbs": 0, "timeEnrouteMinutes": 0}'::jsonb,
  live_data JSONB DEFAULT '{"weather": "VFR"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own missions" ON public.missions;
CREATE POLICY "Users can view their own missions" ON public.missions FOR SELECT TO authenticated USING (auth.uid() = user_id);