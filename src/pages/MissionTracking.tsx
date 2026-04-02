"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { MissionReport as IMissionReport } from '@/data/hemsData';
import { Fuel, Loader2, Wind, CheckCircle2, QrCode, TrendingUp, TrendingDown, ChevronDown, ArrowLeft, Clock } from 'lucide-react';
import DispatcherChat from '@/components/DispatcherChat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import MapWrapper from '@/components/simulator/MapWrapper';
import { cn } from '@/lib/utils';
import { useMissionManagement } from '@/hooks/useMissions';
import MapContainer from '@/components/MapContainer';
import { QRCodeSVG } from 'qrcode.react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import MissionDebriefModal from '@/components/mission-planning/MissionDebriefModal';
import WeatherRadarOverlay from '@/components/dashboard/WeatherRadar';
import MissionChecklistComponent from '@/components/mission-planning/MissionChecklist';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { calculateDistance } from '@/utils/flightCalculations';

const HudItem: React.FC<{ label: string; value: string | number; unit?: string; icon: React.ElementType, status?: 'normal' | 'warn' | 'alert', trend?: number }> = ({ label, value, unit, icon: Icon, status = 'normal', trend }) => (
    <div className={cn(
        "bg-black/50 backdrop-blur-sm border rounded-lg p-3 flex items-center space-x-3 shadow-inner",
        status === 'normal' ? "border-primary/20" : 
        status === 'warn' ? "border-orange-500/30" : 
        "border-red-600/30"
    )}>
        <div className={cn(
            "p-2 rounded-md",
            status === 'normal' ? "bg-primary/10 text-primary" : 
            status === 'warn' ? "bg-orange-500/20 text-orange-500" : 
            "bg-red-600/20 text-red-600"
        )}><Icon className="w-5 h-5" /></div>
        <div className="flex-grow">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
            <div className="flex items-baseline justify-between">
                <p className="text-xl font-mono font-black tracking-tighter leading-tight">
                    {value}<span className="text-xs font-bold opacity-40 ml-1 not-italic">{unit}</span>
                </p>
                {trend !== undefined && (
                    <span className="ml-2">
                        {trend > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : 
                         trend < 0 ? <TrendingDown className="w-4 h-4 text-red-500" /> : 
                         <div className="w-4 h-4" />}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const MissionTracking = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<IMissionReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDebriefOpen, setIsDebriefOpen] = useState(false);
    
    const { updateStatus, isUpdating } = useMissionManagement();
    const efbUrl = `${window.location.origin}/cockpit/${id}`;

    useEffect(() => {
        if (!id) return;
        const fetchMission = async () => {
            const { data, error } = await supabase.from('missions').select('*').eq('mission_id', id).single();
            if (error || !data) {
                toast.error("Failed to load mission tracking.");
                setReport(null);
            } else if (data.status !== 'active') {
                navigate(`/report/${id}`);
            } else {
                setReport({ 
                    ...data, 
                    missionId: data.mission_id, 
                    callsign: data.callsign || data.hems_base.name, 
                    type: data.mission_type, 
                    dateTime: data.created_at, 
                    hemsBase: data.hems_base, 
                    helicopter: data.helicopter, 
                    origin: data.origin,
                    destination: data.destination,
                    patientAge: data.patient_age,
                    patientGender: data.patient_gender,
                    patientWeightLbs: data.patient_weight_lbs,
                    patientDetails: data.patient_details,
                    medicalResponse: data.medical_response,
                    waypoints: data.waypoints || [],
                    tracking: data.tracking || { timeEnrouteMinutes: 0, fuelRemainingLbs: 0, latitude: 0, longitude: 0, phase: 'Dispatch' }
                } as any);
            }
            setIsLoading(false);
        };
        fetchMission();

        const channel = supabase.channel(`live_telemetry_${id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'missions', filter: `mission_id=eq.${id}` }, (payload) => {
            if (payload.new.status !== 'active') navigate(`/report/${id}`);
            setReport(prev => prev ? { ...prev, tracking: payload.new.tracking } : null);
        }).subscribe();
        
        return () => { supabase.removeChannel(channel); };
    }, [id, navigate]);

    const handleConfirmDebrief = async (notes: string, score: number, summary: any) => {
        await updateStatus({ 
            missionId: id!, 
            status: 'completed', 
            pilotNotes: notes,
            performanceScore: score,
            flightSummary: summary
        });
        navigate(`/report/${id}`);
    };

    // Calculate Dynamic ETA
    const liveEta = useMemo(() => {
        if (!report?.tracking || !report?.destination) return '---';
        const t = report.tracking;
        const d = report.destination;
        const distToDest = calculateDistance(t.latitude, t.longitude, d.latitude, d.longitude);
        const groundSpeed = t.groundSpeedKts || 120; // Fallback to 120 kts
        
        if (groundSpeed < 10) return 'STA'; // Standing at target
        
        const minutes = Math.round((distToDest / groundSpeed) * 60);
        return minutes;
    }, [report]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    if (!report) return <Navigate to="/dashboard" replace />;

    const fuelStatus = (report.tracking?.fuelRemainingLbs || 0) < 200 ? 'alert' : (report.tracking?.fuelRemainingLbs || 0) < 400 ? 'warn' : 'normal';

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-zinc-900 text-white font-sans overflow-hidden">
            <header className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/live-tracking')} className="text-white/50 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter text-primary">{report.callsign}</h1>
                        <p className="text-[10px] font-mono text-muted-foreground">ID: {report.missionId}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-9 px-3 text-xs font-bold bg-black/20 border-white/10 hover:bg-white/10">
                                <QrCode className="w-4 h-4 mr-2" /> EFB
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4 flex flex-col items-center space-y-2">
                            <div className="bg-white p-2 rounded-lg"><QRCodeSVG value={efbUrl} size={128} /></div>
                            <p className="text-xs font-bold">Scan for Cockpit View</p>
                        </PopoverContent>
                    </Popover>
                    <Button onClick={() => setIsDebriefOpen(true)} className="bg-green-600 hover:bg-green-700 h-9 px-4 font-bold italic uppercase text-xs" disabled={isUpdating}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mission Complete
                    </Button>
                </div>
            </header>

            <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
                <div className="lg:col-span-3 flex flex-col space-y-4 overflow-y-auto">
                    <Collapsible defaultOpen>
                        <CollapsibleTrigger className="w-full text-left">
                            <div className="p-3 bg-black/40 rounded-t-xl border border-b-0 border-white/10 flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Mission Briefing</h3>
                                <ChevronDown className="w-4 h-4 text-white/30" />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-black/20 rounded-b-xl border border-t-0 border-white/10 space-y-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Mission Profile</p>
                                <p className="font-bold italic">{report.type}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Origin Terminal</p>
                                <p className="font-bold italic">{report.origin.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Primary Target</p>
                                <p className="font-bold italic">{report.destination.name}</p>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                    <MissionChecklistComponent />
                </div>

                <div className="lg:col-span-6 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl relative">
                    <MapContainer className="h-full border-none rounded-none bg-black">
                        <WeatherRadarOverlay />
                        <MapWrapper 
                            latitude={report.tracking?.latitude || report.origin.latitude} 
                            longitude={report.tracking?.longitude || report.origin.longitude} 
                            status={report.tracking?.phase || 'Enroute'} 
                            waypoints={report.waypoints}
                        />
                    </MapContainer>
                </div>

                <div className="lg:col-span-3 flex flex-col space-y-4">
                    <div className="space-y-2">
                        <HudItem label="Automated ETA" value={liveEta} unit="MIN" icon={Clock} status={typeof liveEta === 'number' && liveEta < 2 ? 'alert' : 'normal'} />
                        <HudItem label="Altitude" value={report.tracking?.altitudeFt?.toLocaleString() || '---'} unit="FT" icon={Wind} />
                        <HudItem label="Fuel State" value={report.tracking?.fuelRemainingLbs?.toLocaleString() || '---'} unit="LB" icon={Fuel} status={fuelStatus} />
                    </div>
                    <div className="flex-grow min-h-[200px]">
                        <DispatcherChat missionReport={report} />
                    </div>
                </div>
            </div>
            {report && <MissionDebriefModal open={isDebriefOpen} onOpenChange={setIsDebriefOpen} report={report} onConfirm={handleConfirmDebrief} />}
        </div>
    );
};

export default MissionTracking;