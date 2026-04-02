import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LayoutDashboard, MapPin, Hospital, PlaneTakeoff, History, Clock, Eye, Megaphone, Info } from 'lucide-react';
import StatCard from './StatCard';
import OperationalCharts from './OperationalCharts';
import { useMissions } from '@/hooks/useMissions';
import { Link } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface DashboardTabsProps {
    stats: {
        bases: number;
        hospitals: number;
        helicopters: number;
        missions: number;
    } | null;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ stats }) => {
    const { data: missions } = useMissions();
    const { isAdmin } = useUserRole();
    
    // Filter for recent completed/cancelled missions for the history snippet
    const recentMissions = missions?.filter(m => m.status !== 'active').slice(0, 5) || [];

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview" className="flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Alerts & Notices
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="HEMS Bases" 
                        value={stats?.bases || 0} 
                        icon={MapPin} 
                        description="Total operational bases configured" 
                    />
                    <StatCard 
                        title="Hospitals" 
                        value={stats?.hospitals || 0} 
                        icon={Hospital} 
                        description="Total hospitals in directory" 
                    />
                    <StatCard 
                        title="Aircraft Fleet" 
                        value={stats?.helicopters || 0} 
                        icon={PlaneTakeoff} 
                        description="Total helicopters registered" 
                    />
                    <StatCard 
                        title="Missions Logged" 
                        value={stats?.missions || 0} 
                        icon={History} 
                        description="Total missions dispatched to date" 
                    />
                </div>

                {missions && missions.length > 0 && (
                    <OperationalCharts missionHistory={missions} />
                )}

                <Card className="mt-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl flex items-center">
                            <History className="w-5 h-5 mr-2 text-primary" /> Recent Mission History
                        </CardTitle>
                        <Button asChild variant="link" size="sm">
                            <Link to="/mission-history">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        {recentMissions.length > 0 ? (
                            <div className="space-y-3">
                                {recentMissions.map(m => (
                                    <div key={m.id} className={cn("flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border/50")}>
                                        <div className="flex items-center space-x-3">
                                            <Badge variant={m.status === 'completed' ? 'default' : 'destructive'} className="text-[9px] h-5 font-black italic uppercase">{m.status}</Badge>
                                            <span className="font-mono text-sm text-primary">{m.missionId}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs text-muted-foreground flex items-center">
                                                <Clock className="w-3 h-3 mr-1" /> {new Date(m.created_at).toLocaleDateString()}
                                            </span>
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                <Link to={`/report/${m.missionId}`}><Eye className="w-4 h-4" /></Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic text-sm">No recent completed missions found.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="alerts" className="mt-4">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-xl font-semibold flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-destructive" /> System Alerts & Notices
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            All active NOTAMs (Notice to Air Missions) are displayed globally at the top of the dashboard for immediate visibility.
                        </p>
                        {isAdmin && (
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/admin/notams">
                                    <Megaphone className="w-4 h-4 mr-2" /> Manage NOTAM Broadcasts
                                </Link>
                            </Button>
                        )}
                        {!isAdmin && (
                            <Alert className="bg-blue-500/10 border-blue-600/30">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="font-bold uppercase tracking-tighter text-xs text-blue-600">Information</AlertTitle>
                                <AlertDescription className="text-sm font-medium text-muted-foreground">
                                    Check the global banner above for any active weather or operational advisories.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};

export default DashboardTabs;