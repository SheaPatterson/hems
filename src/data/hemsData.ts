// src/data/hemsData.ts

export type PatientGender = 'Male' | 'Female' | 'Other' | '';
export type CrewRole = 'Pilot' | 'Flight Nurse' | 'Flight Paramedic' | 'Flight Mechanic';
export type MissionType = "Scene Call" | "Hospital Transfer";
export type FlightPhase = 'Dispatch' | 'Enroute Pickup' | 'At Scene/Transfer' | 'Enroute Dropoff' | 'At Hospital' | 'Returning to Base' | 'Complete' | 'pre-flight' | 'en-route-outbound' | 'on-scene' | 'en-route-inbound' | 'landed' | 'standby';

export const MISSION_PHASES: FlightPhase[] = ['Dispatch', 'Enroute Pickup', 'At Scene/Transfer', 'Enroute Dropoff', 'At Hospital', 'Returning to Base', 'Complete', 'pre-flight', 'en-route-outbound', 'on-scene', 'en-route-inbound', 'landed', 'standby'];

export interface Hospital {
    id: string;
    name: string;
    city: string;
    faaIdentifier: string | null;
    latitude: number;
    longitude: number;
    isTraumaCenter: boolean;
    traumaLevel: number | null;
    createdAt: string;
}

export interface Helicopter {
    id: string;
    model: string;
    registration: string;
    fuelCapacityLbs: number;
    cruiseSpeedKts: number;
    fuelBurnRateLbHr: number;
    imageUrl?: string | null;
    maintenanceStatus: 'FMC' | 'AOG';
    createdAt: string;
}

export interface CrewMember {
    id: string;
    role: CrewRole;
    name: string;
}

export interface Waypoint {
    name: string;
    latitude: number;
    longitude: number;
    type: 'base' | 'hospital' | 'scene'; 
}

export interface TrackingData {
    timeEnrouteMinutes: number;
    fuelRemainingLbs: number;
    latitude: number;
    longitude: number;
    altitudeFt?: number;
    groundSpeedKts?: number;
    headingDeg?: number;
    verticalSpeedFtMin?: number;
    phase: FlightPhase; // Changed to non-optional
    // Added for simulator compatibility
    altitude: number;
    heading: number;
    speedKnots: number;
    lastUpdate: number;
}

export interface MissionReport {
    missionId: string;
    callsign: string;
    type: MissionType;
    dateTime: string;
    hemsBase: HemsBase;
    helicopter: Helicopter;
    crew: CrewMember[];
    origin: HemsBase | Hospital;
    pickup: Hospital | Waypoint;
    destination: Hospital | Waypoint;
    patientAge: number | null;
    patientGender: PatientGender;
    patientWeightLbs: number | null;
    patientDetails: string | null;
    medicalResponse: string | null;
    waypoints: Waypoint[];
    liveData: {
        weather: string;
        mapUrl: string;
        aerialViewUrl: string;
    };
    tracking: TrackingData;
    status: 'active' | 'completed' | 'cancelled';
}

export interface HemsBase {
    id: string;
    name: string;
    location: string;
    contact: string | null;
    faaIdentifier: string | null;
    latitude: number;
    longitude: number;
    helicopterId: string | null; // Added
    assignedHelicopterRegistration: string | null; // For display
    createdAt: string;
}

// MOCK DATA FOR SIMULATOR HOOK COMPATIBILITY
export const HEMS_BASES: HemsBase[] = [{
    id: 'mock-base-1', name: 'Pittsburgh Base', location: 'Pittsburgh', contact: null, faaIdentifier: 'KAGC', latitude: 40.4406, longitude: -79.9959, helicopterId: 'mock-heli-1', assignedHelicopterRegistration: 'N420HE', createdAt: new Date().toISOString()
}];

export const HELICOPTERS: Helicopter[] = [{
    id: 'mock-heli-1', model: 'EC135', registration: 'N420HE', fuelCapacityLbs: 1500, cruiseSpeedKts: 135, fuelBurnRateLbHr: 450, maintenanceStatus: 'FMC', createdAt: new Date().toISOString()
}];