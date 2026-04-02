import { Waypoint, FlightPhase } from '@/data/hemsData';

/**
 * Calculates the distance between two GPS coordinates in Nautical Miles (NM).
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return distanceKm * 0.539957; // Convert km to NM
};

/**
 * Determines the current flight phase based on the aircraft's proximity to waypoints.
 * This is a simplified logic for the mock plugin.
 * 
 * @param currentLat Current latitude
 * @param currentLon Current longitude
 * @param waypoints Array of mission waypoints
 * @param lastReachedIndex Index of the last confirmed waypoint
 * @returns The index of the last reached waypoint and the determined FlightPhase.
 */
export const determineFlightPhase = (
    currentLat: number, 
    currentLon: number, 
    waypoints: Waypoint[], 
    lastReachedIndex: number
): { newIndex: number, phase: FlightPhase } => {
    let newIndex = lastReachedIndex;
    const totalWaypoints = waypoints.length;

    if (totalWaypoints < 2) {
        return { newIndex, phase: 'Dispatch' };
    }

    // Check if we are close to the next target waypoint
    const nextTargetIndex = lastReachedIndex + 1;

    if (nextTargetIndex < totalWaypoints) {
        const targetWp = waypoints[nextTargetIndex];
        const distanceToTargetNM = calculateDistance(currentLat, currentLon, targetWp.latitude, targetWp.longitude);
        
        // Threshold for "arrival" (e.g., 0.5 NM)
        if (distanceToTargetNM < 0.005) { // Reduced threshold for simulation accuracy
            newIndex = nextTargetIndex;
        }
    }

    // Determine phase based on the last reached index
    if (newIndex >= totalWaypoints - 1) {
        return { newIndex: totalWaypoints - 1, phase: 'Complete' };
    }
    
    // Assuming a standard 4-waypoint mission: [Base, Pickup, Dropoff, Base]
    if (totalWaypoints === 4) {
        if (newIndex === 0) return { newIndex, phase: 'Enroute Pickup' };
        if (newIndex === 1) return { newIndex, phase: 'At Scene/Transfer' };
        if (newIndex === 2) return { newIndex, phase: 'Returning to Base' };
    }
    
    // For other missions or mid-flight
    if (newIndex === 0) return { newIndex, phase: 'Enroute Pickup' };
    if (newIndex > 0 && newIndex < totalWaypoints - 1) return { newIndex, phase: 'Enroute Dropoff' };

    return { newIndex, phase: 'Dispatch' };
};