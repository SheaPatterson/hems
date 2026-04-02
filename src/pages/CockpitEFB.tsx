"use client";

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMissionReport } from '@/hooks/useMissions';
import { useHospitalScenery } from '@/hooks/useHospitalScenery';
import { useAuth } from '@/components/AuthGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Navigation, 
    MessageSquare, 
    HeartPulse, 
    ImageIcon, 
    Loader2,
    ListChecks,
    Edit3,
    Lock,
    RefreshCw
} from 'lucide-react';
import MapWrapper from '@/components/simulator/MapWrapper';
import MapContainer from '@/components/MapContainer';
import DispatcherChat from '@/components/DispatcherChat';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MissionChecklistComponent from '@/components/mission-planning/MissionChecklist';

const CockpitEFB = () => {
    const { id } = useParams<{ id: string }>();
    const { user, isLoading: isAuthLoading } = useAuth();
    const { data: report, isLoading: isReportLoading, error: reportError, refetch } = useMissionReport(id);
    const { sceneryQuery } = useHospitalScenery();
    
    const [activeTab, setActiveTab] = useState('tactical');
    const [scratchpad, setScratchpad] = useState('');

    // Handle session check specific to EFB browsers
    if (isAuthLoading) {
        return (
            <div className="h-screen w-screen bg-black flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-primary font-mono text-[10px] uppercase tracking-widest">Validating Credentials...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center p-8 space-y-6 text-center">
                <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                    <Lock className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black italic uppercase text-white">Authentication Required</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                        The EFB terminal is locked. Log in on your primary device to synchronize this cockpit link.
                    </p>
                </div>
                <Button asChild className="bg-primary text-black font-black uppercase italic h-12 px-8">
                    <Link to="/login">Unlock Terminal</Link>
                </Button>
            </div>
        );
    }

    if (isReportLoading) {
        return (
            <div className="h-screen w-screen bg-black flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-[#00ff41] font-mono text-[10px] uppercase tracking-widest">Syncing Tactical Link...</p>
            </div>
        );
    }

    if (reportError || !report) {
        return (
            <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <p className="text-red-500 font-mono text-sm uppercase">ERR: MISSION_NOT_FOUND</p>
                <p className="text-xs text-muted-foreground italic">Verify Mission ID: {id}</p>
                <Button onClick={() => refetch()} variant="outline" className="h-10 border-white/20 text-white">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Link
                </Button>
            </div>
        );
    }

    const destinationScenery = report.destination && 'id' in report.destination 
        ? sceneryQuery.data?.find(s => s.hospital_id === (report.destination as any).id)
        : null;

    const fuelStatus = (report.tracking?.fuelRemainingLbs || 0) < 200 ? 'alert' : 'normal';

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col font-sans select-none">
            {/* Minimal Tactical Header */}
            <header className="h-12 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center space-x-3">
                    <HeartPulse className="w-5 h-5 text-primary animate-pulse" />
                    <span className="font-black italic uppercase tracking-tighter text-primary">HEMS OPS-CENTER</span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none">Mission ID</span>
                        <span className="text-xs font-mono font-bold text-[#00ff41]">{report.missionId}</span>
                    </div>
                    <Badge className="bg-black border-[#00ff41]/40 text-[#00ff41] text-[9px] h-6 px-2 uppercase font-mono">
                        {report.tracking.phase || 'ENROUTE'}
                    </Badge>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow min-h-0 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
                    <div className="flex-grow min-h-0 relative">
                        {/* Tactical Map View */}
                        <TabsContent value="tactical" className="absolute inset-0 m-0 p-0 border-none outline-none">
                            <MapContainer className="h-full w-full border-none rounded-none">
                                <MapWrapper 
                                    latitude={report.tracking.latitude} 
                                    longitude={report.tracking.longitude} 
                                    status={report.tracking.phase || 'Active'} 
                                    waypoints={report.waypoints}
                                />
                            </MapContainer>
                            
                            {/* HUD Overlay */}
                            <div className="absolute top-4 left-4 z-[1000] space-y-2 pointer-events-none">
                                <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 space-y-1 shadow-2xl">
                                    <div className="flex items-center justify-between min-w-[120px]">
                                        <span className="text-[8px] font-black text-white/50 uppercase">Altitude</span>
                                        <span className="font-mono text-sm font-bold">{report.tracking.altitudeFt || '---'} <span className="text-[10px] opacity-40">FT</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black text-white/50 uppercase">Ground Speed</span>
                                        <span className="font-mono text-sm font-bold text-[#00ff41]">{report.tracking.groundSpeedKts || '---'} <span className="text-[10px] opacity-40">KT</span></span>
                                    </div>
                                    <div className={cn(
                                        "flex items-center justify-between",
                                        fuelStatus === 'alert' ? "text-red-500" : ""
                                    )}>
                                        <span className="text-[8px] font-black uppercase opacity-60">Fuel State</span>
                                        <span className="font-mono text-sm font-bold">{report.tracking.fuelRemainingLbs} <span className="text-[10px] opacity-40">LB</span></span>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Comms View */}
                        <TabsContent value="comms" className="absolute inset-0 m-0 p-0">
                            <div className="h-full bg-black">
                                <DispatcherChat missionReport={report} />
                            </div>
                        </TabsContent>

                        {/* Checklist View */}
                        <TabsContent value="checklists" className="absolute inset-0 m-0 p-0 bg-black">
                            <MissionChecklistComponent />
                        </TabsContent>

                        {/* Briefing View */}
                        <TabsContent value="briefing" className="absolute inset-0 m-0 p-0 bg-[#0a0a0a]">
                            <ScrollArea className="h-full w-full">
                                <div className="p-6 space-y-8 pb-20">
                                    <section className="space-y-4">
                                        <h3 className="text-primary font-black uppercase italic tracking-widest text-sm flex items-center border-b border-primary/20 pb-2">
                                            <HeartPulse className="w-4 h-4 mr-2" /> Clinical Data Link
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[8px] font-bold text-white/40 uppercase mb-1">Pt Profile</p>
                                                <p className="text-lg font-black italic">{report.patientAge}Y / {report.patientGender}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[8px] font-bold text-white/40 uppercase mb-1">Mass</p>
                                                <p className="text-lg font-black italic">{report.patientWeightLbs} LB</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase text-primary/60">Condition Summary</p>
                                            <div className="p-4 bg-black border border-white/10 rounded-xl italic text-sm text-white/80 leading-relaxed">
                                                {report.patientDetails || "Awaiting bedside assessment..."}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Scratchpad Section */}
                                    <section className="space-y-4">
                                        <h3 className="text-primary font-black uppercase italic tracking-widest text-sm flex items-center border-b border-primary/20 pb-2">
                                            <Edit3 className="w-4 h-4 mr-2" /> Pilot Scratchpad
                                        </h3>
                                        <Textarea 
                                            value={scratchpad}
                                            onChange={(e) => setScratchpad(e.target.value)}
                                            placeholder="Jot down METARs, clearance, or vitals..."
                                            className="bg-black border-white/10 h-40 text-[#00ff41] font-mono text-sm focus-visible:ring-primary"
                                        />
                                    </section>

                                    <section className="space-y-4">
                                        <h3 className="text-primary font-black uppercase italic tracking-widest text-sm flex items-center border-b border-primary/20 pb-2">
                                            <ImageIcon className="w-4 h-4 mr-2" /> Destination Recon
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold">{report.destination.name}</span>
                                                <Badge variant="outline" className="text-[8px] uppercase">LZ RECON</Badge>
                                            </div>
                                            
                                            {destinationScenery ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {destinationScenery.image_urls.slice(0, 2).map((url, idx) => (
                                                            <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-white/10">
                                                                <img src={url} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs italic text-white/60 bg-white/5 p-3 rounded-lg border border-dashed border-white/10">
                                                        {destinationScenery.description}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="p-10 border-2 border-dashed border-white/5 rounded-2xl text-center">
                                                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-10" />
                                                    <p className="text-[10px] font-bold text-white/20 uppercase">No Visual Assets on File</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </div>

                    {/* Bottom Persistent Navigation */}
                    <TabsList className="h-16 bg-[#050505] border-t border-white/10 rounded-none w-full p-0 grid grid-cols-4 shrink-0">
                        <TabsTrigger 
                            value="tactical" 
                            className="h-full rounded-none flex flex-col space-y-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-r border-white/5"
                        >
                            <Navigation className="w-5 h-5" />
                            <span className="text-[8px] font-black uppercase">Tactical</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="comms" 
                            className="h-full rounded-none flex flex-col space-y-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-r border-white/5"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-[8px] font-black uppercase">Radio</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="checklists" 
                            className="h-full rounded-none flex flex-col space-y-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-r border-white/5"
                        >
                            <ListChecks className="w-5 h-5" />
                            <span className="text-[8px] font-black uppercase">SOPs</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="briefing" 
                            className="h-full rounded-none flex flex-col space-y-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                        >
                            <HeartPulse className="w-5 h-5" />
                            <span className="text-[8px] font-black uppercase">Briefing</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </main>
        </div>
    );
};

export default CockpitEFB;