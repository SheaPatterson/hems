import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { StepProps } from './types.ts';
import { ArrowLeft, Gauge, XCircle, ListTree, ShieldCheck, Info, Zap, Fuel, Clock, AlertTriangle, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import MapDisplay from '@/components/MapDisplay';
import { useConfig } from '@/hooks/useConfig';
import { calculateFlightMetrics as runFlightCalculation } from '@/utils/flightCalculations';
import { Separator } from '@/components/ui/separator';
import { Waypoint } from '@/data/hemsData';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MetricDisplay: React.FC<{ icon: React.ElementType, label: string, value: string | number, unit: string, status?: 'normal' | 'warn' | 'alert' }> = ({ icon: Icon, label, value, unit, status = 'normal' }) => (
    <div className={cn(
        "p-4 rounded-xl border-2",
        status === 'alert' ? "bg-red-600/10 border-red-600/30" : "bg-muted/50 border-border/50"
    )}>
        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{label}</p>
        <div className="flex items-center space-x-2">
            <Icon className={cn("w-5 h-5", status === 'alert' ? "text-red-600" : "text-primary")} />
            <p className="text-2xl font-mono font-bold leading-none">{value} <span className="text-sm font-bold opacity-40 ml-1 not-italic">{unit}</span></p>
        </div>
    </div>
);

const Step4FlightCalculation: React.FC<StepProps> = ({ formState, updateFormState, onNext, onBack, hospitals, bases }) => {
    const { flightMetrics, missionType, selectedHelicopter, selectedDestinationId, selectedSceneLocation, selectedFinalHospitalId, selectedOriginId, selectedBaseId } = formState;
    const { config } = useConfig();
    const [acknowledged, setAcknowledged] = useState(false);

    const getConfigValue = (key: string, defaultValue: number): number => {
        const item = config.find(c => c.key === key);
        return item ? Number(item.value) : defaultValue;
    };

    const calculateFlightMetrics = () => {
        if (!selectedHelicopter || !selectedBaseId) {
            toast.error("Missing base or aircraft.");
            return;
        }

        const base = bases.find(b => b.id === selectedBaseId)!;
        const fuelReserveMinutes = getConfigValue('fuelReserveMinutes', 20);
        
        let pickupPoint: Waypoint;
        let dropoffPoint: Waypoint;

        if (missionType === 'Hospital Transfer') {
            const originHospital = hospitals.find(h => h.id === selectedOriginId);
            const destHospital = hospitals.find(h => h.id === selectedDestinationId);
            if (!originHospital || !destHospital) return;
            pickupPoint = { name: originHospital.name, latitude: originHospital.latitude, longitude: originHospital.longitude, type: 'hospital' };
            dropoffPoint = { name: destHospital.name, latitude: destHospital.latitude, longitude: destHospital.longitude, type: 'hospital' };
        } else {
            const finalHospital = hospitals.find(h => h.id === selectedFinalHospitalId);
            if (!selectedSceneLocation || !finalHospital) return;
            pickupPoint = { name: selectedSceneLocation.name, latitude: selectedSceneLocation.latitude, longitude: selectedSceneLocation.longitude, type: 'scene' };
            dropoffPoint = { name: finalHospital.name, latitude: finalHospital.latitude, longitude: finalHospital.longitude, type: 'hospital' };
        }

        const basePoint: Waypoint = { name: base.name, latitude: base.latitude, longitude: base.longitude, type: 'base' };
        const circuitWaypoints: Waypoint[] = [basePoint, pickupPoint, dropoffPoint, basePoint];

        const metricsResult = runFlightCalculation(circuitWaypoints, selectedHelicopter, { fuelReserveMinutes });
        updateFormState({ flightMetrics: metricsResult, waypoints: circuitWaypoints });
        toast.success(`Specs calculated with ${fuelReserveMinutes}m reserve margin.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-black uppercase italic text-primary">
                    <Gauge className="w-6 h-6" />
                    <span>Operational Performance Briefing</span>
                </div>
                {!flightMetrics && (
                    <Button onClick={calculateFlightMetrics} variant="default" className="bg-primary hover:bg-primary/90 font-black italic shadow-lg">
                        <Gauge className="w-4 h-4 mr-2" /> GENERATE FLIGHT SPECS
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {flightMetrics ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-500">
                            <Card className={cn(
                                "border-2 shadow-xl",
                                flightMetrics.goNoGo ? "border-green-600/30 bg-green-600/5" : "border-red-600/30 bg-red-600/5"
                            )}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center">
                                        {flightMetrics.goNoGo ? (
                                            <ShieldCheck className="w-5 h-5 mr-2 text-green-600" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                                        )}
                                        {flightMetrics.goNoGo ? 'GO / MISSION CLEAR' : 'NO-GO / GROUND STOP'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <MetricDisplay 
                                            icon={Navigation} 
                                            label="Total Distance" 
                                            value={flightMetrics.distanceNM} 
                                            unit="NM" 
                                        />
                                        <MetricDisplay 
                                            icon={Clock} 
                                            label="Est. Flight Time" 
                                            value={flightMetrics.estimatedFlightTimeMinutes} 
                                            unit="MIN" 
                                        />
                                        <MetricDisplay 
                                            icon={Fuel} 
                                            label="Est. Fuel Burn" 
                                            value={flightMetrics.estimatedFuelBurnLbs} 
                                            unit="LBS" 
                                            status={flightMetrics.fuelReserveLbs < 50 ? 'alert' : 'normal'}
                                        />
                                        <MetricDisplay 
                                            icon={Fuel} 
                                            label="Reserve Margin" 
                                            value={flightMetrics.fuelReserveLbs} 
                                            unit="LBS" 
                                            status={flightMetrics.fuelReserveLbs < 50 ? 'alert' : 'normal'}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground px-1">Circuit Legs</p>
                                        {flightMetrics.legs?.map((leg: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-xs p-2 bg-muted/50 rounded-lg border border-border/50">
                                                <span className="font-bold text-primary italic">#{idx+1}</span>
                                                <span className="truncate max-w-[140px] font-medium">{leg.name}</span>
                                                <span className="font-mono font-bold">{leg.time}m</span>
                                            </div>
                                        ))}
                                    </div>

                                    {!flightMetrics.goNoGo && (
                                        <Alert className="bg-red-600/10 border-red-600/30 text-red-600">
                                            <XCircle className="w-4 h-4" />
                                            <AlertTitle className="font-bold uppercase tracking-widest text-xs">Ground Stop Reason</AlertTitle>
                                            <AlertDescription className="text-sm font-bold">{flightMetrics.reason}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                            
                            <Card className="p-5 border-2 border-primary/20 rounded-2xl bg-card shadow-inner space-y-3">
                                <div className="flex items-center space-x-2 text-primary">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Pilot Pre-Flight Confirmation</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Checkbox id="ack" checked={acknowledged} onCheckedChange={(v) => setAcknowledged(v === true)} className="mt-1" />
                                    <Label htmlFor="ack" className="text-xs font-medium leading-relaxed cursor-pointer select-none">
                                        I have reviewed the flight metrics and verify the mission meets operational safety thresholds.
                                    </Label>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-muted/20 p-10 text-center space-y-4">
                            <Info className="w-12 h-12 text-muted-foreground opacity-30" />
                            <p className="text-sm text-muted-foreground font-medium italic">Performance calculations required before briefing.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="h-[400px] border-2 border-muted-foreground/10 rounded-2xl overflow-hidden shadow-inner relative group">
                        {formState.waypoints.length > 0 ? (
                            <MapDisplay waypoints={formState.waypoints} title="Operational Circuit Visualization" />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-black/5">
                                <ListTree className="w-16 h-16 mb-4 opacity-10" />
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Waypoints Pending</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Separator className="opacity-50" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button onClick={onBack} variant="ghost" className="font-bold text-muted-foreground w-full sm:w-auto"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Patient</Button>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    {!acknowledged && flightMetrics?.goNoGo && (
                        <span className="text-[10px] font-black uppercase text-orange-600 animate-pulse italic">Acknowledgment Required</span>
                    )}
                    <Button 
                        onClick={onNext} 
                        disabled={!flightMetrics || !flightMetrics.goNoGo || !acknowledged} 
                        size="lg" 
                        className="h-16 px-12 font-black italic uppercase text-xl shadow-[0_20px_50px_rgba(255,165,0,0.3)] rounded-2xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        INITIALIZE DISPATCH <Zap className="w-6 h-6 ml-2 fill-current" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Step4FlightCalculation;