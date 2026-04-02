import { Helicopter, Waypoint, FlightPhase } from '@/data/hemsData';

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return distanceKm * 0.539957; 
};

export interface FlightMetrics {
    distanceNM: number;
    estimatedFlightTimeMinutes: number;
    estimatedFuelBurnLbs: number;
    fuelReserveLbs: number;
    goNoGo: boolean;
    reason: string;
    legs: {
        name: string;
        distance: number;
        time: number;
    }[];
}

interface FlightConfig {
    fuelReserveMinutes: number;
}

export const calculateFlightMetrics = (
    waypoints: Waypoint[], 
    helicopter: Helicopter,
    config: FlightConfig
): FlightMetrics => {
    if (waypoints.length < 2) {
        return {
            distanceNM: 0, estimatedFlightTimeMinutes: 0, estimatedFuelBurnLbs: 0, fuelReserveLbs: 0, goNoGo: false, reason: "Insufficient waypoints.", legs: []
        };
    }

    let totalDistanceNM = 0;
    const legs: any[] = [];
    
    for (let i = 0; i < waypoints.length - 1; i++) {
        const start = waypoints[i];
        const end = waypoints[i + 1];
        const dist = calculateDistance(start.latitude, start.longitude, end.latitude, end.longitude);
        const time = Math.round((dist / helicopter.cruiseSpeedKts) * 60);
        
        totalDistanceNM += dist;
        legs.push({
            name: `${start.name} -> ${end.name}`,
            distance: parseFloat(dist.toFixed(1)),
            time
        });
    }
    
    const estimatedFlightTimeMinutes = legs.reduce((acc, l) => acc + l.time, 0);
    const estimatedFlightTimeHours = estimatedFlightTimeMinutes / 60;
    const estimatedFuelBurnLbs = Math.round(estimatedFlightTimeHours * helicopter.fuelBurnRateLbHr);
    const requiredReserveLbs = (config.fuelReserveMinutes / 60) * helicopter.fuelBurnRateLbHr;
    const totalRequiredFuelLbs = estimatedFuelBurnLbs + requiredReserveLbs;
    const fuelReserveLbs = helicopter.fuelCapacityLbs - totalRequiredFuelLbs;
    
    let goNoGo = true;
    let reason = "All metrics within operational limits.";

    if (fuelReserveLbs < 0) {
        goNoGo = false;
        reason = `Insufficient fuel. Total circuit requires ${Math.ceil(totalRequiredFuelLbs)} Lbs, capacity is ${helicopter.fuelCapacityLbs} Lbs.`;
    }

    return {
        distanceNM: parseFloat(totalDistanceNM.toFixed(1)),
        estimatedFlightTimeMinutes,
        estimatedFuelBurnLbs,
        fuelReserveLbs: Math.round(fuelReserveLbs),
        goNoGo,
        reason,
        legs
    };
};

/**
 * Determines the current flight phase based on the index of the last reached waypoint.
 * Assumes a standard 4-waypoint mission: [Base, Pickup, Dropoff, Base].
 * 
 * @param lastReachedWaypointIndex The index of the last waypoint reached (0 = start, 3 = complete).
 * @param totalWaypoints The total number of waypoints (should be 4 for a full circuit).
 * @returns The current FlightPhase.
 */
export const getPhaseForWaypointIndex = (lastReachedWaypointIndex: number, totalWaypoints: number): FlightPhase => {
    if (lastReachedWaypointIndex >= totalWaypoints - 1) {
        return 'Complete';
    }
    
    // Index 0: Flying Leg 1 (Base -> Pickup)
    if (lastReachedWaypointIndex === 0) {
        return 'Enroute Pickup';
    }
    
    // Index 1: Flying Leg 2 (Pickup -> Dropoff)
    if (lastReachedWaypointIndex === 1) {
        // If the pickup point was just reached, the next phase is the flight to the dropoff point
        return 'Enroute Dropoff';
    }
    
    // Index 2: Flying Leg 3 (Dropoff -> Base)
    if (lastReachedWaypointIndex === 2) {
        return 'Returning to Base';
    }

    // Default fallback (e.g., if mission is just starting or has unexpected structure)
    return 'Dispatch';
};