import { HemsBase, Helicopter, Hospital, Waypoint as CoreWaypoint } from "@/data/hemsData";

export interface Location {
    name: string;
    latitude: number;
    longitude: number;
    faaIdentifier: string;
}

export const MOCK_SCENE_LOCATION: Location = {
    name: "Mock Scene Location",
    latitude: 34.0522,
    longitude: -118.2437,
    faaIdentifier: "SCENE",
};

export interface FlightMetrics {
    distanceNM: number;
    estimatedFlightTimeMinutes: number;
    estimatedFuelBurnLbs: number;
    fuelReserveLbs: number;
    goNoGo: boolean;
    reason: string;
    legs?: {
        name: string;
        distance: number;
        time: number;
    }[];
}

export type PatientGender = 'Male' | 'Female' | 'Other' | '';

export type CrewRole = 'Pilot' | 'Flight Nurse' | 'Flight Paramedic' | 'Flight Mechanic';
export const CREW_ROLES: CrewRole[] = ['Pilot', 'Flight Nurse', 'Flight Paramedic', 'Flight Mechanic'];

export interface CrewMember {
    id: string;
    role: CrewRole | string;
    name: string;
}

export type MissionType = "Scene Call" | "Hospital Transfer";

export interface MissionFormState {
    missionType: MissionType;
    selectedBaseId: string | null;
    selectedHelicopter: Helicopter | null;
    selectedOriginId: string | null;
    selectedDestinationId: string | null;
    selectedSceneLocation: Location | null;
    selectedFinalHospitalId: string | null;
    crew: CrewMember[];
    patientAge: string;
    patientGender: PatientGender;
    patientWeightLbs: string;
    patientDetails: string;
    medicalResponse: string;
    flightMetrics: FlightMetrics | null;
    waypoints: CoreWaypoint[];
}

export const initialMissionState: MissionFormState = {
    missionType: "Scene Call",
    selectedBaseId: null,
    selectedHelicopter: null,
    selectedOriginId: null,
    selectedDestinationId: null,
    selectedSceneLocation: null,
    selectedFinalHospitalId: null,
    crew: [],
    patientAge: '',
    patientGender: '',
    patientWeightLbs: '',
    patientDetails: '',
    medicalResponse: '',
    flightMetrics: null,
    waypoints: [],
};

export interface MissionPlannerProps {
    hospitals: Hospital[];
    bases: HemsBase[];
    helicopters: Helicopter[];
    initialState?: Partial<MissionFormState>; // Added for pre-filling
}

export interface StepProps extends MissionPlannerProps {
    formState: MissionFormState;
    updateFormState: (updates: Partial<MissionFormState>) => void;
    onNext: () => void;
    onBack: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
}