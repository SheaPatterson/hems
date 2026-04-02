-- Create global dispatch logs table
CREATE TABLE public.global_dispatch_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL, -- 'Dispatcher', 'Crew', or 'System'
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  callsign TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.global_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read the global radio stack
CREATE POLICY "global_logs_select" ON public.global_dispatch_logs 
FOR SELECT TO authenticated USING (true);

-- Authenticated users can transmit on the global frequency
CREATE POLICY "global_logs_insert" ON public.global_dispatch_logs 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);