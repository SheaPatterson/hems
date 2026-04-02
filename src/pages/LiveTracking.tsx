import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaneTakeoff, MapPin, Zap, Loader2, Radio, Activity, Fuel, Clock, Navigation } from 'lucide-react';
import { useActiveMissions } from '@/hooks/useMissions';
import { Badge } from '@/components/ui/badge';
import FleetMap from '@/components/maps/FleetMap';
import MapContainer from '@/components/MapContainer';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LiveTracking: React.FC = () => {
    const { data: missions, isLoading, isError } = useActiveMissions();

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Synchronizing Tactical Data Link...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto p-8">
                <div className="p-12 border-2 border-destructive/20 bg-destructive/5 rounded-[2.5rem] text-center">
                    <Radio className="w-12 h-12 mx-auto text-destructive mb-4" />
                    <h2 className="text-2xl font-black italic uppercase text-destructive">Signal Lost</h2>
                    <p className="text-muted-foreground mt-2">The tracking gateway is currently unreachable. Check system status.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <div className="flex items-center space-x-2 text-primary mb-2">
                        <Activity className="w-5 h-5 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Live Theater Command</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic flex items-center">
                        <PlaneTakeoff className="w-10 h-10 mr-3 text-primary" /> Global Tracking
                    </h1>
                </div>
                <div className="flex items-center space-x-4 bg-muted/50 p-4 rounded-2xl border">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Units</p>
                        <p className="text-2xl font-mono font-black text-primary">{missions?.length || 0}</p>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <Badge className="bg-green-600 font-bold italic shadow-lg">ENCRYPTED FEED</Badge>
                </div>
            </header>

            {/* Main Tactical Map */}
            <Card className="overflow-hidden border-2 border-primary/20 rounded-[2.5rem] shadow-2xl bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0 h-[550px]">
                    <MapContainer className="h-full border-none rounded-none">
                        <FleetMap missions={missions || []} />
                    </MapContainer>
                </CardContent>
            </Card>

            <Separator className="opacity-50" />

            {/* Detailed Unit Roster */}
            <section className="space-y-6">
                <div className="flex items-center space-x-2 border-b-2 border-primary w-fit pb-1">
                    <Radio className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-black uppercase italic tracking-tight">Fleet Status Manifest</h2>
                </div>

                {!missions || missions.length === 0 ? (
                    <div className="p-20 text-center border-2 border-dashed rounded-[2rem] bg-muted/20">
                        <Navigation className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                        <p className="text-muted-foreground font-bold italic">No HEMS units are currently reporting telemetry.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {missions.map((m) => (
                            <Card key={m.missionId} className="hover:border-primary/50 transition-all border-l-4 border-primary group">
                                <CardHeader className="pb-3 bg-primary/5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-black italic uppercase text-primary group-hover:tracking-wider transition-all">
                                                {m.callsign}
                                            </CardTitle>
                                            <CardDescription className="font-mono text-[10px] font-bold">MISSION ID: {m.missionId}</CardDescription>
                                        </div>
                                        <Badge className="bg-black text-[#00ff41] font-mono text-[10px] uppercase">
                                            {m.tracking.phase || 'ENROUTE'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground flex items-center">
                                                <Fuel className="w-3 h-3 mr-1" /> Fuel Endurance
                                            </p>
                                            <p className="text-lg font-mono font-bold">{m.tracking.fuelRemainingLbs} <span className="text-[10px] opacity-50">LB</span></p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground flex items-center">
                                                <Clock className="w-3 h-3 mr-1" /> Time Enroute
                                            </p>
                                            <p className="text-lg font-mono font-bold">{m.tracking.timeEnrouteMinutes} <span className="text-[10px] opacity-50">MIN</span></p>
                                        </div>
                                    </div>
                                    
                                    <Separator className="opacity-30" />
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-muted-foreground uppercase flex items-center"><MapPin className="w-2 h-2 mr-1 text-green-500" /> Station</span>
                                            <span className="truncate max-w-[150px]">{m.hemsBase.name}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-muted-foreground uppercase flex items-center"><MapPin className="w-2 h-2 mr-1 text-red-500" /> Target</span>
                                            <span className="truncate max-w-[150px]">{m.destination.name}</span>
                                        </div>
                                    </div>

                                    <Button asChild className="w-full h-10 font-black italic uppercase shadow-md rounded-xl" variant="outline">
                                        <Link to={`/tracking/${m.missionId}`}>
                                            <Zap className="w-4 h-4 mr-2" /> Tactical Override
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default LiveTracking;