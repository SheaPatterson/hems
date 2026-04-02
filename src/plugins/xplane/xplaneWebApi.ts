"use client";

import { TelemetryUpdate } from './types';
import XPlaneWebAPI from './xplane-web-api-sdk';

let api: XPlaneWebAPI;

export const initXPlaneConnection = async (host: string, port: number): Promise<boolean> => {
    api = new XPlaneWebAPI(host, port);
    return await api.connect();
};

const DATAREFS = [
    "sim/flightmodel/position/latitude",
    "sim/flightmodel/position/longitude",
    "sim/flightmodel/position/elevation",      // meters MSL
    "sim/flightmodel/position/groundspeed",    // m/s
    "sim/flightmodel/position/true_psi",       // degrees
    "sim/flightmodel/position/vh_ind_fpm",
    "sim/flightmodel/weight/m_fuel_total",     // kg
    "sim/flightmodel2/engines/n1_percent[0]"   // N1 %
];

export async function getTelemetry(): Promise<TelemetryUpdate> {
    if (!api) throw new Error("X-Plane API not initialized.");

    const values = await Promise.all(DATAREFS.map(dr => api.getDataRef(dr)));
    
    const [
        latitude,
        longitude,
        altitudeMslM,
        groundSpeedMs,
        headingDeg,
        verticalSpeedFtMin,
        fuelKg,
        engineN1
    ] = values.map(v => v ?? 0);

    // Unit Conversions
    const altitudeFt = altitudeMslM * 3.28084;
    const groundSpeedKts = groundSpeedMs * 1.94384;
    const fuelRemainingLbs = fuelKg * 2.20462;

    return {
        latitude,
        longitude,
        altitudeFt: Math.round(altitudeFt),
        groundSpeedKts: Math.round(groundSpeedKts),
        headingDeg: Math.round(headingDeg),
        verticalSpeedFtMin: Math.round(verticalSpeedFtMin),
        fuelRemainingLbs: Math.round(fuelRemainingLbs),
        timeEnrouteMinutes: 0, // This will be calculated in the hook
        engineStatus: engineN1 > 20 ? 'Running' : 'Shutdown',
    };
}