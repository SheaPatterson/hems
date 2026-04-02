import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Waypoint } from '@/data/hemsData';

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

// Component to automatically fit map bounds to markers
const MapBoundsFitter: React.FC<{ waypoints: Waypoint[] }> = ({ waypoints }) => {
    const map = useMap();

    useEffect(() => {
        if (waypoints.length > 0) {
            const bounds = L.latLngBounds(waypoints.map(wp => [wp.latitude, wp.longitude]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, waypoints]);

    return null;
};

interface RouteMapProps {
    waypoints: Waypoint[];
}

const RouteMap: React.FC<RouteMapProps> = ({ waypoints }) => {
    // Default center if no waypoints (e.g., Pittsburgh)
    const center: [number, number] = waypoints.length > 0 
        ? [waypoints[0].latitude, waypoints[0].longitude] 
        : [40.4406, -79.9959];

    const polylinePositions = useMemo(() => 
        waypoints.map(wp => [wp.latitude, wp.longitude] as [number, number]), 
    [waypoints]);

    return (
        <div className="h-full w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 z-0">
            <MapContainer 
                center={center} 
                zoom={10} 
                scrollWheelZoom={false} 
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Draw Route Line */}
                {polylinePositions.length > 1 && (
                    <Polyline 
                        positions={polylinePositions} 
                        pathOptions={{ color: 'blue', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
                    />
                )}

                {/* Draw Markers */}
                {waypoints.map((wp, index) => (
                    <Marker 
                        key={index} 
                        position={[wp.latitude, wp.longitude]} 
                        icon={DefaultIcon}
                    >
                        <Popup>
                            <strong>{wp.name}</strong><br />
                            Type: {wp.type}<br />
                            Lat: {wp.latitude.toFixed(4)}, Lon: {wp.longitude.toFixed(4)}
                        </Popup>
                    </Marker>
                ))}

                <MapBoundsFitter waypoints={waypoints} />
            </MapContainer>
        </div>
    );
};

export default RouteMap;