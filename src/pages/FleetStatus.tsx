import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plane, Loader2, Fuel, Gauge, MapPin, Zap, Activity } from 'lucide-react';
import { useHemsData } from '@/hooks/useHemsData';
import { Badge } from '@/components/ui/badge';

const FleetStatus = () => {
  const { helicopters, bases, isLoading, isError } = useHemsData();

  // Map bases by helicopter ID for quick lookup
  const baseMap = new Map(bases.map(base => [base.helicopterId, base]));

  const combinedFleetData = helicopters.map(h => ({
    ...h,
    assignedBase: baseMap.get(h.id),
  }));

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
            <Plane className="w-10 h-10 mr-3 text-primary" /> Aircraft Fleet Status
          </h1>
          <p className="text-lg text-muted-foreground mt-1">Real-time technical specifications and geographic distribution of the air medical fleet.</p>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4">Polling Telemetry Gateway...</p>
        </div>
      ) : isError ? (
        <p className="text-destructive text-center p-10 bg-destructive/5 rounded-xl font-bold">Hardware communication link failure.</p>
      ) : combinedFleetData.length === 0 ? (
        <p className="text-muted-foreground text-center p-10 border-2 border-dashed rounded-xl italic">Fleet registry is currently empty.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8">
            <Card className="border-t-4 border-primary">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-primary" /> Asset Readiness Matrix
                    </CardTitle>
                    <CardDescription>Current operational configurations and fuel profiles.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[80px]">Photo</TableHead>
                                    <TableHead>Registration</TableHead>
                                    <TableHead>Model / Type</TableHead>
                                    <TableHead>Primary Station</TableHead>
                                    <TableHead className="text-right">Max Fuel</TableHead>
                                    <TableHead className="text-right">VNE Speed</TableHead>
                                    <TableHead className="text-right">Burn Rate</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {combinedFleetData.map((h) => (
                                    <TableRow key={h.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="h-10 w-16 bg-black rounded-md overflow-hidden border">
                                                {h.imageUrl ? (
                                                    <img src={h.imageUrl} className="w-full h-full object-cover" alt={h.registration} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-primary/20"><Plane className="w-4 h-4" /></div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono font-black text-primary text-lg">{h.registration}</TableCell>
                                        <TableCell className="font-bold">{h.model}</TableCell>
                                        <TableCell>
                                            {h.assignedBase ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm italic">{h.assignedBase.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase flex items-center"><MapPin className="w-2 h-2 mr-1" /> {h.assignedBase.location}</span>
                                                </div>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px]">UNASSIGNED</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <div className="flex items-center justify-end text-sm"><Fuel className="w-3 h-3 mr-1 opacity-40" /> {h.fuelCapacityLbs.toLocaleString()} <span className="text-[10px] ml-1 opacity-40">LB</span></div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <div className="flex items-center justify-end text-sm"><Gauge className="w-3 h-3 mr-1 opacity-40" /> {h.cruiseSpeedKts} <span className="text-[10px] ml-1 opacity-40">KT</span></div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <div className="flex items-center justify-end text-sm"><Zap className="w-3 h-3 mr-1 opacity-40" /> {h.fuelBurnRateLbHr} <span className="text-[10px] ml-1 opacity-40">LB/H</span></div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className="bg-green-600 hover:bg-green-600 font-bold italic shadow-sm">OPERATIONAL</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
};

export default FleetStatus;