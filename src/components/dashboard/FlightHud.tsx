"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Navigation, Fuel, Clock, MapPin, Zap } from 'lucide-react';
import { HistoricalMission } from '@/hooks/useMissions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FlightHudProps {
    mission: HistoricalMission;
}

const HudMetric: React.FC<{ label: string, value: string | number, unit?: string, icon: React.ElementType, alert?: boolean }> = ({ label, value, unit, icon: Icon, alert }) => (
    <div className="flex flex-col items-center justify-center p-4 border-r border-white/10 last:border-none">
        <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 flex items-center">
            <Icon className="w-3 h-3 mr-1" /> {label}
        </p>
        <p className={cn(
            "text-xl font-mono font-black tracking-tighter leading-none",
            alert ? "text-red-500 animate-pulse" : "text-primary"
        )}>
            {value} <span className="text-[10px] font-sans opacity-40 ml-0.5">{unit}</span>
        </p>
    </div>
);

const FlightHud: React.FC<FlightHudProps> = ({ mission }) => {
    const t = mission.tracking;
    const isLowFuel = (t.fuelRemainingLbs || 0) < 300;

    return (
        <Card className="border-2 border-primary shadow-[0_0_40px_rgba(255,165,0,0.2)] bg-black/90 text-white rounded-[2rem] overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-700">
            <CardContent className="p-0 flex items-stretch">
                {/* Identity Block */}
                <div className="bg-primary text-black p-6 flex flex-col justify-center shrink-0 skew-x-[-10deg] -ml-4 pl-10">
                    <div className="skew-x-[10deg] space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Sortie</p>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{mission.callsign}</h2>
                        <Badge className="bg-black text-white text-[8px] font-black uppercase tracking-widest">{mission.missionId}</Badge>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="flex-grow grid grid-cols-4 items-center">
                    <HudMetric icon={Activity} label="Phase" value={t.phase || 'ENROUTE'} />
                    <HudMetric icon={Navigation} label="Altitude" value={t.altitudeFt || '---'} unit="FT" />
                    <HudMetric icon={Zap} label="GS Speed" value={t.groundSpeedKts || '---'} unit="KT" />
                    <HudMetric icon={Fuel} label="Fuel State" value={t.fuelRemainingLbs || '---'} unit="LB" alert={isLowFuel} />
                </div>

                {/* Target Block */}
                <div className="bg-zinc-900 p-6 flex flex-col justify-center shrink-0 border-l border-white/10 max-w-[200px]">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Target Node</p>
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-black uppercase italic truncate">{mission.destination.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-mono text-primary font-bold">ETA: {t.timeEnrouteMinutes}m</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FlightHud;