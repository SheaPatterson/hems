import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Medal, Loader2, Users, Zap } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculatePilotRank } from '@/utils/pilotRankUtils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const PilotLeaderboard = () => {
    const { data: profiles, isLoading: profilesLoading } = useProfiles();

    const { data: rankings, isLoading: rankingsLoading } = useQuery({
        queryKey: ['pilotRankings'],
        queryFn: async () => {
            const { data } = await supabase
                .from('missions')
                .select('user_id')
                .eq('status', 'completed');
            
            const counts = (data || []).reduce((acc: any, m) => {
                acc[m.user_id] = (acc[m.user_id] || 0) + 1;
                return acc;
            }, {});

            return Object.entries(counts)
                .map(([userId, count]) => ({ userId, count: count as number }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
        }
    });

    const isLoading = profilesLoading || rankingsLoading;

    return (
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur shadow-xl h-full flex flex-col flex-grow">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-primary" /> Regional Elite
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Active Duty Personnel</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                {isLoading ? (
                    <div className="p-12 flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary" /></div>
                ) : !rankings || rankings.length === 0 ? (
                    <div className="p-12 text-center opacity-30 italic text-sm flex items-center justify-center h-full">Awaiting operational records...</div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {rankings.map((rank, idx) => {
                            const profile = profiles?.find(p => p.id === rank.userId);
                            const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown Pilot';
                            const pilotRank = calculatePilotRank(rank.count);

                            return (
                                <div key={rank.userId} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                                            {idx === 0 ? <Medal className="w-8 h-8 text-yellow-500 fill-current" /> : 
                                             idx === 1 ? <Medal className="w-8 h-8 text-gray-400 fill-current" /> :
                                             idx === 2 ? <Medal className="w-8 h-8 text-amber-700 fill-current" /> :
                                             <span className="text-lg font-black text-muted-foreground italic">#{idx+1}</span>}
                                        </div>
                                        <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                                            <AvatarImage src={profile?.avatar_url || undefined} />
                                            <AvatarFallback className="bg-muted font-bold">{name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-black uppercase italic leading-none group-hover:text-primary transition-colors">{name}</p>
                                            <p className={cn("text-[9px] font-bold uppercase mt-1 px-1.5 rounded-full inline-block text-white", pilotRank.color)}>
                                                {pilotRank.title}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center text-primary font-mono font-black text-xl">
                                            {rank.count}
                                            <Zap className="w-3 h-3 ml-1 fill-current" />
                                        </div>
                                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Sorties</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
            <div className="p-4 bg-muted/20 border-t flex justify-center">
                <Button asChild variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest">
                    <a href="/pilot-directory">Full Personnel Manifest <Users className="w-3 h-3 ml-2" /></a>
                </Button>
            </div>
        </Card>
    );
};

export default PilotLeaderboard;