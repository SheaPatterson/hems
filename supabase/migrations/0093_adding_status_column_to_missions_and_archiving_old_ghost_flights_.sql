-- Add status column to missions
ALTER TABLE missions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);

-- Cleanup: Mark any missions older than 12 hours as completed automatically
UPDATE missions 
SET status = 'completed' 
WHERE status = 'active' 
AND created_at < NOW() - INTERVAL '12 hours';