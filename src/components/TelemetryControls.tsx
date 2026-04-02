import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, StopCircle, Satellite } from 'lucide-react';
import { useTelemetrySimulator } from '@/hooks/useTelemetrySimulator';
import { MissionReport as IMissionReport, TrackingData } from '@/data/hemsData'; // Import TrackingData
import { TelemetryData } from '@/hooks/useTelemetrySimulator';

interface TelemetryControlsProps {
    missionId: string;
    tracking: IMissionReport['tracking'];
    helicopterId: string;
    waypoints: IMissionReport['waypoints'];
    onTrackingUpdate: (newTracking: TrackingData) => void; // Use full TrackingData
}

const TelemetryControls: React.FC<TelemetryControlsProps> = ({ missionId, tracking, helicopterId, waypoints, onTrackingUpdate }) => {
    
    const { isRunning, startSimulation, stopSimulation } = useTelemetrySimulator({
        missionId,
        initialTracking: tracking as TrackingData, // Ensure initial tracking is cast to full type
        helicopterId,
        waypoints,
        onUpdateSuccess: (newTracking: TelemetryData) => { // Fix TS2322 by matching the expected type
            onTrackingUpdate(newTracking as TrackingData);
        }
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <Satellite className="w-4 h-4 mr-2" /> Simulator Telemetry
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Auto-simulate flight progress along planned waypoints based on airframe cruise performance.
                </p>
                {isRunning ? (
                    <Button onClick={stopSimulation} variant="destructive" className="w-full">
                        <StopCircle className="w-4 h-4 mr-2" /> Stop Simulation
                    </Button>
                ) : (
                    <Button onClick={startSimulation} className="w-full">
                        <Play className="w-4 h-4 mr-2" /> Start Telemetry Simulation
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default TelemetryControls;