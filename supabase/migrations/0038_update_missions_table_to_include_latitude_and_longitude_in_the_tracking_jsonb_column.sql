ALTER TABLE missions
ALTER COLUMN tracking SET DEFAULT '{"timeEnrouteMinutes": 0, "fuelRemainingLbs": 0, "latitude": 0.0, "longitude": 0.0}'::jsonb;