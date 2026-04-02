import {
  MissionReport,
  MissionType,
  HemsBase,
  Helicopter,
  CrewMember,
  Hospital,
  Waypoint,
} from "@/data/hemsData";
import { calculateDistance } from "./flightCalculations";

const generateWaypoints = (start: { latitude: number, longitude: number, name: string, type: Waypoint['type'] }, end: { latitude: number, longitude: number, name: string, type: Waypoint['type'] }): Waypoint[] => {
    return [
        { name: start.name, latitude: start.latitude, longitude: start.longitude, type: start.type },
        { name: end.name, latitude: end.latitude, longitude: end.longitude, type: end.type },
    ];
};

export const generateMissionReport = (
  type: MissionType,
  base: HemsBase,
  helicopter: Helicopter,
  crew: CrewMember[],
  origin: HemsBase,
  pickup: Hospital | Waypoint,
  patientDetails: string,
  medicalResponse: string,
): MissionReport => {
  const missionId = `HEMS-${Date.now().toString().slice(-6)}`;
  const dateTime = new Date().toISOString();

  const startPoint = {
      latitude: origin.latitude,
      longitude: origin.longitude,
      name: origin.name,
      type: 'base' as Waypoint['type'],
  };

  const endPoint = {
      latitude: pickup.latitude,
      longitude: pickup.longitude,
      name: pickup.name,
      type: 'scene' as Waypoint['type'],
  };

  const waypoints = generateWaypoints(startPoint, endPoint);
  const distanceNM = calculateDistance(startPoint.latitude, startPoint.longitude, endPoint.latitude, endPoint.longitude);
  const estimatedFlightTimeMinutes = Math.round((distanceNM / helicopter.cruiseSpeedKts) * 60);

  return {
    missionId,
    callsign: base.name.toUpperCase(),
    type,
    dateTime,
    hemsBase: base,
    helicopter,
    crew,
    origin,
    pickup,
    destination: ('isTraumaCenter' in pickup) ? pickup : base as any, // Temporary fallback
    patientAge: null,
    patientGender: '',
    patientWeightLbs: null,
    patientDetails,
    medicalResponse,
    waypoints,
    liveData: {
      weather: "VFR",
      mapUrl: "",
      aerialViewUrl: "",
    },
    tracking: {
      timeEnrouteMinutes: estimatedFlightTimeMinutes,
      fuelRemainingLbs: helicopter.fuelCapacityLbs,
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
      phase: 'Dispatch', // Initial phase
      altitude: 0,
      heading: 0,
      speedKnots: 0,
      lastUpdate: Date.now(),
    },
    status: 'active', // Added missing status field
  };
};