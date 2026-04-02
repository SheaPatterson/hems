import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { FileText, Loader2, Shield, Users, Activity, Zap, MapPin, PlaneTakeoff, Clock, Megaphone, ShieldCheck, Hospital, TrendingUp, Wrench } from 'lucide-react';
import { useConfig } from '@/hooks/useConfig';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/PageHeader';

const AdminOverview = () => {
  const { config, isLoading: isConfigLoading } = useConfig();

  // Real-time stats fetching with organizational performance metrics
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
        const [m, a, b, h, p, c] = await Promise.all([
            supabase.from('missions').select('*', { count: 'exact', head: true }),
            supabase.from('helicopters').select('*', { count: 'exact', head: true }),
            supabase.from('hems_bases').select('*', { count: 'exact', head: true }),
            supabase.from('hospitals').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('community_posts').select('*', { count: 'exact', head: true }),
        ]);

        const { data: lastMission } = await supabase
            .from('missions')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Fetch AOG count for technical readiness audit
        const { count: aogCount } = await supabase
            .from('helicopters')
            .select('*', { count: 'exact', head: true })
            .eq('maintenance_status', 'AOG');

        // Calculate organizational average performance score
        const { data: avgScoreData } = await supabase
            .from('missions')
            .select('performance_score')
            .not('performance_score', 'is', null);
        
        const totalScore = (avgScoreData || []).reduce((sum, m) => sum + (m.performance_score || 0), 0);
        const avgScore = avgScoreData?.length ? Math.round(totalScore / avgScoreData.length) : 0;


        return {
            missions: m.count || 0,
            aircraft: a.count || 0,
            bases: b.count || 0,
            hospitals: h.count || 0,
            users: p.count || 0,
            posts: c.count || 0,
            lastMissionTime: lastMission?.created_at,
            aogCount: aogCount || 0,
            avgScore: avgScore,
        };
    }
  });

  const getConfigValue = (key: string, defaultValue: string = 'N/A') => {
    return config.find(item => item.key === key)?.value || defaultValue;
  };

  const isLoading = isConfigLoading || isStatsLoading;

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Synchronizing Command Center...</p>
        </div>
    );
  }

  const timeSinceLastMission = stats?.lastMissionTime 
        ? `${Math.floor((new Date().getTime() - new Date(stats.lastMissionTime).getTime()) / (1000 * 60))}m ago`
        : 'None';

  return (
    <div className="container mx-auto p-6 space-y-8">
      <PageHeader 
        title="System Administration"
        description="Global oversight and operational control of the HEMS Simulation Network."
        icon={Shield}
        actions={
            <div className="text-right">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Last Dispatch</p>
                <div className="flex items-center text-primary font-bold">
                    <Clock className="w-4 h-4 mr-1" /> {timeSinceLastMission}
                </div>
            </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Total Missions" value={stats?.missions || 0} icon={Zap} description="Historical organization dispatches" />
        <AdminStatCard title="Fleet Strength" value={stats?.aircraft || 0} icon={PlaneTakeoff} description="Registered active airframes" />
        <AdminStatCard title="Avg. Performance" value={`${stats?.avgScore || 0}%`} icon={TrendingUp} description="Institutional performance metric" />
        <AdminStatCard title="AOG Aircraft" value={stats?.aogCount || 0} icon={Wrench} description="Aircraft On Ground (Technical Alert)" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-2">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-xl flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-primary" /> Management Terminal
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                {[
                    { title: 'Live Operations', desc: 'Real-time theater monitoring.', link: '/admin/live-ops', icon: Activity },
                    { title: 'NOTAM Broadcast', desc: 'Regional safety directives.', link: '/admin/notams', icon: Megaphone },
                    { title: 'Aircraft Control', desc: 'Technical specifications audit.', link: '/admin/aircraft', icon: PlaneTakeoff },
                    { title: 'Crew Bases', desc: 'Station readiness management.', link: '/admin/crew-bases', icon: MapPin },
                    { title: 'Facility Registry', desc: 'Trauma center data master.', link: '/admin/hospitals', icon: Hospital },
                    { title: 'Content Engine', desc: 'Manuals & SOP editor.', link: '/admin/content', icon: FileText },
                    { title: 'Personnel Manifest', desc: 'Pilot training records.', link: '/admin/profiles', icon: Users },
                    { title: 'RBAC Security', desc: 'System access control.', link: '/admin/permission', icon: ShieldCheck },
                ].map((tool) => (
                    <a key={tool.title} href={tool.link} className="group">
                        <div className="p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all h-full flex items-start space-x-4 shadow-sm">
                            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <tool.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{tool.title}</h4>
                                <p className="text-xs text-muted-foreground">{tool.desc}</p>
                            </div>
                        </div>
                    </a>
                ))}
            </CardContent>
        </Card>

        <Card className="border-2">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-xl">Safety Thresholds</CardTitle>
                <CardDescription>Global mission logic variables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Regional ID</p>
                    <p className="font-bold text-lg">{getConfigValue('systemName', 'HEMS OPS-CENTER')}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Reserve Fuel Target</p>
                    <p className="font-bold text-lg">{getConfigValue('fuelReserveMinutes', '20')} Minutes</p>
                </div>
                <Separator />
                <div className="space-y-1">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Max Transport Mass</p>
                    <p className="font-bold text-lg">{getConfigValue('maxPatientWeightLbs', '350')} Lbs</p>
                </div>
                <Separator />
                <div className="space-y-1">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">SOP Support Link</p>
                    <p className="font-bold text-xs truncate">{getConfigValue('supportEmail', 'ops@hemssim.com')}</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;