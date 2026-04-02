export interface XPlaneDataRef {
    name: string;
    value: number;
}

export interface TelemetryUpdate {
    latitude: number;
    longitude: number;
    altitudeFt: number;
    groundSpeedKts: number;
    headingDeg: number;
    verticalSpeedFtMin: number;
    fuelRemainingLbs: number; // Added
    timeEnrouteMinutes: number; // Added
    engineStatus: 'Running' | 'Idle' | 'Shutdown';
}