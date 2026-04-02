import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Clock, Target, Star } from 'lucide-react';
import { calculatePilotRank, getNextRankProgress } from '@/utils/pilotRankUtils';
import { cn } from '@/lib/utils';

interface PilotProgressProps {
    missionCount: number;
    totalMinutes: number;
}

const PilotProgress: React.FC<PilotProgressProps> = ({ missionCount, totalMinutes }) => {
    const rank = calculatePilotRank(missionCount);
    const progress = getNextRankProgress(missionCount);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return (
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur shadow-xl overflow-hidden h-full">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary" /> Service Record
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Personnel Operational Tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Current Rank Display */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Active Designation</p>
                        <h3 className="text-2xl font-black italic uppercase text-primary tracking-tighter">{rank.title}</h3>
                    </div>
                    <div className={cn("p-4 rounded-2xl shadow-lg border-2 border-white/10", rank.color)}>
                        <Star className="w-8 h-8 text-white fill-current" />
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-xl border border-border/50 shadow-inner">
                        <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                            <Target className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Total Dispatches</span>
                        </div>
                        <p className="text-2xl font-mono font-bold">{missionCount}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl border border-border/50 shadow-inner">
                        <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Flight Hours</span>
                        </div>
                        <p className="text-2xl font-mono font-bold">{totalHours}</p>
                    </div>
                </div>

                {/* Rank Progression */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Next Milestone</p>
                            <p className="text-xs font-bold italic">{progress.nextTitle}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-primary">{progress.remaining} missions to go</span>
                    </div>
                    <Progress value={progress.percent} className="h-2 bg-muted-foreground/10" />
                    <p className="text-[8px] text-center text-muted-foreground uppercase font-black tracking-[0.2em] pt-1">
                        Deployment Progress: {progress.percent}%
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default PilotProgress;