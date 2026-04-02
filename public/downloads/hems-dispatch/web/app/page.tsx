"use client";

import { useState, useEffect } from 'react';
import { Shield, MapPin, Zap, Fuel, Clock, Navigation } from 'lucide-react';
import { TelemetryData, BridgeStatus } from '../../core/models';

export default function TacticalDisplay() {
    const [data, setData] = useState<{ telemetry: TelemetryData | null; status: BridgeStatus | null }>({
        telemetry: null,
        status: null
    });

    // Poll the local Bridge Server
    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/status');
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error("Bridge connection lost");
            }
        };
        const interval = setInterval(poll, 1000);
        return () => clearInterval(interval);
    }, []);

    const t = data.telemetry;
    const s = data.status;

    return (
        <div className="min-h-screen bg-black text-[#00ff41] font-mono p-6 flex flex-col space-y-6">
            {/* Header / Status Bar */}
            <header className="flex justify-between items-center border-b border-[#00ff41]/30 pb-4">
                <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-orange-500" />
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase">HEMS Tactical Bridge</h1>
                        <p className="text-[8px] opacity-60 tracking-[0.4em]">Integrated Flight Ops v5.2</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6 text-[10px] font-bold">
                    <StatusIndicator label="SIM_LINK" active={s?.simConnected} />
                    <StatusIndicator label="CLOUD_SYNC" active={true} />
                </div>
            </header>

            {/* Main HUD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                {/* Left: Nav Data */}
                <div className="space-y-4 border-r border-[#00ff41]/10 pr-6">
                    <Metric label="ALTITUDE" value={t?.altitudeFt || "---"} unit="FT" icon={Navigation} />
                    <Metric label="GROUND_SPD" value={t?.groundSpeedKts || "---"} unit="KTS" icon={Zap} />
                    <Metric label="HEADING" value={t?.headingDeg || "---"} unit="DEG" icon={Navigation} />
                </div>

                {/* Center: Mission Focus */}
                <div className="flex flex-col items-center justify-center space-y-8 bg-zinc-900/50 rounded-[3rem] border border-[#00ff41]/10">
                    <div className="text-center">
                        <p className="text-[10px] opacity-40 uppercase tracking-widest mb-2">Active Target Node</p>
                        <h2 className="text-4xl font-black italic text-white">RECON_PENDING</h2>
                        <div className="flex items-center justify-center space-x-2 mt-4">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Lat: {t?.latitude.toFixed(4) || "0.0000"}</span>
                        </div>
                    </div>
                    <div className="w-48 h-1 bg-[#00ff41]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00ff41] w-1/3 animate-pulse" />
                    </div>
                </div>

                {/* Right: Logistics */}
                <div className="space-y-4 border-l border-[#00ff41]/10 pl-6">
                    <Metric label="FUEL_STATE" value={t?.fuelRemainingLbs || "---"} unit="LB" icon={Fuel} alert={(t?.fuelRemainingLbs || 1000) < 300} />
                    <Metric label="AIR_TIME" value="0" unit="MIN" icon={Clock} />
                    <div className="p-4 bg-[#00ff41]/5 rounded-2xl border border-[#00ff41]/20">
                        <p className="text-[9px] font-black uppercase mb-2">Comms Log</p>
                        <div className="space-y-2 opacity-60 italic text-[10px]">
                            <p>DISPATCH: Cleared for takeoff...</p>
                            <p>UNIT: Lifting from base...</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / CRT Effect */}
            <footer className="h-4 bg-[#00ff41]/5 rounded flex items-center px-4 justify-between text-[8px] opacity-40">
                <span>LOCAL_HANDSHAKE: OK</span>
                <span>PACKET_ID: {t?.timestamp || "000000000"}</span>
            </footer>
        </div>
    );
}

function Metric({ label, value, unit, icon: Icon, alert = false }: any) {
    return (
        <div className={`p-4 rounded-2xl border transition-all ${alert ? 'bg-red-500/10 border-red-500 animate-pulse' : 'bg-black/40 border-[#00ff41]/10'}`}>
            <div className="flex items-center space-x-2 opacity-40 mb-1">
                <Icon className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className={`text-3xl font-black italic leading-none ${alert ? 'text-red-500' : 'text-white'}`}>
                {value} <span className="text-xs font-sans not-italic opacity-40">{unit}</span>
            </p>
        </div>
    );
}

function StatusIndicator({ label, active }: any) {
    return (
        <div className="flex items-center space-x-2">
            <span className="opacity-40">{label}</span>
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#00ff41] shadow-[0_0_8px_#00ff41]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
        </div>
    );
}