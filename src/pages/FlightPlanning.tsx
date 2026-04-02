import { useState } from 'react';
import { Plane, Loader2, Search, Globe, Sunrise, Sunset, Compass, Wind, Radio, Layers } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAirportInfo } from '@/hooks/useAirportInfo';
import { AirportData } from '@/types/flightplandb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const AirportInfoDisplay: React.FC<{ data: AirportData }> = ({ data }) => {
    return (
        <Card className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-2 border-primary/20 shadow-xl">
            <CardHeader className="bg-primary/5">
                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">{data.name}</CardTitle>
                <CardDescription className="text-lg font-medium">{data.ICAO} / {data.IATA}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard icon={Globe} label="Location" value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`} />
                    <InfoCard icon={Sunrise} label="Sunrise" value={new Date(data.times.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                    <InfoCard icon={Sunset} label="Sunset" value={new Date(data.times.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                    <InfoCard icon={Compass} label="Elevation" value={`${data.elevation.toLocaleString()} ft`} />
                </div>

                <Tabs defaultValue="weather">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="weather"><Wind className="w-4 h-4 mr-2" />Weather</TabsTrigger>
                        <TabsTrigger value="runways"><Layers className="w-4 h-4 mr-2" />Runways</TabsTrigger>
                        <TabsTrigger value="frequencies"><Radio className="w-4 h-4 mr-2" />Frequencies</TabsTrigger>
                    </TabsList>
                    <TabsContent value="weather" className="mt-4">
                        <div className="space-y-4 font-mono text-xs bg-muted/50 p-4 rounded-lg border">
                            <div>
                                <h4 className="font-bold text-primary mb-1">METAR:</h4>
                                <p className="whitespace-pre-wrap">{data.weather.METAR || 'Not available.'}</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-bold text-primary mb-1">TAF:</h4>
                                <p className="whitespace-pre-wrap">{data.weather.TAF || 'Not available.'}</p>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="runways" className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ident</TableHead>
                                    <TableHead>Length</TableHead>
                                    <TableHead>Surface</TableHead>
                                    <TableHead>Lighting</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.runways.map((rwy, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-bold">{rwy.ident}</TableCell>
                                        <TableCell>{rwy.length.toLocaleString()} ft</TableCell>
                                        <TableCell><Badge variant="secondary">{rwy.surface}</Badge></TableCell>
                                        <TableCell>{rwy.lighting.join(', ') || 'None'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="frequencies" className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.frequencies.map((freq, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-bold">{freq.type}</TableCell>
                                        <TableCell className="font-mono">{(freq.frequency / 1e6).toFixed(3)}</TableCell>
                                        <TableCell>{freq.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

const InfoCard: React.FC<{ icon: React.ElementType, label: string, value: string }> = ({ icon: Icon, label, value }) => (
    <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
        <p className="text-[9px] font-black uppercase text-muted-foreground mb-1 flex items-center"><Icon className="w-3 h-3 mr-1" /> {label}</p>
        <p className="text-lg font-mono font-bold leading-none">{value}</p>
    </div>
);

const FlightPlanning = () => {
    const [icao, setIcao] = useState('');
    const { mutate: fetchAirport, isPending, data, isError } = useAirportInfo();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (icao.trim().length >= 3) {
            fetchAirport(icao.trim());
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
            <PageHeader 
                title="Airport Database"
                description="Access global airport information, live weather, and operational frequencies."
                icon={Plane}
            />

            <Card className="shadow-lg">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input 
                                placeholder="Enter Airport ICAO (e.g., KPIT)"
                                value={icao}
                                onChange={(e) => setIcao(e.target.value.toUpperCase())}
                                className="h-16 pl-12 text-2xl font-mono font-black tracking-widest uppercase"
                            />
                        </div>
                        <Button type="submit" size="lg" className="h-16 px-10 text-lg font-black italic" disabled={isPending}>
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {isPending && (
                <div className="flex justify-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {isError && (
                <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                    <p className="text-destructive font-bold">Data Link Error</p>
                    <p className="text-sm text-muted-foreground">Could not retrieve data for the specified airport. Please check the ICAO code or API key status.</p>
                </div>
            )}

            {data && <AirportInfoDisplay data={data} />}
        </div>
    );
};

export default FlightPlanning;