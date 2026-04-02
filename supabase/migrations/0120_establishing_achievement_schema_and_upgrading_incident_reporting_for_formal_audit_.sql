-- 1. Create Achievements Table
CREATE TABLE public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "achievements_public_read" ON public.achievements 
FOR SELECT USING (true);

CREATE POLICY "achievements_admin_manage" ON public.achievements 
FOR ALL TO authenticated USING (public.is_admin());

-- 2. Upgrade Incident Reports Table
ALTER TABLE public.incident_reports 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Open',
ADD COLUMN IF NOT EXISTS resolution TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incident_reports(status);