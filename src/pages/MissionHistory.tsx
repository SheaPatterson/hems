import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Search, Eye, MapPin, Plane, Loader2, Calendar, CheckCircle2, XCircle, Activity, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMissions, HistoricalMission } from '@/hooks/useMissions';
import { useAuth } from '@/components/AuthGuard';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'; // Import ContextMenu components

const getStatusBadge = (status: HistoricalMission['status']) => {
    switch (status) {
        case 'active':
            return <Badge className="bg-green-600 animate-pulse font-black italic text-[9px] px-2 h-5 shadow-sm flex items-center"><Activity className="w-3 h-3 mr-1" /> ACTIVE</Badge>;
        case 'completed':
            return <Badge className="bg-primary font-black italic text-[9px] px-2 h-5 shadow-sm flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETED</Badge>;
        case 'cancelled':
            return <Badge variant="destructive" className="font-black italic text-[9px] px-2 h-5 shadow-sm flex items-center"><XCircle className="w-3 h-3 mr-1" /> CANCELLED</Badge>;
        default:
            return <Badge variant="secondary" className="font-black italic text-[9px] px-2 h-5">UNKNOWN</Badge>;
    }
};

const MissionHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | HistoricalMission['status']>('all');

  const { data: missions, isLoading, isError } = useMissions(user?.id, statusFilter);

  const filteredMissions = (missions || []).filter(m => 
    m.missionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.destination.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLaunchNewMission = (mission: HistoricalMission) => {
    // Pre-fill the planner with the base, helicopter, and crew from the historical mission
    const preFilledState = {
        missionType: mission.type,
        selectedBaseId: mission.hemsBase.id,
        selectedHelicopter: mission.helicopter,
        crew: mission.crew,
        // Note: Origin/Destination/Patient details would need more complex mapping if required
    };
    navigate('/generate', { state: preFilledState });
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <PageHeader 
        title="Mission Archive"
        description="Review and audit historical flight records and patient transport logs."
        icon={History}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Mission ID, Call Type, or Destination..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-4 md:w-auto">
                    <TabsTrigger value="all" className="text-xs">All ({missions?.length || 0})</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled" className="text-xs">Cancelled</TabsTrigger>
                </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <p className="text-destructive text-center p-10 font-bold">Failed to synchronize with central archive.</p>
          ) : filteredMissions.length === 0 ? (
            <div className="text-center p-20 border-2 border-dashed rounded-xl space-y-3">
                <History className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">No historical records found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Mission ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Date / Time</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMissions.map((m) => (
                    <ContextMenu key={m.id}>
                        <ContextMenuTrigger asChild>
                            <TableRow className="hover:bg-muted/30 cursor-context-menu">
                                <TableCell className="font-mono font-bold text-primary">{m.missionId}</TableCell>
                                <TableCell>{getStatusBadge(m.status)}</TableCell>
                                <TableCell>
                                    <Badge variant={m.type === 'Scene Call' ? 'destructive' : 'outline'} className={cn("text-[9px] h-5", m.type === 'Scene Call' ? 'bg-red-600/10 text-red-600 border-red-600/30' : '')}>
                                        {m.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-sm font-medium">
                                        <Plane className="w-3 h-3 mr-1 text-muted-foreground" />
                                        {m.helicopter.registration}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    <div className="flex items-center text-sm">
                                        <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                                        {m.destination.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    <div className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                                        {new Date(m.created_at).toLocaleDateString()}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleTimeString()}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link to={`/report/${m.missionId}`}>
                                            <Eye className="w-4 h-4 mr-1" /> View Report
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onClick={() => navigate(`/report/${m.missionId}`)}>
                                <ExternalLink className="w-4 h-4 mr-2" /> View Full Report
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleLaunchNewMission(m)}>
                                <Zap className="w-4 h-4 mr-2" /> Re-Dispatch Mission
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
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

export default MissionHistory;