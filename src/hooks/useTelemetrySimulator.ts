import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FlightPhase, Waypoint } from '@/data/hemsData';
import { getPhaseForWaypointIndex } from '@/utils/flightCalculations'; // Import the new utility

const EDGE_FUNCTION_URL = "https://orhfcrrydmgxradibbqb.supabase.co/functions/v1/update-telemetry";
const TELEMETRY_UPDATE_INTERVAL_MS = 4000; // Update every 4 seconds

export interface TelemetryData {
  timeEnrouteMinutes: number;
  fuelRemainingLbs: number;
  latitude: number;
  longitude: number;
  altitudeFt?: number;
  groundSpeedKts?: number;
  headingDeg?: number;
  verticalSpeedFtMin?: number;
  phase?: FlightPhase;
}

interface UseTelemetrySimulatorProps {
  missionId: string;
  initialTracking: TelemetryData;
  helicopterId: string;
  waypoints: Waypoint[];
  onUpdateSuccess: (newTracking: TelemetryData) => void;
}

export const useTelemetrySimulator = ({
  missionId,
  initialTracking,
  helicopterId,
  waypoints,
  onUpdateSuccess,
}: UseTelemetrySimulatorProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [fuelBurnRate, setFuelBurnRate] = useState(450);
  const intervalRef = useRef<number | null>(null);
  const currentTrackingRef = useRef<TelemetryData>(initialTracking);
  
  // Track our progress along the waypoint array
  const currentWaypointIndexRef = useRef(0);

  useEffect(() => {
    currentTrackingRef.current = initialTracking;
    // Reset index if mission changes
    currentWaypointIndexRef.current = 0;
  }, [initialTracking]);

  useEffect(() => {
    const fetchSpecs = async () => {
        const { data } = await supabase
            .from('helicopters')
            .select('fuel_burn_rate_lb_hr')
            .eq('id', helicopterId)
            .single();
        if (data) setFuelBurnRate(data.fuel_burn_rate_lb_hr);
    };
    if (helicopterId) fetchSpecs();
  }, [helicopterId]);

  const sendTelemetry = async (payload: TelemetryData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    try {
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ mission_id: missionId, ...payload }),
        });

        if (!response.ok) throw new Error("API Rejection");

        currentTrackingRef.current = payload;
        onUpdateSuccess(payload);
        return true;
    } catch (error) { 
        return false; 
    }
  };

  const startSimulation = () => {
    if (isRunning || waypoints.length < 2) return;
    setIsRunning(true);
    toast.info("Engaging flight simulation...");

    let currentHeading = currentTrackingRef.current.headingDeg || 90;
    let currentAltitude = currentTrackingRef.current.altitudeFt || 1000;

    const updateLoop = async () => {
      const current = currentTrackingRef.current;
      const currentLegIndex = currentWaypointIndexRef.current;
      
      // If we reached the end of the planned route, stop the simulation
      if (currentLegIndex >= waypoints.length - 1) {
          stopSimulation();
          return;
      }

      const targetWp = waypoints[currentLegIndex + 1];
      
      // Calculate interpolation (move 5% closer to target each interval)
      const step = 0.05;
      const newLat = current.latitude + (targetWp.latitude - current.latitude) * step;
      const newLon = current.longitude + (targetWp.longitude - current.longitude) * step;

      // Simple mock flight dynamics
      currentAltitude = Math.min(10000, currentAltitude + 50); // Climb slowly
      currentHeading = (currentHeading + 1) % 360; // Rotate slowly

      // Check for waypoint arrival
      const dist = Math.sqrt(Math.pow(targetWp.latitude - newLat, 2) + Math.pow(targetWp.longitude - newLon, 2));
      if (dist < 0.005) {
          currentWaypointIndexRef.current++;
          toast.success(`Arrived at Waypoint: ${targetWp.name}`);
      }

      // Use utility function to determine phase
      const phase = getPhaseForWaypointIndex(currentWaypointIndexRef.current, waypoints.length);
      
      const intervalHours = TELEMETRY_UPDATE_INTERVAL_MS / (1000 * 3600);
      const payload: TelemetryData = {
        timeEnrouteMinutes: current.timeEnrouteMinutes + 1,
        fuelRemainingLbs: Math.max(0, current.fuelRemainingLbs - Math.round(fuelBurnRate * intervalHours)),
        latitude: newLat,
        longitude: newLon,
        phase,
        altitudeFt: currentAltitude,
        groundSpeedKts: 120, // Mock constant speed
        headingDeg: currentHeading,
        verticalSpeedFtMin: 500, // Mock constant climb
      };

      await sendTelemetry(payload);
    };

    updateLoop();
    intervalRef.current = setInterval(updateLoop, TELEMETRY_UPDATE_INTERVAL_MS) as unknown as number;
  };

  const stopSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    toast.info("Simulation paused.");
  };

  return { isRunning, startSimulation, stopSimulation, sendManualTelemetry: sendTelemetry };
};