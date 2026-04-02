ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS flight_logs JSONB DEFAULT '[]'::jsonb;