import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock, Fuel, Send } from 'lucide-react';
import { MissionReport } from '@/data/hemsData';
import { toast } from 'sonner';
import { useTelemetrySimulator } from '@/hooks/useTelemetrySimulator';

interface TrackingPanelProps {
    report: MissionReport;
    onUpdate: (time: number, fuel: number) => void;
}

const TrackingPanel: React.FC<TrackingPanelProps> = ({ report, onUpdate }) => {
    const [timeInput, setTimeInput] = useState(report.tracking.timeEnrouteMinutes.toString());
    const [fuelInput, setFuelInput] = useState(report.tracking.fuelRemainingLbs.toString());
    
    // Use the simulator hook's update function for manual telemetry push
    const { sendManualTelemetry } = useTelemetrySimulator({
        missionId: report.missionId,
        initialTracking: report.tracking as any,
        helicopterId: report.helicopter.id,
        waypoints: report.waypoints,
        onUpdateSuccess: (newTracking) => {
            // Update parent state only after successful API call
            onUpdate(newTracking.timeEnrouteMinutes, newTracking.fuelRemainingLbs);
            toast.success("Manual telemetry uplink successful.");
        }
    });

    const handleUpdate = async () => {
        const newTime = parseInt(timeInput);
        const newFuel = parseInt(fuelInput);

        if (isNaN(newTime) || isNaN(newFuel) || newTime < 0 || newFuel < 0) {
            toast.error("Please enter valid positive numbers for time and fuel.");
            return;
        }

        // Send manual update via the Edge Function
        await sendManualTelemetry({
            timeEnrouteMinutes: newTime,
            fuelRemainingLbs: newFuel,
            // Keep current lat/lon for manual updates if not provided
            latitude: report.tracking.latitude,
            longitude: report.tracking.longitude,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Manual Tracking Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="time">
                            <Clock className="w-4 h-4 inline mr-1" /> Time Enroute (Minutes)
                        </Label>
                        <Input
                            id="time"
                            type="number"
                            value={timeInput}
                            onChange={(e) => setTimeInput(e.target.value)}
                            placeholder={report.tracking.timeEnrouteMinutes.toString()}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fuel">
                            <Fuel className="w-4 h-4 inline mr-1" /> Fuel Remaining (Lbs)
                        </Label>
                        <Input
                            id="fuel"
                            type="number"
                            value={fuelInput}
                            onChange={(e) => setFuelInput(e.target.value)}
                            placeholder={report.tracking.fuelRemainingLbs.toString()}
                        />
                    </div>
                </div>
                <Button onClick={handleUpdate} className="w-full">
                    <Send className="w-4 h-4 mr-2" /> Update Tracking Data
                </Button>
                <p className="text-sm text-muted-foreground">
                    Initial Estimated Flight Time: {report.tracking.timeEnrouteMinutes} minutes. Max Fuel: {report.helicopter.fuelCapacityLbs} Lbs.
                </p>
            </CardContent>
        </Card>
    );
};

export default TrackingPanel;