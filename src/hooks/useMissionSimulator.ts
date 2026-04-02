import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthGuard'; // Corrected import
import { useMissionManagement } from '@/hooks/useMissions';
import { toast } from 'sonner';
import { MissionReport, TrackingData, Waypoint, HEMS_BASES, HELICOPTERS, FlightPhase } from '@/data/hemsData'; // Corrected imports
import { calculateNextPosition, calculateFuelBurn, calculatePerformanceScore } from '@/utils/missionCalculations';
import { supabase } from '@/integrations/supabase/client';

// Define the structure for the mission state
interface MissionState {
    mission: MissionReport | null;
    tracking: TrackingData | null;
    waypoints: Waypoint[];
    status: 'idle' | 'active' | 'completed' | 'cancelled';
}

const INITIAL_TRACKING_DATA: TrackingData = {
    latitude: HEMS_BASES[0].latitude,
    longitude: HEMS_BASES[0].longitude,
    altitude: 0,
    heading: 0,
    speedKnots: 0,
    fuelRemainingLbs: HELICOPTERS[0].fuelCapacityLbs, // Corrected property name
    phase: 'standby' as FlightPhase, // Corrected type assignment
    timeEnrouteMinutes: 0,
    lastUpdate: Date.now(),
};

const updateMissionTracking = async (missionId: string, trackingData: TrackingData) => {
    const { error } = await supabase
        .from('missions')
        .update({ tracking: trackingData })
        .eq('mission_id', missionId);

    if (error) {
        console.error("Failed to update mission tracking:", error);
    }
};

