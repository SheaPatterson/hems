-- 1. Create the telemetry_summary table
CREATE TABLE public.telemetry_summary (
  mission_id TEXT PRIMARY KEY REFERENCES public.missions(mission_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  callsign TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phase TEXT,
  fuel_remaining_lbs INTEGER,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS (REQUIRED)
ALTER TABLE public.telemetry_summary ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies: Pilots can read all active summaries (public map view)
CREATE POLICY "Allow authenticated users to read all telemetry summaries" ON public.telemetry_summary 
FOR SELECT TO authenticated USING (true);

-- 4. Create RLS policies: Only the system (via trigger/admin) should insert/update, but we'll allow authenticated users to update their own for simplicity in the trigger logic.
CREATE POLICY "Allow owner to update their own telemetry summary" ON public.telemetry_summary 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow owner to insert their own telemetry summary" ON public.telemetry_summary 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin to manage all telemetry summaries" ON public.telemetry_summary 
FOR ALL TO service_role USING (is_admin()) WITH CHECK (is_admin());