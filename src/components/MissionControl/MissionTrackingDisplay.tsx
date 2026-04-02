import React from 'react';
import { TrackingData } from '@/data/hemsData';
import { Fuel, MapPin, Zap } from 'lucide-react';

interface MissionTrackingDisplayProps {
    tracking: TrackingData | null;
}

export const MissionTrackingDisplay: React.FC<MissionTrackingDisplayProps> = ({ tracking }) => {
    if (!tracking) return null;

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center"><MapPin className="w-3 h-3 mr-1" /> Phase</p>
                <p className="text-lg font-bold italic">{tracking.phase || 'N/A'}</p>
            </div>
            <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center"><Fuel className="w-3 h-3 mr-1" /> Fuel</p>
                <p className="text-lg font-bold italic">{tracking.fuelRemainingLbs} LBS</p>
            </div>
            <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center"><Zap className="w-3 h-3 mr-1" /> Time</p>
                <p className="text-lg font-bold italic">{tracking.timeEnrouteMinutes.toFixed(1)} MIN</p>
            </div>
        </div>
    );
};