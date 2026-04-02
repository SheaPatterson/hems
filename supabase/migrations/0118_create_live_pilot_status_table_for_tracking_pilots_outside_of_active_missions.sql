-- Create live_pilot_status table
CREATE TABLE IF NOT EXISTS public.live_pilot_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  altitude_ft INTEGER,
  ground_speed_kts INTEGER,
  heading_deg INTEGER,
  fuel_remaining_lbs INTEGER,
  phase TEXT,
  callsign TEXT
);

-- Enable RLS
ALTER TABLE public.live_pilot_status ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all live statuses (for the global map)
CREATE POLICY "live_status_select_policy" 
ON public.live_pilot_status FOR SELECT 
TO authenticated 
USING (true);

-- Allow users to update their own status
CREATE POLICY "live_status_all_policy" 
ON public.live_pilot_status FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);