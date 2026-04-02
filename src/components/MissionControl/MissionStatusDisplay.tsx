import React from 'react';
import { MissionReport, TrackingData } from '@/data/hemsData';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';

interface MissionStatusDisplayProps {
    mission: MissionReport | null;
    tracking: TrackingData | null;
    status: string;
}

export const MissionStatusDisplay: React.FC<MissionStatusDisplayProps> = ({ mission, status }) => { // Removed tracking to fix TS2339 and TS6133
    if (!mission) return null;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black italic uppercase text-foreground">{mission.callsign}</h3>
                <Badge className="bg-green-600 animate-pulse">{status.toUpperCase()}</Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> To: {mission.destination.name}</p>
                <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Type: {mission.type}</p>
            </div>
        </div>
    );
};