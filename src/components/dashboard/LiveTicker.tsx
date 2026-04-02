"use client";

import React from 'react';
import { useMissionLogs } from '@/hooks/useMissionLogs';
import { Radio, Activity } from 'lucide-react';

const LiveTicker: React.FC = () => {
    const { logs, isLoading } = useMissionLogs(undefined, true);
    
    // Get last 5 logs for the ticker
    const recentLogs = logs.slice(-5).reverse();

    if (isLoading || recentLogs.length === 0) {
        return (
            <div className="w-full bg-black/90 border-y border-primary/20 h-10 flex items-center px-4 overflow-hidden">
                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary/40 animate-pulse">
                    <Activity className="w-3 h-3" />
                    <span>Synchronizing regional data link... scanning frequencies...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-black/90 border-y border-primary/30 h-10 flex items-center overflow-hidden shadow-[0_0_20px_rgba(255,165,0,0.1)] relative z-20">
            <div className="bg-primary text-black px-4 h-full flex items-center shrink-0 z-10 skew-x-[-15deg] -ml-2">
                <div className="skew-x-[15deg] flex items-center space-x-2 font-black italic uppercase text-[10px] tracking-tighter">
                    <Radio className="w-3 h-3" />
                    <span>Live Dispatch</span>
                </div>
            </div>
            
            <div className="flex-grow flex items-center whitespace-nowrap animate-in fade-in duration-1000">
                <div className="flex space-x-12 px-6 animate-[ticker_30s_linear_infinite]">
                    {recentLogs.map((log) => (
                        <div key={log.id} className="flex items-center space-x-3">
                            <span className="text-[9px] font-black text-primary font-mono">
                                [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}Z]
                            </span>
                            <span className="text-[10px] font-black uppercase text-white tracking-tight">
                                {log.sender === 'Crew' ? (log.callsign || 'UNIT') : 'DISPATCH'}:
                            </span>
                            <span className="text-[10px] font-mono font-medium text-white/70 italic">
                                {log.message}
                            </span>
                        </div>
                    ))}
                    {/* Repeat for seamless scroll */}
                    {recentLogs.map((log) => (
                        <div key={`${log.id}-dup`} className="flex items-center space-x-3">
                            <span className="text-[9px] font-black text-primary font-mono">
                                [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}Z]
                            </span>
                            <span className="text-[10px] font-black uppercase text-white tracking-tight">
                                {log.sender === 'Crew' ? (log.callsign || 'UNIT') : 'DISPATCH'}:
                            </span>
                            <span className="text-[10px] font-mono font-medium text-white/70 italic">
                                {log.message}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}} />
        </div>
    );
};

export default LiveTicker;