export const useMissionSimulator = () => {
    const { user } = useAuth();
    const { updateStatus } = useMissionManagement();
    const [mission, setMission] = useState<MissionReport | null>(null);
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [status, setStatus] = useState<MissionState['status']>('idle');
    const [isTacticalOverride, setIsTacticalOverride] = useState(false);

    const toggleTacticalOverride = useCallback(() => {
        setIsTacticalOverride(prev => {
            toast.info(`Tactical Override ${prev ? 'Deactivated' : 'Activated'}`);
            return !prev;
        });
    }, []);

    const applyTacticalUpdate = useCallback((update: Partial<TrackingData>) => {
        if (isTacticalOverride) {
            setTracking(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    ...update,
                    lastUpdate: Date.now(),
                } as TrackingData; // Cast to ensure correct type structure
            });
        }
    }, [isTacticalOverride]);

    const startMission = useCallback(async (newMission: MissionReport) => {
        if (!user) {
            toast.error("You must be logged in to start a mission.");
            return;
        }

        const initialTracking: TrackingData = {
            ...INITIAL_TRACKING_DATA,
            latitude: newMission.hemsBase.latitude,
            longitude: newMission.hemsBase.longitude,
            fuelRemainingLbs: newMission.helicopter.fuelCapacityLbs, // Corrected property name
            phase: 'pre-flight' as FlightPhase, // Corrected type assignment
        };

        const missionData = {
            mission_id: newMission.missionId,
            user_id: user.id,
            callsign: newMission.callsign,
            mission_type: newMission.type,
            hems_base: newMission.hemsBase,
            helicopter: newMission.helicopter,
            patient_age: newMission.patientAge,
            patient_gender: newMission.patientGender,
            patient_weight_lbs: newMission.patientWeightLbs,
            patient_details: newMission.patientDetails,
            medical_response: newMission.medicalResponse,
            origin: newMission.origin,
            destination: newMission.destination,
            waypoints: newMission.waypoints,
            tracking: initialTracking,
            status: 'active',
        };

        const { error } = await supabase.from('missions').insert([missionData]);

        if (error) {
            toast.error(`Failed to start mission: ${error.message}`);
            console.error(error);
            return;
        }

        setMission(newMission);
        setTracking(initialTracking);
        setWaypoints(newMission.waypoints);
        setStatus('active');
        toast.success(`Mission ${newMission.missionId} started.`);
    }, [user]);

    const endMission = useCallback(async (finalTracking: TrackingData) => {
        if (!mission) return;

        const performanceScore = calculatePerformanceScore(mission, finalTracking);
        
        // Placeholder for a detailed flight summary
        const flightSummary = {
            totalTimeMinutes: finalTracking.timeEnrouteMinutes,
            fuelConsumedLbs: mission.helicopter.fuelCapacityLbs - finalTracking.fuelRemainingLbs, // Corrected property name
            finalFuelLbs: finalTracking.fuelRemainingLbs,
            // Add more summary data here
        };

        await updateStatus({
            missionId: mission.missionId,
            status: 'completed',
            performanceScore: performanceScore,
            flightSummary: flightSummary,
        });

        // Clear local state
        setMission(null);
        setTracking(null);
        setWaypoints([]);
        setStatus('completed');
        setIsTacticalOverride(false); // Ensure override is off
        toast.success(`Mission ${mission.missionId} completed and logged.`);
    }, [mission, updateStatus]);

    const cancelMission = useCallback(async () => {
        if (!mission) return;

        await updateStatus({
            missionId: mission.missionId,
            status: 'cancelled',
        });

        // Clear local state
        setMission(null);
        setTracking(null);
        setWaypoints([]);
        setStatus('cancelled');
        setIsTacticalOverride(false); // Ensure override is off
        toast.info(`Mission ${mission.missionId} cancelled.`);
    }, [mission, updateStatus]);

    // Main Simulation Loop
    useEffect(() => {
        if (mission && tracking && status === 'active') {
            const interval = setInterval(() => {
                let newTracking = { ...tracking };

                if (!isTacticalOverride) { // Only run simulation if override is OFF
                    const { newLat, newLon, newHeading, newSpeed } = calculateNextPosition(
                        tracking,
                        // Removed waypoints argument (Fixes Error 5 part 1)
                        mission.helicopter.cruiseSpeedKts // Corrected property name
                    );
                    
                    const fuelBurn = calculateFuelBurn(
                        // Removed tracking.speedKnots argument (Fixes Error 5 part 2)
                        mission.helicopter.fuelBurnRateLbHr // Corrected property name
                    );

                    const timeElapsed = 5000 / 60000; // 5 seconds in minutes

                    newTracking = {
                        ...newTracking,
                        latitude: newLat,
                        longitude: newLon,
                        heading: newHeading,
                        speedKnots: newSpeed,
                        fuelRemainingLbs: Math.max(0, tracking.fuelRemainingLbs - fuelBurn),
                        timeEnrouteMinutes: tracking.timeEnrouteMinutes + timeElapsed,
                        lastUpdate: Date.now(),
                        // Removed redundant assignments (Fixes Error 6)
                    };

                    // Phase progression logic (simplified)
                    if (newTracking.phase === 'pre-flight' && newTracking.speedKnots > 5) {
                        newTracking.phase = 'en-route-outbound' as FlightPhase;
                    } else if (newTracking.phase === 'en-route-outbound' && newTracking.latitude === waypoints[0].latitude && newTracking.longitude === waypoints[0].longitude) {
                        newTracking.phase = 'on-scene' as FlightPhase;
                    } else if (newTracking.phase === 'on-scene' && waypoints.length > 1 && newTracking.latitude === waypoints[1].latitude && newTracking.longitude === waypoints[1].longitude) {
                        newTracking.phase = 'en-route-inbound' as FlightPhase;
                    } else if (newTracking.phase === 'en-route-inbound' && newTracking.latitude === mission.destination.latitude && newTracking.longitude === mission.destination.longitude) {
                        newTracking.phase = 'landed' as FlightPhase;
                        // Automatically end mission upon landing at destination
                        endMission(newTracking);
                        clearInterval(interval);
                        return;
                    }
                    
                    setTracking(newTracking);
                }
                
                // Always update the database with the current tracking data (simulated or manual)
                updateMissionTracking(mission.missionId, newTracking as TrackingData);

            }, 5000); // Update every 5 seconds

            return () => clearInterval(interval);
        }
    }, [mission, tracking, status, waypoints, isTacticalOverride, endMission]);

    return {
        mission,
        tracking,
        waypoints,
        status,
        isTacticalOverride, // EXPOSED
        startMission,
        endMission: () => endMission(tracking!), // Wrapper for manual end
        cancelMission,
        toggleTacticalOverride, // EXPOSED
        applyTacticalUpdate, // EXPOSED
        isMissionActive: status === 'active',
    };
};