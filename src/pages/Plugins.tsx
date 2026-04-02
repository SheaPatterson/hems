import { Code, Zap, Radio, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { simulatorPackages } from '@/data/simulatorPackages';
import SimulatorPackageCard from '@/components/simulator/SimulatorPackageCard';

const Plugins = () => {
    const { profile } = useProfileManagement();
    const apiKey = profile?.api_key || 'LOGIN_TO_VIEW_KEY';

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-12 animate-in fade-in duration-1000">
            <PageHeader 
                title="Tactical Integration Hub"
                description="Initialize your simulator data link. Required for live tracking and AI radio comms."
                icon={Code}
                actions={
                    <div className="flex items-center space-x-4 bg-primary/5 border border-primary/20 p-4 rounded-2xl">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase text-primary tracking-widest">Current Protocol</p>
                            <p className="text-sm font-mono font-bold leading-none mt-0.5 text-foreground">v5.3.0-STABLE</p>
                        </div>
                        <Separator orientation="vertical" className="h-8 opacity-20" />
                        <div className="p-2 bg-green-600/10 rounded-lg">
                            <Activity className="w-5 h-5 text-green-600 animate-pulse" />
                        </div>
                    </div>
                }
            />

            {/* Tactical Steps Flow */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-muted/30 border-2 rounded-[2rem] flex flex-col justify-between h-40">
                    <div>
                        <div className="flex items-center space-x-2 text-primary mb-2">
                            <Radio className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">PHASE 1</span>
                        </div>
                        <h4 className="text-lg font-black italic uppercase leading-none">Uplink Script</h4>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">Install the Lua script inside your simulator folders to pipe data.</p>
                    </div>
                    <div className="flex items-center justify-end">
                        <ChevronRight className="w-5 h-5 text-muted-foreground opacity-20" />
                    </div>
                </div>
                <div className="p-6 bg-muted/30 border-2 rounded-[2rem] flex flex-col justify-between h-40 border-primary/20">
                    <div>
                        <div className="flex items-center space-x-2 text-primary mb-2">
                            <Zap className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">PHASE 2</span>
                        </div>
                        <h4 className="text-lg font-black italic uppercase leading-none">Standalone App</h4>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">Launch the Bridge client for your specific OS (Windows/Mac).</p>
                    </div>
                    <div className="flex items-center justify-end">
                        <ChevronRight className="w-5 h-5 text-primary opacity-40" />
                    </div>
                </div>
                <div className="p-6 bg-primary/5 border-2 border-primary/40 border-dashed rounded-[2rem] flex flex-col justify-between h-40">
                    <div>
                        <div className="flex items-center space-x-2 text-primary mb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">RESULT</span>
                        </div>
                        <h4 className="text-lg font-black italic uppercase leading-none text-primary">Live Theater</h4>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">Engage in professional missions with real-time global telemetry.</p>
                    </div>
                </div>
            </section>

            {/* Main Package Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {simulatorPackages.map((pkg) => (
                    <SimulatorPackageCard key={pkg.id} pkg={pkg} apiKey={apiKey} />
                ))}
            </div>

            <Separator className="opacity-50" />

            {/* Quick-Action Footer */}
            <div className="bg-muted/30 p-10 rounded-[3rem] border-2 border-dashed flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div className="space-y-3 text-center md:text-left">
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">Stuck on Installation?</h4>
                    <p className="text-sm text-muted-foreground font-medium max-w-xl leading-relaxed">
                        Read the full <span className="font-bold text-foreground">Technical Manual</span> for platform-specific troubleshooting, including macOS terminal commands and X-Plane firewall configuration.
                    </p>
                </div>
                <Button asChild variant="outline" className="h-16 px-10 border-2 font-black uppercase rounded-2xl shadow-xl hover:bg-primary hover:text-black transition-all">
                    <Link to="/documentation">View Technical Manual</Link>
                </Button>
            </div>
        </div>
    );
};

export default Plugins;