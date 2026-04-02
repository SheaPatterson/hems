-- Add performance tracking to missions
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS performance_score INTEGER DEFAULT 100;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS flight_summary JSONB DEFAULT '{}'::jsonb;

-- Add maintenance status to helicopters
ALTER TABLE public.helicopters ADD COLUMN IF NOT EXISTS maintenance_status TEXT DEFAULT 'FMC'; -- FMC = Full Mission Capable, AOG = Aircraft on Ground
ALTER TABLE public.helicopters ADD COLUMN IF NOT EXISTS last_inspection TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS updates for these new columns
DROP POLICY IF EXISTS "missions_update_policy" ON public.missions;
CREATE POLICY "missions_update_policy" ON public.missions 
FOR UPDATE TO authenticated USING ((auth.uid() = user_id) OR is_admin());