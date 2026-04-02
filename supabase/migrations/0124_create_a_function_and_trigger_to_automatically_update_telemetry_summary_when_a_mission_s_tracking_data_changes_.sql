-- 1. Function to update telemetry_summary
CREATE OR REPLACE FUNCTION public.update_telemetry_summary()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the mission is active and tracking data exists
  IF NEW.status = 'active' AND NEW.tracking IS NOT NULL THEN
    INSERT INTO public.telemetry_summary (
      mission_id, 
      user_id, 
      callsign, 
      latitude, 
      longitude, 
      phase, 
      fuel_remaining_lbs, 
      last_update
    ) VALUES (
      NEW.mission_id, 
      NEW.user_id, 
      NEW.callsign, 
      (NEW.tracking ->> 'latitude')::DOUBLE PRECISION, 
      (NEW.tracking ->> 'longitude')::DOUBLE PRECISION, 
      NEW.tracking ->> 'phase', 
      (NEW.tracking ->> 'fuelRemainingLbs')::INTEGER, 
      NOW()
    )
    ON CONFLICT (mission_id) DO UPDATE SET
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      phase = EXCLUDED.phase,
      fuel_remaining_lbs = EXCLUDED.fuel_remaining_lbs,
      last_update = EXCLUDED.last_update;
  ELSE
    -- If mission is completed or cancelled, remove it from the summary table
    DELETE FROM public.telemetry_summary WHERE mission_id = NEW.mission_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Create Trigger on missions table
DROP TRIGGER IF EXISTS tr_update_telemetry_summary ON public.missions;
CREATE TRIGGER tr_update_telemetry_summary
AFTER UPDATE OF tracking, status ON public.missions
FOR EACH ROW
EXECUTE FUNCTION public.update_telemetry_summary();