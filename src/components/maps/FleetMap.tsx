import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HistoricalMission } from '@/hooks/useMissions';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plane, ExternalLink } from 'lucide-react';

// Fix for Leaflet default icon issue in bundlers
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

const FleetBoundsFitter: React.FC<{ missions: HistoricalMission[] }> = ({ missions }) => {
    const map = useMap();

    useEffect(() => {
        if (missions.length > 0) {
            const points = missions
                .map(m => {
                    const lat = m.tracking.latitude || m.origin.latitude;
                    const lon = m.tracking.longitude || m.origin.longitude;
                    return [lat, lon] as [number, number];
                });
            
            if (points.length > 0) {
                const bounds = L.latLngBounds(points);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
            }
        }
    }, [map, missions]);

    return null;
};

interface FleetMapProps {
    missions: HistoricalMission[];
}

const FleetMap: React.FC<FleetMapProps> = ({ missions }) => {
    // Default center (Pittsburgh)
    const center: [number, number] = [40.4406, -79.9959];

    return (
        <div className="h-full w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border z-0">
            <MapContainer 
                center={center} 
                zoom={8} 
                scrollWheelZoom={false} 
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {missions.map((m) => {
                    const lat = m.tracking.latitude || m.origin.latitude;
                    const lon = m.tracking.longitude || m.origin.longitude;
                    const position: [number, number] = [lat, lon];

                    return (
                        <Marker 
                            key={m.missionId} 
                            position={position} 
                            icon={DefaultIcon}
                        >
                            <Popup>
                                <div className="space-y-2 min-w-[200px]">
                                    <div className="flex items-center space-x-2 font-bold text-primary border-b pb-1">
                                        <Plane className="w-4 h-4" />
                                        <span>{m.helicopter.registration}</span>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <p><strong>Mission:</strong> {m.missionId}</p>
                                        <p><strong>To:</strong> {m.destination.name}</p>
                                        <p><strong>Fuel:</strong> {m.tracking.fuelRemainingLbs} lbs</p>
                                    </div>
                                    <Button asChild size="sm" className="w-full mt-2">
                                        <Link to={`/tracking/${m.missionId}`}>
                                            <ExternalLink className="w-3 h-3 mr-1" /> Track Live
                                        </Link>
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <FleetBoundsFitter missions={missions} />
            </MapContainer>
        </div>
    );
};

export default FleetMap;