import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HemsBase } from '@/data/hemsData';
import { HistoricalMission } from '@/hooks/useMissions';
import { Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MapContainerWrapper from '@/components/MapContainer';
import WeatherRadarOverlay from '@/components/dashboard/WeatherRadar';
import { useLivePilots } from '@/hooks/useLivePilots';

const BaseIcon = L.divIcon({
    className: 'base-marker',
    html: `<div class="p-1.5 rounded-full bg-primary text-primary-foreground border-2 border-white shadow-xl flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const MissionAircraftIcon = L.divIcon({
    className: 'aircraft-marker',
    html: `<div class="p-1.5 rounded-full bg-primary text-black border-2 border-white shadow-[0_0_15px_rgba(255,165,0,0.8)] flex items-center justify-center animate-pulse"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const FreeAircraftIcon = L.divIcon({
    className: 'aircraft-marker',
    html: `<div class="p-1.5 rounded-full bg-green-600 text-white border-2 border-white shadow-[0_0_15px_rgba(22,163,74,0.6)] flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const MapBoundsFitter: React.FC<{ points: [number, number][] }> = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
    }, [map, points]);
    return null;
};

interface TacticalMapProps {
    missions: HistoricalMission[];
    bases: HemsBase[];
}

const TacticalMap: React.FC<TacticalMapProps> = ({ missions, bases }) => {
    const { data: livePilots } = useLivePilots();
    const center: [number, number] = [40.4406, -79.9959];

    // Separate pilots into those on active missions and those free-flying
    const missionUserIds = new Set(missions.map(m => m.user_id));
    const standalonePilots = livePilots?.filter(p => !missionUserIds.has(p.user_id)) || [];

    const boundPoints = useMemo(() => {
        const p: [number, number][] = [];
        bases.forEach(b => p.push([b.latitude, b.longitude]));
        missions.forEach(m => p.push([m.tracking.latitude, m.tracking.longitude]));
        standalonePilots.forEach(pilot => p.push([pilot.latitude, pilot.longitude]));
        return p;
    }, [bases, missions, standalonePilots]);

    return (
        <MapContainerWrapper className="h-full border-none rounded-none bg-zinc-100 relative">
            <WeatherRadarOverlay />
            
            <MapContainer 
                center={center} 
                zoom={9} 
                scrollWheelZoom={true} 
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Bases */}
                {bases.map(base => (
                    <Marker key={base.id} position={[base.latitude, base.longitude]} icon={BaseIcon}>
                        <Popup className="tactical-popup">
                            <div className="space-y-1">
                                <p className="font-black uppercase tracking-tighter text-primary">HEMS BASE: {base.name}</p>
                                <p className="text-xs font-bold text-muted-foreground">{base.location}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Active Mission Tracks */}
                {missions.map(mission => (
                    <Marker key={mission.missionId} position={[mission.tracking.latitude, mission.tracking.longitude]} icon={MissionAircraftIcon}>
                        <Popup>
                            <div className="space-y-2 min-w-[180px]">
                                <div className="flex justify-between items-center border-b pb-1">
                                    <span className="font-black italic text-primary">{mission.callsign}</span>
                                    <Badge variant="outline" className="text-[9px]">MISSION ACTIVE</Badge>
                                </div>
                                <div className="space-y-1 text-xs">
                                    <p><strong>Phase:</strong> {mission.tracking.phase || 'ENROUTE'}</p>
                                    <p><strong>Dest:</strong> {mission.destination.name}</p>
                                </div>
                                <Button asChild size="sm" className="w-full mt-2 h-7 text-[10px] font-bold uppercase italic">
                                    <a href={`/tracking/${mission.missionId}`}>Lock Tactical Tracking</a>
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Standalone Live Pilot Tracks */}
                {standalonePilots.map(pilot => (
                    <Marker key={pilot.user_id} position={[pilot.latitude, pilot.longitude]} icon={FreeAircraftIcon}>
                        <Popup>
                            <div className="space-y-2 min-w-[180px]">
                                <div className="flex justify-between items-center border-b pb-1">
                                    <span className="font-black italic text-primary">{pilot.callsign}</span>
                                    <Badge variant="secondary" className="text-[9px]">AVAILABLE</Badge>
                                </div>
                                <div className="space-y-1 text-[10px]">
                                    <p><strong>Altitude:</strong> {pilot.altitude_ft} FT</p>
                                    <p><strong>Speed:</strong> {pilot.ground_speed_kts} KT</p>
                                    <p><strong>Fuel:</strong> {pilot.fuel_remaining_lbs} LB</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBoundsFitter points={boundPoints} />
            </MapContainer>

            {/* Tactical Info Overlay */}
            <div className="absolute bottom-6 right-6 z-[500] pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md p-5 rounded-2xl border border-primary/20 text-[#00ff41] font-mono shadow-2xl min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-3">
                        <div className="flex items-center space-x-2">
                            <Satellite className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Radar</span>
                        </div>
                        <div className="text-[8px] font-bold opacity-40 uppercase tracking-widest">v5.2-STABLE</div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                            <span className="text-white/40">Sorties Active</span>
                            <span className="text-primary font-black">{missions.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                            <span className="text-white/40">Free Units</span>
                            <span className="text-[#00ff41] font-black">{standalonePilots.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                            <span className="text-white/40">Uplink Status</span>
                            <span className="text-green-500 font-black">NOMINAL</span>
                        </div>
                    </div>
                </div>
            </div>
        </MapContainerWrapper>
    );
};

export default TacticalMap;