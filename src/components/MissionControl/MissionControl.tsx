import { useState } from 'react';
import { useMissionSimulator } from '@/hooks/useMissionSimulator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MissionForm } from './MissionForm';
import { MissionStatusDisplay } from './MissionStatusDisplay';
import { MissionTrackingDisplay } from './MissionTrackingDisplay';
import { TacticalOverridePanel } from './TacticalOverridePanel'; // NEW IMPORT
import { Zap, X, Check, Settings } from 'lucide-react';

export const MissionControl = () => {
    const { 
        mission, 
        tracking, 
        status, 
        isMissionActive, 
        startMission, 
        endMission, 
        cancelMission,
        isTacticalOverride, // NEW
        toggleTacticalOverride, // NEW
    } = useMissionSimulator();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleStartMission = (newMission: any) => {
        startMission(newMission);
        setIsFormOpen(false);
    };

    return (
        <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold text-primary">
                    {isMissionActive ? `Mission ${mission?.missionId}` : 'HEMS Dispatch'}
                </CardTitle>
                <div className="flex space-x-2">
                    {isMissionActive && (
                        <Button 
                            variant={isTacticalOverride ? "destructive" : "outline"} // Highlight when active
                            size="sm" 
                            onClick={toggleTacticalOverride}
                            title="Toggle Tactical Override (Manual Control)"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Override
                        </Button>
                    )}
                    {!isMissionActive && (
                        <Button 
                            size="sm" 
                            onClick={() => setIsFormOpen(true)}
                            disabled={isFormOpen}
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            New Mission
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isFormOpen && !isMissionActive && (
                    <MissionForm 
                        onStartMission={handleStartMission} 
                        onCancel={() => setIsFormOpen(false)}
                    />
                )}

                {isMissionActive && (
                    <>
                        <MissionStatusDisplay mission={mission} tracking={tracking} status={status} />
                        <Separator className="my-4" />
                        
                        {isTacticalOverride ? (
                            // NEW: Render Tactical Override Panel
                            <TacticalOverridePanel />
                        ) : (
                            // Existing Tracking Display
                            <MissionTrackingDisplay tracking={tracking} />
                        )}

                        <div className="flex justify-end space-x-2 mt-4">
                            <Button 
                                variant="outline" 
                                onClick={cancelMission}
                                className="text-red-500 hover:text-red-600"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel Mission
                            </Button>
                            <Button 
                                variant="default" 
                                onClick={endMission}
                                disabled={tracking?.phase !== 'landed'} // Only allow end if landed
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Log Mission
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};