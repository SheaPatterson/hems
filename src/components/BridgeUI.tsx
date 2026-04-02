"use client";

import React from 'react';
import DesktopHeader from '@/components/DesktopHeader';
import LocalBridgeDisplay from '@/pages/LocalBridgeDisplay';
import { cn } from '@/lib/utils';

const BridgeUI: React.FC = () => {
  return (
    <div className={cn(
        "min-h-screen flex flex-col bg-zinc-950 text-white font-sans",
        // Apply drag region styles globally for the Electron app
        (window as any).electron ? 'drag-region' : ''
    )}>
        <DesktopHeader />
        <main className="flex-grow p-4">
            <LocalBridgeDisplay />
        </main>
        
        <style>{`
            .drag-region { -webkit-app-region: drag; }
            .no-drag { -webkit-app-region: no-drag; }
        `}</style>
    </div>
  );
};

export default BridgeUI;