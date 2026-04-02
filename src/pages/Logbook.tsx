import { useMissions } from '@/hooks/useMissions';
import { useAuth } from '@/components/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plane, Clock, History, Award, Zap, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { calculatePilotRank } from '@/utils/pilotRankUtils';

const Logbook = () => {
    const { user } = useAuth();
    const { data: missions, isLoading } = useMissions(user?.id, 'completed');

    const totalMinutes = (missions || []).reduce((acc, m) => acc + (m.tracking?.timeEnrouteMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const rank = calculatePilotRank(missions?.length || 0);

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center">Loading Logbook...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
            <PageHeader 
                title="Pilot Flight Logbook"
                description="Official record of sorties, operational flight hours, and technical narratives."
                icon={BookOpen}
                actions={
                    <div className="flex items-center space-x-4 bg-muted/50 p-4 rounded-2xl border border-border/50 shadow-inner">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Total Flight Time</p>
                            <p className="text-2xl font-mono font-black text-primary leading-none">{totalHours} <span className="text-xs">HRS</span></p>
                        </div>
                        <div className="w-px h-10 bg-border" />
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Rank Status</p>
                            <p className="text-lg font-black italic uppercase text-foreground leading-none">{rank.title}</p>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-primary/5 border-2 border-primary/20 rounded-2xl overflow-hidden shadow-lg">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center">
                                <Award className="w-4 h-4 mr-2" /> Career Totals
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Successful Dispatches</p>
                                <p className="text-3xl font-mono font-black italic">{missions?.length || 0}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Regional Nodes Visited</p>
                                <p className="text-3xl font-mono font-black italic">
                                    {new Set(missions?.map(m => m.destination.name)).size}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-primary/10">
                                <Button asChild className="w-full h-12 font-black italic uppercase shadow-xl">
                                    <Link to="/generate"><Zap className="w-4 h-4 mr-2" /> Request Dispatch</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-border/50 bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center">
                                <History className="w-4 h-4 mr-2 text-muted-foreground" /> Logbook Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                            <p>• Only 'Completed' missions are verified for flight hours.</p>
                            <p>• Telemetry must be active for at least 60% of the route to be valid.</p>
                            <p>• Pilot narratives are required for ISO-9001 simulation compliance.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Log Table */}
                <Card className="lg:col-span-3 border-t-4 border-primary">
                    <CardHeader className="bg-muted/30 border-b">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="relative flex-grow max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Filter by airframe, mission ID, or hospital..." className="pl-10 h-10 text-xs font-medium" />
                            </div>
                            <Button variant="outline" size="sm" className="h-10 px-4 font-bold uppercase text-[10px] tracking-widest">
                                Advanced Filter
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[120px]">Date / Time</TableHead>
                                        <TableHead>Mission ID</TableHead>
                                        <TableHead>Airframe</TableHead>
                                        <TableHead>Terminal Path</TableHead>
                                        <TableHead className="text-right">Duration</TableHead>
                                        <TableHead className="text-right pr-6">Archive</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {missions?.map((m) => (
                                        <TableRow key={m.id} className="hover:bg-primary/[0.02] group transition-colors">
                                            <TableCell className="py-4">
                                                <div className="flex flex-col space-y-0.5">
                                                    <span className="font-bold text-xs">{new Date(m.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{new Date(m.created_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}Z</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-black text-primary text-sm italic">{m.missionId}</span>
                                                    <Badge variant="outline" className="text-[8px] px-1.5 h-4 w-fit uppercase font-bold tracking-tighter">{m.type}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-1.5 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                                        <Plane className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold leading-tight">{m.helicopter.registration}</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{m.helicopter.model}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-xs space-x-2">
                                                    <span className="font-medium truncate max-w-[80px]">{m.hemsBase.name}</span>
                                                    <MoveRight className="w-3 h-3 text-muted-foreground" />
                                                    <span className="font-bold text-primary truncate max-w-[100px]">{m.destination.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                                    <span className="font-mono font-bold text-sm">{m.tracking.timeEnrouteMinutes} <span className="text-[10px] opacity-40">MIN</span></span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button asChild variant="ghost" size="sm" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                                    <Link to={`/report/${m.missionId}`}><History className="w-4 h-4" /></Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const MoveRight = ({ className }: { className?: string }) => (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default Logbook;