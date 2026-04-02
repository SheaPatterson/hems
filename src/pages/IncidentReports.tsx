import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldAlert, PlusCircle, Loader2, AlertTriangle, CheckCircle2, History, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIncidentReports, IncidentReport } from '@/hooks/useIncidentReports';
import { Badge } from '@/components/ui/badge';
import IncidentReportForm from '@/components/safety/IncidentReportForm';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import { useUserRole } from '@/hooks/useUserRole';
import { Link } from 'react-router-dom';

const IncidentReports = () => {
  const { reports, isLoading, isError } = useIncidentReports();
  const { isAdmin } = useUserRole();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getSeverityColor = (severity: IncidentReport['severity']) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600 text-white hover:bg-red-700';
      case 'High': return 'bg-orange-600 text-white hover:bg-orange-700';
      case 'Medium': return 'bg-yellow-500 text-black hover:bg-yellow-600';
      default: return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.severity === 'Critical').length,
    high: reports.filter(r => r.severity === 'High').length,
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl">
      <PageHeader 
        title="Safety Management System"
        description="Regional risk monitoring and operational incident auditing (SMS)."
        icon={ShieldAlert}
        actions={
            <Button onClick={() => setIsFormOpen(true)} size="lg" variant="destructive" className="font-black italic shadow-xl rounded-xl h-14 px-8">
                <PlusCircle className="w-5 h-5 mr-2" /> FILE SAFETY REPORT
            </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-destructive flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Active Hazards
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-black italic">{stats.critical + stats.high}</p>
                  <p className="text-xs text-muted-foreground">High/Critical reports pending review.</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center">
                    <History className="w-3 h-3 mr-1" /> Total Records
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-black italic">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Archived safety events in system.</p>
              </CardContent>
          </Card>
          <Card className="bg-green-600/5 border-green-600/20">
              <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> System Health
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-black italic text-green-600">STABLE</p>
                  <p className="text-xs text-muted-foreground">Regional operational safety metric.</p>
              </CardContent>
          </Card>
      </div>

      <Card className="border-t-4 border-destructive/50 overflow-hidden">
        <CardHeader className="bg-muted/30">
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-xl">Safety Event Registry</CardTitle>
                    <CardDescription>Comprehensive log of regional operational occurrences.</CardDescription>
                </div>
                {isAdmin && (
                    <Button asChild variant="default" size="sm" className="h-10 px-4 font-bold uppercase text-[10px] tracking-widest">
                        <Link to="/admin/safety-audit">
                            <Eye className="w-3 h-3 mr-1" /> HQ Audit Terminal
                        </Link>
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="p-20 text-center text-destructive">Failed to synchronize with safety database.</div>
          ) : reports.length === 0 ? (
            <div className="p-20 text-center border-2 border-dashed m-6 rounded-2xl bg-muted/20">
                <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground font-bold italic">No safety reports currently filed in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Mission Ref</TableHead>
                    <TableHead className="max-w-md">Executive Summary</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/30 transition-colors group cursor-help">
                      <TableCell className="text-xs font-mono py-4">
                        <div className="font-bold">{new Date(report.created_at).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">{new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold uppercase tracking-widest text-[9px]">{report.report_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-black uppercase tracking-tighter text-[10px] px-3", getSeverityColor(report.severity))}>
                            {report.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-primary text-sm">
                        {report.mission_id}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm line-clamp-2 leading-relaxed">{report.description}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                            "font-black italic text-[9px] px-3",
                            report.status === 'Open' ? "bg-red-600 animate-pulse" : "bg-green-600"
                        )}>
                            {report.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <IncidentReportForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />
    </div>
  );
};

export default IncidentReports;