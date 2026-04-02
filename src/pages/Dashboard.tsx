"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard as LayoutDashboardIcon, Loader2, Map as MapIcon, Activity, History, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TacticalMap from '@/components/maps/TacticalMap';
import { useActiveMissions, usePilotSummary, useMissions } from '@/hooks/useMissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlobalRadioFeed from '@/components/dashboard/GlobalRadioFeed';
import NotamBanner from '@/components/NotamBanner';
import PageHeader from '@/components/PageHeader';
import LiveTicker from '@/components/dashboard/LiveTicker';
import PilotProgress from '@/components/dashboard/PilotProgress';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import PilotLeaderboard from '@/components/dashboard/PilotLeaderboard';
import RegionalStatus from '@/components/dashboard/RegionalStatus';
import FlightHud from '@/components/dashboard/FlightHud';
import { useAuth } from '@/components/AuthGuard';
import { useHemsData } from '@/hooks/useHemsData';
import { Separator } from '@/components/ui/separator';
import ClientOnly from '@/components/ClientOnly';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const { data: activeMissions, isLoading: isLoadingMissions } = useActiveMissions();
    const { data: recentSorties } = useMissions(user?.id, 'completed');
    const { bases, isLoading: isLoadingHems } = useHemsData();
    const pilotStats = usePilotSummary(user?.id);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                const [basesRes, hospitalsRes, helicoptersRes, missionsRes] = await Promise.all([
                    supabase.from('hems_bases').select('*', { count: 'exact', head: true }),
                    supabase.from('hospitals').select('*', { count: 'exact', head: true }),
                    supabase.from('helicopters').select('*', { count: 'exact', head: true }),
                    supabase.from('missions').select('*', { count: 'exact', head: true })
                ]);

                setStats({
                    bases: basesRes.count || 0,
                    hospitals: hospitalsRes.count || 0,
                    helicopters: helicoptersRes.count || 0,
                    missions: missionsRes.count || 0,
                });

            } catch (error) {
                console.error("Dashboard Stats Error:", error);
                toast.error("Failed to sync regional statistics.");
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    const userActiveMission = activeMissions?.find(m => m.user_id === user?.id);
    const isLoading = isLoadingStats || isLoadingMissions || isLoadingHems;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
                <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <Activity className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Synchronizing Command Center</p>
                    <p className="text-xs text-muted-foreground animate-pulse font-mono uppercase italic">Establishing Secure Data Link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-7xl animate-in fade-in duration-700">
            <PageHeader 
                title="Operations Command"
                description="Integrated regional surveillance and flight coordination terminal."
                icon={LayoutDashboardIcon}
                actions={
                    <div className="flex items-center space-x-3">
                        <div className="bg-primary/5 border border-primary/20 px-5 py-2.5 rounded-2xl flex items-center space-x-3 shadow-inner">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Status: ACTIVE_DUTY</span>
                        </div>
                        {userActiveMission && (
                            <Badge className="bg-red-600 font-black italic shadow-lg h-10 px-4 flex items-center animate-pulse border-none">
                                <ShieldAlert className="w-4 h-4 mr-2" /> LIVE MISSION
                            </Badge>
                        )}
                    </div>
                }
            />

            <div className="-mx-4 md:-mx-8 mb-6">
                <ClientOnly>
                    <LiveTicker />
                </ClientOnly>
            </div>
            
            {userActiveMission && (
                <FlightHud mission={userActiveMission} />
            )}

            <NotamBanner />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PilotProgress 
                            missionCount={pilotStats.count} 
                            totalMinutes={pilotStats.totalMinutes} 
                        />
                        <WeatherWidget />
                    </div>

                    <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl bg-card/50 backdrop-blur-sm rounded-3xl">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl flex items-center font-bold italic uppercase">
                                        <MapIcon className="w-5 h-5 mr-2 text-primary" /> Joint Theater Command
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium">Real-time regional asset surveillance and mission tracking.</CardDescription>
                                </div>
                                <Badge className="bg-green-600 font-black italic px-3 py-1 text-[10px] border-none">
                                    {activeMissions?.length || 0} UNITS ENROUTE
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[550px] w-full relative bg-zinc-950">
                                <ClientOnly>
                                    <TacticalMap missions={activeMissions || []} bases={bases} />
                                </ClientOnly>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 flex flex-col space-y-6">
                    <RegionalStatus />
                    <GlobalRadioFeed />
                    
                    <Card className="border-2 border-primary/10 bg-card/40 backdrop-blur-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center text-primary">
                                <History className="w-3 h-3 mr-2" /> Recent Flight Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                            {recentSorties?.slice(0, 4).map(s => (
                                <div key={s.id} className="text-[10px] p-2 bg-muted/30 rounded-lg flex justify-between items-center border border-border/50 group hover:border-primary/30 transition-all">
                                    <span className="font-mono font-black text-primary italic">{s.missionId}</span>
                                    <span className="truncate max-w-[100px] font-bold opacity-60 uppercase">{s.destination.name}</span>
                                </div>
                            ))}
                            {!recentSorties?.length && <p className="text-[10px] text-muted-foreground italic text-center py-4">Awaiting first dispatch.</p>}
                            <Separator className="my-2 opacity-50" />
                            <Button asChild variant="link" className="w-full h-auto p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70">
                                <Link to="/mission-history">Regional Archives</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <PilotLeaderboard />
                </div>
            </div>

            <Separator className="opacity-50" />

            <div className="grid grid-cols-1 gap-6">
                <DashboardTabs stats={stats} />
            </div>
        </div>
    );
};

export default Dashboard;