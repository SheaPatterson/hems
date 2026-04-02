"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench, Loader2, Plane, CheckCircle2, AlertTriangle, Filter, Search, Calendar, Zap, Activity } from 'lucide-react';
import { useHemsData } from '@/hooks/useHemsData';
import { useHelicopterManagement } from '@/hooks/useHelicopterManagement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const AdminMaintenance = () => {
    const { helicopters, isLoading, refetch } = useHemsData();
    const { updateHelicopter, isUpdating } = useHelicopterManagement();
    const [searchTerm, setSearchTerm] = useState('');

    const toggleStatus = async (h: any) => {
        const newStatus = h.maintenanceStatus === 'FMC' ? 'AOG' : 'FMC';
        try {
            await updateHelicopter({
                id: h.id,
                data: {
                    ...h,
                    maintenanceStatus: newStatus,
                    fuelCapacityLbs: Number(h.fuelCapacityLbs),
                    cruiseSpeedKts: Number(h.cruiseSpeedKts),
                    fuelBurnRateLbHr: Number(h.fuelBurnRateLbHr)
                }
            });
            toast.success(`${h.registration} marked as ${newStatus}`);
            refetch();
        } catch (e) {
            toast.error("Failed to update status.");
        }
    };

    const filtered = helicopters.filter(h => 
        h.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: helicopters.length,
        aog: helicopters.filter(h => h.maintenanceStatus === 'AOG').length,
        fmc: helicopters.filter(h => h.maintenanceStatus === 'FMC').length,
    };

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            <PageHeader 
                title="Maintenance Command"
                description="Monitor fleet readiness and manage Aircraft On Ground (AOG) status."
                icon={Wrench}
                actions={
                    <div className="flex items-center space-x-3 bg-muted/50 p-4 rounded-2xl border shadow-inner">
                        <div className="text-center px-4">
                            <p className="text-[9px] font-black uppercase text-muted-foreground">FMC Assets</p>
                            <p className="text-xl font-mono font-black text-green-600">{stats.fmc}</p>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="text-center px-4">
                            <p className="text-[9px] font-black uppercase text-muted-foreground">AOG Alerts</p>
                            <p className="text-xl font-mono font-black text-red-600">{stats.aog}</p>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-3 border-t-4 border-primary">
                    <CardHeader className="bg-muted/30 border-b">
                        <div className="flex justify-between items-center gap-4">
                            <div className="relative flex-grow max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search airframe registry..." 
                                    className="pl-10 h-10 text-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm" className="h-10 px-4 font-bold uppercase text-[10px] tracking-widest">
                                <Filter className="w-3.5 h-3.5 mr-1.5" /> Fleet Filter
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Airframe</TableHead>
                                        <TableHead>Readiness</TableHead>
                                        <TableHead>Specs</TableHead>
                                        <TableHead className="text-right pr-6">Operational Control</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((h) => (
                                        <TableRow key={h.id} className="hover:bg-muted/30 group transition-colors">
                                            <TableCell className="py-5">
                                                <div className="flex items-center space-x-4">
                                                    <div className="p-2 bg-muted rounded-xl border group-hover:bg-primary/10 transition-colors">
                                                        <Plane className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black italic uppercase text-foreground leading-none">{h.registration}</p>
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-1">{h.model}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "font-black italic text-[10px] px-3 h-6 shadow-sm",
                                                    h.maintenanceStatus === 'FMC' ? "bg-green-600" : "bg-red-600 animate-pulse"
                                                )}>
                                                    {h.maintenanceStatus === 'FMC' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                                    {h.maintenanceStatus === 'FMC' ? 'FULLY CAPABLE' : 'GROUND STOP'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-[10px] font-mono text-muted-foreground">
                                                    <span>FUEL: {h.fuelCapacityLbs} LB</span>
                                                    <span>BURN: {h.fuelBurnRateLbHr} LB/H</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button 
                                                    onClick={() => toggleStatus(h)}
                                                    disabled={isUpdating}
                                                    variant={h.maintenanceStatus === 'FMC' ? 'destructive' : 'default'}
                                                    size="sm"
                                                    className="h-9 font-black italic uppercase tracking-tighter"
                                                >
                                                    {h.maintenanceStatus === 'FMC' ? 'FORCE AOG' : 'RETURN TO SERVICE'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-muted/30 border-2">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-primary" /> Readiness Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Fleet Availability</p>
                                <p className="text-3xl font-mono font-black italic text-primary">
                                    {Math.round((stats.fmc / stats.total) * 100)}%
                                </p>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase">Compliance Audit</p>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                            AOG status is enforced globally. Aircraft marked as grounded will be hidden from the Mission Dispatch Planner.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Zap className="w-4 h-4 text-primary mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase">Real-Time Sync</p>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                            Maintenance updates propagate to the Pilot Data Link (TDL) on the next 4-second polling cycle.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminMaintenance;