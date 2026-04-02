"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Radio, Navigation, Terminal, Power, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSimulatorPlugin } from '@/hooks/useSimulatorPlugin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import SimulatorMapPanel from '@/components/simulator/SimulatorMapPanel';
import SimulatorChat from '@/components/simulator/SimulatorChat';

const SimulatorPluginUI: React.FC = () => {
    const {
        apiKey, setApiKey, isAuthenticated, handleAuth,
        missions, selectedMission, setSelectedMission, isLoadingMissions, loadMissions,
        isConnected, isConnecting, connectToSimulator,
        isSyncing, startSync, stopSync,
        consoleOutput,
    } = useSimulatorPlugin();

    const [host, setHost] = useState(localStorage.getItem('xp_host') || 'localhost');
    const [port, setPort] = useState(localStorage.getItem('xp_port') || '8086');
    const scrollRef = useRef<HTMLDivElement>(null); 

    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) viewport.scrollTop = viewport.scrollHeight;
        }
    }, [consoleOutput]);


    const handleConnect = () => {
        localStorage.setItem('xp_host', host);
        localStorage.setItem('xp_port', port);
        connectToSimulator(host, parseInt(port, 10));
    };

    if (!isAuthenticated) {
        return (
            <Card className="h-[700px] border-4 border-[#00ff41]/20 bg-black text-[#00ff41] font-mono shadow-2xl flex flex-col items-center justify-center p-12 space-y-8">
                <div className="relative">
                    <Power className="w-20 h-20 animate-pulse text-[#00ff41]" />
                    <div className="absolute inset-0 bg-[#00ff41]/20 blur-2xl rounded-full" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">System Locked</h2>
                    <p className="text-[10px] opacity-60 uppercase tracking-[0.4em]">Integrated Flight Ops Terminal</p>
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
        <div className="h-[700px] flex flex-col space-y-4 p-4 bg-zinc-950 border-4 border-zinc-800 rounded-[2rem] font-mono text-[#00ff41] shadow-2xl relative overflow-hidden">
            {/* CRT Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />
            
            <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-[#00ff41]/20">
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-[#00ff41]/10 rounded-lg border border-[#00ff41]/20">
                        <Radio className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase italic leading-none">CDU-TRANSCEIVER</h2>
                        <p className="text-[8px] opacity-60 mt-1.5 uppercase tracking-widest">Protocol: TACTICAL_REST_v4.2</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 text-right">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[7px] opacity-40 uppercase">SIM LINK</span>
                        <span className={cn("text-[9px] font-bold", isConnected ? "text-primary" : "text-red-500")}>{isConnected ? 'CONNECTED' : 'OFFLINE'}</span>
                    </div>
                    <Badge className="bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/40 text-[9px] animate-pulse">TX/RX</Badge>
                </div>
            </div>

            <Tabs defaultValue="missions" className="flex-grow flex flex-col min-h-0">
                <TabsList className="bg-black/60 border border-[#00ff41]/10 p-1 shrink-0 h-12">
                    <TabsTrigger value="missions" className="flex-grow text-[10px] uppercase font-black data-[state=active]:bg-[#00ff41] data-[state=active]:text-black">Flights</TabsTrigger>
                    <TabsTrigger value="tactical" className="flex-grow text-[10px] uppercase font-black data-[state=active]:bg-[#00ff41] data-[state=active]:text-black">Tactical Map</TabsTrigger>
                    <TabsTrigger value="radio" className="flex-grow text-[10px] uppercase font-black data-[state=active]:bg-[#00ff41] data-[state=active]:text-black">Radio Comms</TabsTrigger>
                    <TabsTrigger value="console" className="flex-grow text-[10px] uppercase font-black data-[state=active]:bg-[#00ff41] data-[state=active]:text-black">Status</TabsTrigger>
                </TabsList>

                <div className="flex-grow mt-4 overflow-hidden flex flex-col border border-[#00ff41]/10 rounded-2xl bg-black/20">
                    <TabsContent value="missions" className="m-0 flex-grow overflow-y-auto p-4 space-y-3">
                        {isLoadingMissions ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="animate-spin w-8 h-8" />
                                <span className="text-[10px] uppercase tracking-widest">Polling Dispatch Center...</span>
                            </div>
                        ) : missions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-xs space-y-4">
                                <p>AWAITING_MISSION_ASSIGNMENT</p>
                                <Button onClick={loadMissions} variant="outline" className="bg-transparent border-[#00ff41]/20 text-[#00ff41] hover:bg-[#00ff41]/10 h-8 text-[9px]">
                                    <RefreshCw className="w-3 h-3 mr-2" /> RE-SYNC
                                </Button>
                            </div>
                        ) : (
                            missions.map((m: any) => (
                                <button 
                                    key={m.missionId} 
                                    onClick={() => setSelectedMission(m)}
                                    className={cn(
                                        "w-full text-left p-5 rounded-xl border-2 transition-all flex flex-col space-y-2",
                                        selectedMission?.missionId === m.missionId 
                                            ? "bg-[#00ff41]/10 border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.1)] scale-[1.02]" 
                                            : "bg-black/40 border-[#00ff41]/10 hover:border-[#00ff41]/40"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-black italic uppercase tracking-tight">{m.callsign}</p>
                                        <Badge className="bg-black text-[#00ff41] border-[#00ff41]/40 text-[8px] h-4 px-2">{m.mission_type}</Badge>
                                    </div>
                                    <div className="flex items-center space-x-2 text-[9px] opacity-70 font-bold uppercase">
                                        <Navigation className="w-3 h-3" />
                                        <span className="truncate max-w-[100px]">{m.origin.name}</span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span className="truncate max-w-[100px]">{m.destination.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-[8px] opacity-50 font-bold uppercase pt-1 border-t border-[#00ff41]/10 w-full">
                                        <span className="flex items-center"><Clock className="w-2 h-2 mr-1" /> ETE: {m.tracking.timeEnrouteMinutes} MIN</span>
                                        <span className="flex items-center"><Zap className="w-2 h-2 mr-1" /> ID: {m.missionId}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="tactical" className="m-0 flex-grow p-0 overflow-hidden">
                        {selectedMission ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                                <div className="lg:col-span-9 h-full">
                                    <SimulatorMapPanel mission={selectedMission as any} />
                                </div>
                                <div className="lg:col-span-3 p-4 space-y-4 overflow-y-auto">
                                    <Button 
                                        onClick={isSyncing ? stopSync : startSync}
                                        disabled={!isConnected}
                                        className={cn(
                                            "w-full h-12 text-sm font-black italic uppercase transition-all rounded-xl shadow-xl",
                                            isSyncing ? "bg-red-600 text-white animate-pulse" : "bg-[#00ff41] text-black"
                                        )}
                                    >
                                        {isSyncing ? 'DISCONNECT TELEMETRY' : 'ENGAGE TACTICAL LINK'}
                                    </Button>
                                    <div className="space-y-1">
                                        <p className="text-[8px] opacity-40 uppercase tracking-widest">Aircraft</p>
                                        <p className="text-sm font-bold">{selectedMission.helicopter.registration} ({selectedMission.helicopter.model})</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] opacity-40 uppercase tracking-widest">Route</p>
                                        <p className="text-sm font-bold">{selectedMission.origin.name} to {selectedMission.destination.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] opacity-40 uppercase tracking-widest">Patient</p>
                                        <p className="text-sm font-bold">{selectedMission.patientAge}Y {selectedMission.patientGender}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 italic space-y-4">
                                <Navigation className="w-16 h-16" />
                                <p className="text-sm">AWAITING_MISSION_DATA_LINK</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="radio" className="m-0 flex-grow flex flex-col overflow-hidden">
                        <SimulatorChat mission={selectedMission} />
                    </TabsContent>

                    <TabsContent value="console" className="m-0 flex-grow bg-black/40 p-6 font-mono text-[10px] text-[#00ff41] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-[#00ff41]/10 pb-3">
                            <div className="flex items-center space-x-3">
                                <Terminal className="w-4 h-4" />
                                <span className="uppercase font-black tracking-widest italic">Uplink Status</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <Input value={host} onChange={e => setHost(e.target.value)} placeholder="Host" className="h-8 text-xs bg-zinc-900/50 border-[#00ff41]/20" />
                            <Input value={port} onChange={e => setPort(e.target.value)} placeholder="Port" className="h-8 text-xs bg-zinc-900/50 border-[#00ff41]/20" />
                            <Button onClick={handleConnect} disabled={isConnecting} className="h-8 text-[9px] bg-[#00ff41]/20 text-[#00ff41] hover:bg-[#00ff41]/30">
                                {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Connect'}
                            </Button>
                        </div>
                        <ScrollArea className="flex-grow">
                            <div className="space-y-1.5 font-mono">
                                {consoleOutput.map((line, idx) => <p key={idx} className="opacity-80 break-all">{line}</p>)}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default SimulatorPluginUI;