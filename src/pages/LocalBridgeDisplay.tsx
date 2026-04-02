"use client";

import { Shield, MapPin, Zap, Fuel, Clock, Navigation, Power, MessageSquare, Activity, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalBridge } from '@/hooks/useLocalBridge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BridgeChat from '@/components/BridgeChat';
import { Separator } from '@/components/ui/separator';

// NOTE: This component polls the local Node.js bridge server running on port 8080.
// This is intended for the standalone Electron/Desktop client environment.

export default function LocalBridgeDisplay() {
    const { 
        telemetry: t, 
        status: s, 
        mission, 
        isPolling, 
        apiKey, 
        setApiKey, 
        isAuthenticated, 
        handleAuth 
    } = useLocalBridge();

    const isSimConnected = s?.simConnected;
    const isCloudConnected = s?.cloudConnected;

    if (!isAuthenticated) {
        return (
            <Card className="h-[80vh] border-4 border-[#00ff41]/20 bg-black text-[#00ff41] font-mono shadow-2xl flex flex-col items-center justify-center p-12 space-y-8">
                <div className="relative">
                    <Power className="w-20 h-20 animate-pulse text-[#00ff41]" />
                    <div className="absolute inset-0 bg-[#00ff41]/20 blur-2xl rounded-full" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">HEMS Bridge Locked</h2>
                    <p className="text-[10px] opacity-60 uppercase tracking-[0.4em]">Requires Cloud Authentication</p>
                </div>
                <div className="w-full max-w-xs space-y-4">
                    <Input 
                        type="password" 
                        placeholder="INPUT_API_TOKEN..." 
                        className="bg-zinc-900 border-[#00ff41]/40 text-[#00ff41] text-center placeholder:text-[#00ff41]/20 focus-visible:ring-[#00ff41]"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button onClick={handleAuth} className="w-full bg-[#00ff41] text-black font-black italic uppercase hover:bg-[#00cc33] transition-all">Connect Uplink</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="min-h-[80vh] bg-black text-[#00ff41] font-mono p-6 flex flex-col space-y-6 border-4 border-[#00ff41]/20 rounded-[2rem] shadow-[0_0_40px_rgba(0,255,65,0.1)]">
            {/* Header / Status Bar */}
            <header className="flex justify-between items-center border-b border-[#00ff41]/30 pb-4">
                <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-orange-500" />
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase">HEMS Tactical Bridge</h1>
                        <p className="text-[8px] opacity-60 tracking-[0.4em]">Integrated Flight Ops v5.3</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6 text-[10px] font-bold">
                    <StatusIndicator label="BRIDGE_POLL" active={!isPolling} />
                    <StatusIndicator label="SIM_LINK" active={isSimConnected} />
                    <StatusIndicator label="CLOUD_SYNC" active={isCloudConnected} />
                </div>
            </header>

            {/* Main Content Grid: Telemetry + Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow min-h-0">
                
                {/* Left Column: Core Telemetry & Mission Info */}
                <div className="lg:col-span-2 flex flex-col space-y-6">
                    {/* Nav Data Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <Metric label="ALTITUDE" value={t?.altitudeFt?.toLocaleString() || "---"} unit="FT" icon={Navigation} />
                        <Metric label="GROUND_SPD" value={t?.groundSpeedKts || "---"} unit="KTS" icon={Zap} />
                        <Metric label="HEADING" value={t?.headingDeg || "---"} unit="DEG" icon={Navigation} />
                    </div>

                    {/* Mission Focus Card */}
                    <Card className="flex-grow bg-zinc-900/50 rounded-[2rem] border border-[#00ff41]/10 p-8 flex flex-col justify-center space-y-6">
                        <div className="text-center">
                            <p className="text-[10px] opacity-40 uppercase tracking-widest mb-2">Active Mission ID</p>
                            <h2 className="text-4xl font-black italic text-white">{mission?.missionId || "STANDBY"}</h2>
                        </div>
                        <Separator className="bg-[#00ff41]/10" />
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1">
                                <p className="text-[9px] opacity-40 uppercase tracking-widest flex items-center"><MapPin className="w-3 h-3 mr-1" /> Target Node</p>
                                <p className="text-lg font-black italic text-primary">{mission?.destination?.name || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] opacity-40 uppercase tracking-widest flex items-center"><Activity className="w-3 h-3 mr-1" /> Current Phase</p>
                                <p className="text-lg font-black italic text-white">{mission?.tracking?.phase || "Dispatch"}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center space-x-2 mt-4">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Lat: {t?.latitude.toFixed(4) || "0.0000"} / Lon: {t?.longitude.toFixed(4) || "0.0000"}</span>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Radio Comms */}
                <div className="lg:col-span-2 min-h-[400px]">
                    {mission ? (
                        <BridgeChat mission={mission} />
                    ) : (
                        <Card className="h-full flex flex-col items-center justify-center border-2 border-primary/20 bg-[#020202] text-[#00ff41] font-mono shadow-2xl overflow-hidden relative p-8">
                            <MessageSquare className="w-12 h-12 text-[#00ff41]/20 mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest text-[#00ff41]/40 text-center">Awaiting Active Mission Context</p>
                            <p className="text-[10px] opacity-40 mt-2">Start a mission in the HEMS OPS-CENTER web app to enable radio comms.</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Footer / Logistics */}
            <footer className="border-t border-[#00ff41]/30 pt-4 space-y-2">
                <div className="grid grid-cols-3 gap-4">
                    <Metric label="FUEL_STATE" value={t?.fuelRemainingLbs?.toLocaleString() || "---"} unit="LB" icon={Fuel} alert={(t?.fuelRemainingLbs || 1000) < 300} />
                    <Metric label="LAST_PACKET" value={s?.lastPacketReceived ? new Date(s.lastPacketReceived).toLocaleTimeString() : "---"} unit="Z" icon={Clock} />
                    <Metric label="AIRFRAME" value={mission?.helicopter?.registration || "N/A"} unit={mission?.helicopter?.model || "N/A"} icon={Plane} />
                </div>
                <div className="h-4 bg-[#00ff41]/5 rounded flex items-center px-4 justify-between text-[8px] opacity-40">
                    <span>LOCAL_HANDSHAKE: {isPolling ? 'PENDING' : 'OK'}</span>
                    <span>PACKET_ID: {t?.timestamp || "000000000"}</span>
                </div>
            </footer>
        </div>
    );
}

function Metric({ label, value, unit, icon: Icon, alert = false }: any) {
    return (
        <div className={cn(`p-4 rounded-2xl border transition-all`, alert ? 'bg-red-500/10 border-red-500 animate-pulse' : 'bg-black/40 border-[#00ff41]/10')}>
            <div className="flex items-center space-x-2 opacity-40 mb-1">
                <Icon className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className={cn(`text-3xl font-black italic leading-none`, alert ? 'text-red-500' : 'text-white')}>
                {value} <span className="text-xs font-sans not-italic opacity-40">{unit}</span>
            </p>
        </div>
    );
}

function StatusIndicator({ label, active }: any) {
    return (
        <div className="flex items-center space-x-2">
            <span className="opacity-40">{label}</span>
            <div className={cn(`w-2 h-2 rounded-full`, active ? 'bg-[#00ff41] shadow-[0_0_8px_#00ff41]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]')} />
        </div>
    );
}