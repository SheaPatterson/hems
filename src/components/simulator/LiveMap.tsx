"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Waypoint } from '@/data/hemsData';

// Fix for Leaflet default icon issue in bundlers
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Apply the fix to the default Leaflet icon class
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const AircraftIcon = L.divIcon({
    className: 'live-aircraft-marker',
    html: `<div class="p-1 rounded-full bg-primary border-2 border-white shadow-[0_0_15px_rgba(255,165,0,0.8)] flex items-center justify-center animate-pulse"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const WaypointIcon = L.icon({
    iconRetinaUrl, 
    iconUrl, 
    shadowUrl,
    iconSize: [20, 32], 
    iconAnchor: [10, 32],
});

const MapFitter: React.FC<{ coords: [number, number], waypoints?: Waypoint[] }> = ({ coords, waypoints }) => {
    const map = useMap();
    const [initialFitDone, setInitialFitDone] = useState(false);

    useEffect(() => {
        if (waypoints && waypoints.length > 0 && !initialFitDone) {
            const bounds = L.latLngBounds([coords, ...waypoints.map(w => [w.latitude, w.longitude] as [number, number])]);
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 14 });
            setInitialFitDone(true);
        } else if (initialFitDone) {
            // After initial fit, just pan to the new aircraft position without changing zoom
            map.panTo(coords, { animate: true, duration: 1.0 });
        }
    }, [coords, map, waypoints, initialFitDone]);

    return null;
};

interface LiveMapProps {
    latitude: number;
    longitude: number;
    status: string;
    waypoints?: Waypoint[];
}

const LiveMap: React.FC<LiveMapProps> = ({ latitude, longitude, status, waypoints }) => {
    const position: [number, number] = [latitude, longitude];
    
    const polylinePositions = useMemo(() => 
        waypoints?.map(wp => [wp.latitude, wp.longitude] as [number, number]) || [], 
    [waypoints]);

    return (
        <div className="h-full w-full rounded-lg overflow-hidden shadow-lg z-0 bg-zinc-100">
            <MapContainer 
                center={position} 
                zoom={13} 
                scrollWheelZoom={true} 
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Route Visualization */}
                {polylinePositions.length > 1 && (
                    <Polyline 
                        positions={polylinePositions} 
                        pathOptions={{ color: '#f97316', weight: 5, opacity: 0.6, dashArray: '10, 15' }} 
                    />
                )}

                {/* Planned Waypoints */}
                {waypoints?.map((wp, idx) => (
                    <Marker key={idx} position={[wp.latitude, wp.longitude]} icon={WaypointIcon}>
                        <Popup>
                            <p className="font-bold text-xs uppercase">{wp.name}</p>
                            <p className="text-[10px] text-muted-foreground">{wp.type}</p>
                        </Popup>
                    </Marker>
                ))}

                {/* Active Aircraft */}
                <Marker position={position} icon={AircraftIcon}>
                    <Popup className="tactical-popup">
                        <div className="space-y-1">
                            <p className="font-black uppercase tracking-tighter text-primary">LIVE TRACK</p>
                            <p className="text-xs font-bold">STATUS: {status}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
                        </div>
                    </Popup>
                </Marker>

                <MapFitter coords={position} waypoints={waypoints} />
            </MapContainer>
        </div>
    );
};

export default LiveMap;