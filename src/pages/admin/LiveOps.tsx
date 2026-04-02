import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Loader2, Plane, StopCircle, MapPin, Clock } from 'lucide-react';
import { useActiveMissions, useMissionManagement } from '@/hooks/useMissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const AdminLiveOps = () => {
    const { data: activeMissions, isLoading } = useActiveMissions();
    const { updateStatus, isUpdating } = useMissionManagement();

    const handleTerminate = async (missionId: string) => {
        if (!confirm("Are you sure you want to force terminate this flight? It will be archived immediately.")) return;
        await updateStatus({ missionId, status: 'completed' });
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
                        <Activity className="w-10 h-10 mr-3 text-primary animate-pulse" /> Live Operations
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">Real-time mission oversight and flight management.</p>
                </div>
            </header>

            <Card className="border-t-4 border-primary">
                <CardHeader>
                    <CardTitle className="text-xl">Active Air Traffic</CardTitle>
                    <CardDescription>Monitor and control all flights currently marked as active in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : !activeMissions || activeMissions.length === 0 ? (
                        <div className="text-center p-20 border-2 border-dashed rounded-xl">
                            <Plane className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                            <p className="text-muted-foreground">No flights currently in progress.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mission</TableHead>
                                        <TableHead>Asset</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Status / Phase</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeMissions.map((m) => (
                                        <TableRow key={m.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="font-mono font-bold text-primary">{m.missionId}</div>
                                                <div className="text-[10px] text-muted-foreground flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Started {new Date(m.created_at).toLocaleTimeString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Plane className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{m.helicopter.registration}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-green-500" /> {m.hemsBase.name}</span>
                                                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-red-500" /> {m.destination.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                    {m.tracking.phase || 'ENROUTE'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link to={`/tracking/${m.missionId}`}>Track</Link>
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    disabled={isUpdating}
                                                    onClick={() => handleTerminate(m.missionId)}
                                                >
                                                    <StopCircle className="w-4 h-4 mr-1" /> Terminate
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLiveOps;