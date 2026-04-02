import { useActiveMissions } from '@/hooks/useMissions';
import { useHemsData } from '@/hooks/useHemsData';
import TacticalMap from '@/components/maps/TacticalMap';
import { Loader2, Crosshair, Layers, Satellite } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { useLivePilots } from '@/hooks/useLivePilots';

const MapEmbedPage = () => {
  const { data: activeMissions, isLoading: isMissionsLoading } = useActiveMissions();
  const { data: livePilots } = useLivePilots();
  const { hospitals, bases, isLoading: isHemsLoading } = useHemsData();

  const isLoading = isMissionsLoading || isHemsLoading;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      <div className="px-4 md:px-8">
        <PageHeader 
            title="Regional Tactical Display"
            description="Real-time surveillance of HEMS assets, regional trauma centers, and active theater units."
            icon={Crosshair}
            actions={
                <div className="flex items-center space-x-3">
                    <div className="bg-muted px-5 py-2.5 rounded-2xl border flex items-center space-x-8 shadow-inner">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">Live Traffic</span>
                            <span className="font-mono font-black text-primary text-lg leading-none">{livePilots?.length || 0}</span>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">Medical Nodes</span>
                            <span className="font-mono font-black text-primary text-lg leading-none">{hospitals.length}</span>
                        </div>
                    </div>
                    <Badge className="bg-green-600 font-black italic shadow-lg h-10 px-4 flex items-center">
                        <Satellite className="w-4 h-4 mr-2" /> LIVE STREAM
                    </Badge>
                </div>
            }
        />
      </div>

      <div className="flex-grow relative overflow-hidden rounded-3xl border-4 border-muted/50 bg-muted/20 shadow-2xl mx-4 md:mx-8 mb-4">
        {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-10 bg-background/80 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Initializing Regional Uplink...</p>
            </div>
        ) : (
            <>
                <TacticalMap 
                    missions={activeMissions || []} 
                    bases={bases} 
                />
                
                {/* Map Overlay Controls UI */}
                <div className="absolute top-6 left-6 z-[1000] flex flex-col space-y-2 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white space-y-3 shadow-2xl pointer-events-auto min-w-[160px]">
                        <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-primary border-b border-white/10 pb-2 mb-2">
                            <Layers className="w-4 h-4" />
                            <span>Visual Overlay</span>
                        </div>
                        <label className="flex items-center space-x-3 cursor-pointer group hover:text-primary transition-colors">
                            <div className="w-3 h-3 rounded bg-primary shadow-[0_0_8px_rgba(255,165,0,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Base Stations</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer group hover:text-primary transition-colors">
                            <div className="w-3 h-3 rounded bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Trauma Hubs</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer group hover:text-primary transition-colors">
                            <div className="w-3 h-3 rounded bg-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.5)] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Tracks</span>
                        </label>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default MapEmbedPage;