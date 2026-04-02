import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, User, Linkedin, MessageCircle, Star, Clock, Zap } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculatePilotRank } from '@/utils/pilotRankUtils';
import { usePilotSummary, useActiveMissions } from '@/hooks/useMissions';
import { cn } from '@/lib/utils';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementBadge from './AchievementBadge';

interface PilotCardProps {
    profile: Profile;
}

const PilotCard: React.FC<PilotCardProps> = ({ profile }) => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'HEMS Crew Member';
    const initials = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '');

    const stats = usePilotSummary(profile.id);
    const { data: activeMissions } = useActiveMissions();
    const { achievements } = useAchievements(profile.id);
    
    const rank = calculatePilotRank(stats.count);
    const totalHours = (stats.totalMinutes / 60).toFixed(1);
    
    const activeMission = activeMissions?.find(m => m.user_id === profile.id);
    const isOnDuty = !!activeMission;

    return (
        <Card className={cn(
            "hover:shadow-2xl transition-all border-l-4 group bg-card/40 backdrop-blur-sm overflow-hidden relative",
            isOnDuty ? "border-green-600" : "border-primary"
        )}>
            <CardContent className="p-6 flex flex-col space-y-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-5">
                        <div className="relative">
                            <Avatar className="h-20 w-20 border-4 border-background shadow-lg transition-transform group-hover:rotate-3">
                                <AvatarImage src={profile.avatar_url || undefined} alt={fullName} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black italic">{initials || <User />}</AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-background shadow-sm flex items-center justify-center text-white",
                                rank.color
                            )}>
                                <Star className="w-2.5 h-2.5 fill-current" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black tracking-tighter uppercase italic leading-none">{fullName}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                                <Badge className={cn("text-[9px] uppercase font-black tracking-widest px-2 py-0 border-none", rank.color)}>
                                    {rank.title}
                                </Badge>
                                {isOnDuty && (
                                    <Badge className="bg-green-600 text-[9px] uppercase font-black tracking-widest px-2 py-0 animate-pulse border-none">
                                        ON DUTY
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievement Medal Strip on Card */}
                {achievements.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {achievements.slice(0, 5).map(a => (
                            <AchievementBadge key={a.id} type={a.type} size="sm" />
                        ))}
                        {achievements.length > 5 && <span className="text-[9px] font-black text-muted-foreground mt-1.5">+{achievements.length - 5}</span>}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1 flex items-center">
                            <Zap className="w-2 h-2 mr-1 text-primary" /> Service Record
                        </p>
                        <div className="flex items-center text-xs font-bold italic justify-between">
                            <span className="text-muted-foreground">Dispatches:</span>
                            <span className="font-mono text-primary">{stats.count}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1 flex items-center">
                            <Clock className="w-2 h-2 mr-1 text-primary" /> Air Time
                        </p>
                        <div className="flex items-center text-xs font-bold italic justify-between">
                            <span className="text-muted-foreground">Hours:</span>
                            <span className="font-mono text-primary">{totalHours}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                    <div className="flex items-center space-x-3">
                        {profile.social_links?.linkedin && (
                            <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        )}
                        {profile.social_links?.discord && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-muted-foreground hover:text-primary cursor-help transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="font-bold">Discord: {profile.social_links.discord}</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    
                    <div className="flex items-center text-[10px] font-black font-mono text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                        <Mail className="w-3 h-3 mr-2" />
                        {profile.email_public || 'SECURE'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PilotCard;