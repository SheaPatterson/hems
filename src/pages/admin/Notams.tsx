import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Megaphone, PlusCircle, Loader2, Trash2, History, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotams } from '@/hooks/useNotams';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const AdminNotams = () => {
    const { notams, isLoading, createNotam, deactivateNotam, isCreating } = useNotams();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('info');

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;

        try {
            await createNotam({ title, message, severity });
            setTitle('');
            setMessage('');
            setSeverity('info');
        } catch (error) {
            // Handled by hook
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-6xl">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center italic uppercase text-primary">
                        <Megaphone className="w-10 h-10 mr-3" /> NOTAM Command
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">Broadcast system-wide alerts, weather advisories, and operational notices.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 border-2 border-primary/20 shadow-xl bg-card/50">
                    <CardHeader className="bg-primary/5 border-b">
                        <CardTitle className="text-lg font-bold flex items-center">
                            <PlusCircle className="w-5 h-5 mr-2 text-primary" /> New Broadcast
                        </CardTitle>
                        <CardDescription>Target all active pilot dashboards.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleBroadcast} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alert Headline</Label>
                                <Input 
                                    placeholder="e.g. IMC IN NORTHERN SECTOR" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value.toUpperCase())}
                                    className="font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Urgency Level</Label>
                                <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="info">Information (Blue)</SelectItem>
                                        <SelectItem value="warning">Warning (Amber)</SelectItem>
                                        <SelectItem value="critical">Critical / Ground Stop (Red)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broadcast Message</Label>
                                <Textarea 
                                    placeholder="Provide detailed instructions or situational analysis..." 
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 font-black italic shadow-lg" disabled={isCreating}>
                                {isCreating ? <Loader2 className="animate-spin mr-2" /> : <Radio className="w-4 h-4 mr-2" />}
                                TRANSMIT TO FLEET
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-t-4 border-primary">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                            <History className="w-5 h-5 mr-2 text-muted-foreground" /> Active Broadcast Log
                        </CardTitle>
                        <CardDescription>Live notices currently visible to regional units.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                        ) : notams.length === 0 ? (
                            <div className="p-20 text-center space-y-2 opacity-30 italic">
                                <Megaphone className="mx-auto w-12 h-12" />
                                <p>No active NOTAMs in circulation.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Broadcast Content</TableHead>
                                        <TableHead className="text-right">Control</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notams.map((notam) => (
                                        <TableRow key={notam.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <Badge className={cn(
                                                    "font-black uppercase italic text-[9px] px-2",
                                                    notam.severity === 'critical' ? "bg-red-600" : 
                                                    notam.severity === 'warning' ? "bg-amber-500 text-black" : 
                                                    "bg-blue-600"
                                                )}>
                                                    {notam.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <p className="font-bold text-sm leading-tight mb-1">{notam.title}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{notam.message}</p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => deactivateNotam(notam.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Archive
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminNotams;