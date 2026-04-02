-- Create missions table
CREATE TABLE public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id TEXT UNIQUE NOT NULL, -- Store the HEMS-XXXXXX identifier
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_type TEXT NOT NULL,
  hems_base JSONB NOT NULL,
  helicopter JSONB NOT NULL,
  crew JSONB NOT NULL,
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  patient_details TEXT,
  medical_response TEXT,
  waypoints JSONB,
  live_data JSONB,
  tracking JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Policies (Users can only manage their own missions)
CREATE POLICY "Users can view their own missions" ON public.missions 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions" ON public.missions 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" ON public.missions 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions" ON public.missions 
FOR DELETE TO authenticated USING (auth.uid() = user_id);