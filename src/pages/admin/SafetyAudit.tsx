import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldAlert, Loader2, AlertTriangle, CheckCircle2, History, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIncidentReports, IncidentReport } from '@/hooks/useIncidentReports';
import { Badge } from '@/components/ui/badge';
import IncidentReviewModal from '@/components/safety/IncidentReviewModal';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

const AdminSafetyAudit = () => {
    const { reports, isLoading, resolveReport, isResolving } = useIncidentReports();
    const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const stats = {
        total: reports.length,
        open: reports.filter(r => r.status === 'Open').length,
        resolved: reports.filter(r => r.status === 'Resolved').length,
    };

    const handleReview = (incident: IncidentReport) => {
        setSelectedIncident(incident);
        setIsReviewOpen(true);
    };
    
    const handleResolve = async (id: string, resolution: string) => {
        await resolveReport({ id, resolution });
    };

    const getSeverityColor = (severity: IncidentReport['severity']) => {
        switch (severity) {
          case 'Critical': return 'bg-red-600 text-white';
          case 'High': return 'bg-orange-600 text-white';
          case 'Medium': return 'bg-yellow-500 text-black';
          default: return 'bg-blue-600 text-white';
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
            <PageHeader 
                title="Safety Command Audit"
                description="Organizational oversight of regional safety occurrences and resolutions."
                icon={ShieldAlert}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-destructive/5 border-destructive/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-destructive flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" /> UNRESOLVED HAZARDS
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black italic">{stats.open}</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-600/5 border-green-600/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> AUDITED & CLOSED
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black italic">{stats.resolved}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center">
                            <History className="w-4 h-4 mr-2" /> HISTORICAL CUMULATIVE
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black italic">{stats.total}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-destructive/50">
                <CardHeader className="bg-muted/30">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">Incident Master Log</CardTitle>
                            <CardDescription>Select an open record to begin administrative review.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Mission</TableHead>
                                    <TableHead className="max-w-xs">Executive Summary</TableHead>
                                    <TableHead className="text-right pr-6">Review</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((r) => (
                                    <TableRow key={r.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <Badge className={cn(
                                                "font-black italic text-[9px] px-3",
                                                r.status === 'Open' ? "bg-red-600 animate-pulse" : "bg-green-600"
                                            )}>
                                                {r.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm font-bold">{r.report_type}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">{new Date(r.created_at).toLocaleDateString()}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("font-black uppercase tracking-tighter text-[10px] px-3", getSeverityColor(r.severity))}>
                                                {r.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono font-black text-primary">{r.mission_id}</TableCell>
                                        <TableCell className="max-w-xs truncate italic text-xs text-muted-foreground">"{r.description}"</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button 
                                                variant={r.status === 'Open' ? 'default' : 'outline'} 
                                                size="sm"
                                                onClick={() => handleReview(r)}
                                                className="h-8 font-black uppercase text-[10px] italic"
                                            >
                                                <Eye className="w-3 h-3 mr-1.5" /> 
                                                {r.status === 'Open' ? 'REVIEW' : 'VIEW RESOLUTION'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {selectedIncident && (
                <IncidentReviewModal 
                    open={isReviewOpen}
                    onOpenChange={setIsReviewOpen}
                    incident={selectedIncident}
                    onResolve={handleResolve}
                    isResolving={isResolving}
                />
            )}
        </div>
    );
};

export default AdminSafetyAudit;