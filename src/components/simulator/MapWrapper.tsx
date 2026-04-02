import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import LiveMap from './LiveMap';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Waypoint } from '@/data/hemsData';

interface MapWrapperProps {
    latitude: number;
    longitude: number;
    status: string;
    waypoints?: Waypoint[];
}

const MapWrapper: React.FC<MapWrapperProps> = (props) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsClient(true);
        }
    }, []);

    const isValidCoords = !isNaN(props.latitude) && !isNaN(props.longitude);

    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isValidCoords) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Mapping Error</AlertTitle>
                <AlertDescription>
                    Invalid GPS coordinates received. Unable to render live tracking data.
                </AlertDescription>
            </Alert>
        );
    }

    return <LiveMap {...props} />;
};

export default MapWrapper;