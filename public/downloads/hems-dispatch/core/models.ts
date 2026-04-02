export interface TelemetryData {
    latitude: number;
    longitude: number;
    altitudeFt: number;
    groundSpeedKts: number;
    headingDeg: number;
    fuelRemainingLbs: number;
    timestamp: number;
}

export interface BridgeStatus {
    simConnected: boolean;
    cloudConnected: boolean;
    activeMissionId: string | null;
    lastPacketReceived: number;
}

export interface MissionState {
    missionId: string;
    callsign: string;
    phase: string;
    destination: string;
    distToTargetNM: number;
    eteMinutes: number;
}