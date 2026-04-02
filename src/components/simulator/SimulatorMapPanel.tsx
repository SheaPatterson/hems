import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MissionReport as IMissionReport } from '@/data/hemsData';
import MapWrapper from '@/components/simulator/MapWrapper';
import { Fuel, Navigation, Zap, Clock, MapPin, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import MapContainer from '@/components/MapContainer'; // Added missing import

interface SimulatorMapPanelProps {
    mission: IMissionReport;
}

const TacticalHUDItem: React.FC<{ label: string; value: string | number; unit?: string; icon: React.ElementType, status?: 'normal' | 'warn' | 'alert' }> = ({ label, value, unit, icon: Icon, status = 'normal' }) => (
    <div className={cn(
        "p-2 flex items-center justify-between border-b border-white/10 last:border-b-0",
        status === 'alert' ? "text-red-500" : status === 'warn' ? "text-yellow-500" : "text-[#00ff41]"
    )}>
        <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{label}</span>
        </div>
        <p className="text-sm font-mono font-bold leading-none">
            {value}<span className="text-[8px] font-sans opacity-50 ml-1">{unit}</span>
        </p>
    </div>
);

const SimulatorMapPanel: React.FC<SimulatorMapPanelProps> = ({ mission }) => {
    const tracking = mission.tracking;
    const fuelStatus = (tracking?.fuelRemainingLbs || 0) < 200 ? 'alert' : (tracking?.fuelRemainingLbs || 0) < 400 ? 'warn' : 'normal';

    return (
        <Card className="h-full flex flex-col border-2 border-primary/20 rounded-2xl overflow-hidden shadow-2xl bg-black">
            <CardHeader className="p-3 border-b border-primary/20 bg-black/40 shrink-0">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
                        <Activity className="w-4 h-4 mr-2" /> LIVE TACTICAL FEED
                    </CardTitle>
                    <Badge className="bg-black text-[#00ff41] font-mono text-[9px] uppercase tracking-tighter border-[#00ff41]/30">
                        {mission.callsign}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="flex-grow p-0 relative flex flex-col min-h-0">
                <div className="flex-grow w-full min-h-0">
                    <MapContainer className="h-full border-none rounded-none">
                        <MapWrapper 
                            latitude={tracking.latitude} 
                            longitude={tracking.longitude} 
                            status={tracking.phase || 'Enroute'} 
                            waypoints={mission.waypoints}
                        />
                    </MapContainer>
                </div>

                {/* Overlay HUD */}
                <div className="shrink-0 bg-black/80 backdrop-blur-sm p-4 border-t border-primary/20 text-white space-y-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <TacticalHUDItem label="Phase" value={tracking.phase || 'ENROUTE'} icon={Activity} status={tracking.phase === 'Complete' ? 'normal' : 'warn'} />
                        <TacticalHUDItem label="Fuel" value={tracking.fuelRemainingLbs || 0} unit="LB" icon={Fuel} status={fuelStatus} />
                        <TacticalHUDItem label="Altitude" value={tracking.altitudeFt || '---'} unit="FT" icon={Navigation} />
                        <TacticalHUDItem label="Speed" value={tracking.groundSpeedKts || '---'} unit="KTS" icon={Zap} />
                        <TacticalHUDItem label="Time" value={tracking.timeEnrouteMinutes || 0} unit="MIN" icon={Clock} />
                        <TacticalHUDItem label="Heading" value={tracking.headingDeg || '---'} unit="°" icon={Navigation} />
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest pt-1">
                        <span className="flex items-center text-white/50"><MapPin className="w-3 h-3 mr-1" /> ORIGIN: {mission.origin.name}</span>
                        <span className="flex items-center text-white/50"><MapPin className="w-3 h-3 mr-1" /> DEST: {mission.destination.name}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SimulatorMapPanel;