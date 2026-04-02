-- Create NOTAMs table
CREATE TABLE public.notams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notams ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "notams_read_policy" ON public.notams 
FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "notams_admin_manage_policy" ON public.notams 
FOR ALL TO authenticated USING (is_admin());