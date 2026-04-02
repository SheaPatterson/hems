import React from 'react';
import { Waypoint } from '@/data/hemsData';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import RouteMap from '@/components/maps/RouteMap';

interface MapDisplayProps {
    waypoints: Waypoint[];
    title?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ waypoints, title = "Flight Path Visualization" }) => {
    if (waypoints.length === 0) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full p-6 text-muted-foreground">
                    No route defined.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20">
                <CardTitle className="text-lg flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-primary" /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow flex flex-col">
                <div className="relative h-64 sm:h-80 w-full">
                    <RouteMap waypoints={waypoints} />
                </div>
                
                <div className="p-4 bg-background border-t">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Route Summary</h4>
                    <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2">
                        {waypoints.map((wp, index) => (
                            <div key={index} className={cn("flex justify-between items-center p-2 rounded", index % 2 === 0 ? "bg-muted/50" : "")}>
                                <div className="flex items-center space-x-2">
                                    <span className="font-mono text-xs text-muted-foreground w-6">#{index + 1}</span>
                                    <span className={cn(
                                        index === 0 ? "font-bold text-green-600" : 
                                        index === waypoints.length - 1 ? "font-bold text-red-600" : ""
                                    )}>
                                        {wp.name}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-muted-foreground bg-background px-1 rounded border">
                                        {wp.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MapDisplay;