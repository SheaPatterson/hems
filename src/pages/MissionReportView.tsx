import React from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Clock, HeartPulse, Fuel, User, Scale, Loader2, ArrowLeft, Radio, Activity, MessageSquare, ClipboardCheck, Trophy, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MapDisplay from '@/components/MapDisplay';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import MapContainer from '@/components/MapContainer';
import { useMissionReport } from '@/hooks/useMissions';
import { useMissionLogs } from '@/hooks/useMissionLogs';
import { Separator } from '@/components/ui/separator';

const ReportSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-black italic uppercase tracking-tight border-b-2 border-primary/20 pb-2 text-primary">{title}</h3>
        {children}
    </div>
);

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number | null }> = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors shadow-inner">
        <span className="text-primary pt-0.5">{icon}</span>
        <div>
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">{label}</p>
            <p className="text-base font-mono font-bold leading-tight">{value === null || value === undefined ? 'N/A' : value}</p>
        </div>
    </div>
);

const MissionReportView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const { data: report, isLoading: isReportLoading, isError: isReportError } = useMissionReport(id);
    const { logs, isLoading: isLogsLoading } = useMissionLogs(id);

    const isLoading = isReportLoading || isLogsLoading;

    if (isLoading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (isReportError || !report) {
        toast.error("Mission report not found or access denied.");
        return <Navigate to="/dashboard" replace />;
    }

    const getOriginName = () => (report.origin as any).location || (report.origin as any).name || 'Unknown Base';
    const getDestinationName = () => report.destination.name;
    const status = report.status;

    return (
        <div className="space-y-6 container mx-auto max-w-6xl p-4 md:p-8">
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate('/mission-history')} className="font-bold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Archive
                </Button>
                <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Operational Status</span>
                    <Badge variant={status === 'completed' ? 'default' : 'destructive'} className="text-lg px-6 h-9 font-black italic uppercase shadow-lg">
                        {status}
                    </Badge>
                </div>
            </div>

            <Card className="border-t-8 border-t-primary shadow-2xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="p-8 bg-primary/5 border-b border-primary/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3 text-primary">
                                <Radio className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">{report.callsign}</span>
                            </div>
                            <CardTitle className="text-4xl font-black italic uppercase tracking-tighter leading-none">Mission Archive #{report.missionId}</CardTitle>
                            <CardDescription className="text-base font-medium">Logged: {new Date(report.dateTime).toLocaleString()}</CardDescription>
                        </div>
                        <div className="p-6 bg-background/50 border-2 border-primary/10 rounded-2xl text-center min-w-[200px] shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Mission Profile</p>
                            <p className="text-xl font-black italic uppercase text-primary leading-none">{report.type}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-12">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DetailItem icon={<MapPin className="w-5 h-5" />} label="Origin Terminal" value={getOriginName()} />
                        <DetailItem icon={<MapPin className="w-5 h-5" />} label="Primary Target" value={getDestinationName()} />
                        <DetailItem icon={<Clock className="w-5 h-5" />} label="Total Air Time" value={`${report.tracking.timeEnrouteMinutes} min`} />
                        <DetailItem icon={<Fuel className="w-5 h-5" />} label="Dispatch Fuel" value={`${report.helicopter.fuelCapacityLbs} Lbs`} />
                    </div>

                    <Separator className="opacity-50" />

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3">
                            <ReportSection title="Flight Path Verification">
                                <div className="h-[450px] border-2 rounded-2xl overflow-hidden shadow-inner">
                                    <MapContainer className="border-none rounded-none">
                                        <MapDisplay waypoints={report.waypoints} title="Operational Circuit Archive" />
                                    </MapContainer>
                                </div>
                            </ReportSection>
                        </div>
                        <div className="lg:col-span-2 space-y-8">
                            <ReportSection title="Radio Communication Log">
                                <Card className="bg-black/95 border-2 border-[#00ff41]/20 shadow-2xl h-[450px] flex flex-col overflow-hidden font-mono">
                                    <CardHeader className="p-4 border-b border-[#00ff41]/10 bg-zinc-900/50">
                                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-[#00ff41]">
                                            <Radio className="w-3 h-3 mr-2" /> Encrypted Tactical Link
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-grow relative overflow-hidden">
                                        <ScrollArea className="h-full w-full absolute inset-0">
                                            <div className="p-4 space-y-4">
                                                {logs.map((log) => (
                                                    <div key={log.id} className="space-y-1">
                                                        <div className="flex justify-between text-[7px] opacity-40 font-black">
                                                            <span className="uppercase">{log.sender === 'Crew' ? (report.callsign || 'UNIT') : log.sender}</span>
                                                            <span>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}Z</span>
                                                        </div>
                                                        <p className={cn(
                                                            "text-[10px] p-2 rounded border-l-2 leading-relaxed",
                                                            log.sender === 'Dispatcher' ? "bg-[#00ff41]/5 border-[#00ff41] text-[#00ff41]" : 
                                                            log.sender === 'System' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/20 text-white/80"
                                                        )}>
                                                            {log.message}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </ReportSection>
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <ReportSection title="Clinical Manifest">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <DetailItem icon={<User className="w-4 h-4" />} label="Pt Age" value={report.patientAge} />
                                <DetailItem icon={<User className="w-4 h-4" />} label="Pt Gender" value={report.patientGender} />
                                <DetailItem icon={<Scale className="w-4 h-4" />} label="Mass" value={report.patientWeightLbs ? `${report.patientWeightLbs} LB` : 'N/A'} />
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 bg-muted/20 border-2 rounded-2xl italic shadow-inner">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center"><HeartPulse className="w-3 h-3 mr-2" /> Medical Summary</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{report.patientDetails || "No patient data recorded."}</p>
                                </div>
                                <div className="p-6 bg-muted/20 border-2 rounded-2xl italic shadow-inner">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center"><Activity className="w-3 h-3 mr-2" /> Tactical Intervention Notes</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{report.medicalResponse || "Standard monitoring protocols applied."}</p>
                                </div>
                            </div>
                        </ReportSection>

                        <ReportSection title="Pilot After-Action Review">
                             <div className="h-full flex flex-col space-y-6">
                                <div className="p-8 bg-primary/5 border-2 border-primary/20 rounded-[2rem] shadow-xl relative flex-grow flex flex-col justify-between group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                        <ClipboardCheck className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center">
                                            <MessageSquare className="w-4 h-4 mr-2" /> Official Narrative
                                        </p>
                                        <p className="text-lg text-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                                            {report.pilot_notes ? `"${report.pilot_notes}"` : "Official pilot narrative pending final verification."}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem icon={<Trophy className="w-5 h-5" />} label="Performance Score" value={`${report.performance_score || '--'}%`} />
                                    <DetailItem icon={<TrendingUp className="w-5 h-5" />} label="Fuel Efficiency" value={report.flight_summary?.fuel_efficiency || 'N/A'} />
                                </div>
                             </div>
                        </ReportSection>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MissionReportView;