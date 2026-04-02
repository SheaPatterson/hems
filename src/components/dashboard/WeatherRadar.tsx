import React from 'react';

/**
 * SIMULATED NEXRAD RADAR OVERLAY
 * Uses CSS animations to mimic rotating sweep and precipitation cells.
 */
const WeatherRadarOverlay: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden opacity-30 mix-blend-screen">
            {/* Precipitation Cells */}
            <div className="absolute top-[20%] left-[60%] w-32 h-24 bg-green-500/30 blur-3xl animate-pulse" />
            <div className="absolute top-[22%] left-[62%] w-16 h-12 bg-yellow-500/40 blur-2xl" />
            <div className="absolute top-[24%] left-[63%] w-8 h-6 bg-red-600/50 blur-xl" />

            <div className="absolute top-[70%] left-[30%] w-48 h-32 bg-green-500/20 blur-[100px] animate-[bounce_15s_infinite]" />
            
            {/* Radar Sweep Effect (Conic Gradient) */}
            <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,65,0.05)_350deg,rgba(0,255,65,0.15)_360deg)] animate-[spin_6s_linear_infinite]" />
            
            {/* HUD CRT Scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,255,65,0.05)_50%,transparent_100%)] bg-[length:100%_8px] animate-[scan_10s_linear_infinite]" />
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}} />
        </div>
    );
};

export default WeatherRadarOverlay;