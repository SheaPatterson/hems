import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { Location } from '@/components/mission-planning/types';
// import LocateControl from 'react-leaflet-locate-control'; // Removed

// Fix for Leaflet default icon issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const SceneIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

interface SceneSelectorMapProps {
    currentLocation: Location;
    onLocationChange: (location: Location) => void;
}

const MapInitializer: React.FC<{ onLocationChange: (location: Location) => void }> = ({ onLocationChange }) => {
    const map = useMap();

    // 1. Invalidate size on mount (crucial for maps inside modals/sheets)
    useEffect(() => {
        // Use a slight delay to ensure the sheet animation is complete
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100); 
        return () => clearTimeout(timer);
    }, [map]);

    // 2. Handle map clicks
    useMapEvents({
        click(e) {
            const newLocation: Location = {
                name: `Scene (Lat: ${e.latlng.lat.toFixed(4)}, Lon: ${e.latlng.lng.toFixed(4)})`,
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
                faaIdentifier: 'SCENE',
            };
            onLocationChange(newLocation);
            // Pan to the new location
            map.panTo(e.latlng);
        },
    });
    return null;
};

const SceneSelectorMap: React.FC<SceneSelectorMapProps> = ({ currentLocation, onLocationChange }) => {
    const position: LatLngExpression = [currentLocation.latitude, currentLocation.longitude];
    const memoizedPosition = useMemo(() => position, [currentLocation.latitude, currentLocation.longitude]);

    return (
        <div className="h-full w-full rounded-lg overflow-hidden shadow-lg z-0">
            <MapContainer 
                center={memoizedPosition} 
                zoom={10} 
                scrollWheelZoom={true} 
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapInitializer onLocationChange={onLocationChange} />

                <Marker position={memoizedPosition} icon={SceneIcon}>
                    <Popup>
                        <strong>Selected Scene Location</strong>
                        <br />
                        {currentLocation.name}
                    </Popup>
                </Marker>
                
                {/* Removed LocateControl component */}
            </MapContainer>
        </div>
    );
};

export default SceneSelectorMap;