"use client";

import { Apple, Monitor, Download, Zap, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const DesktopDownload = () => {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <Card className="border-4 border-primary/20 bg-primary/5 rounded-[3rem] overflow-hidden shadow-2xl group hover:border-primary/40 transition-all duration-500">
      <CardContent className="p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center space-x-8">
          <div className="p-6 bg-primary/10 rounded-[2rem] border-2 border-primary/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            {isMac ? <Apple className="w-12 h-12 text-primary" /> : <Monitor className="w-12 h-12 text-primary" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-primary">
              <Zap className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Standalone Bridge v5.3.0</span>
            </div>
            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              {isMac ? 'NATIVE MACOS CLIENT' : 'WINDOWS COMMAND CENTER'}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Free to Play | MSFS & X-Plane Data Link | System Tray Integration
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <Button asChild size="lg" className="h-16 px-12 text-xl font-black italic uppercase shadow-xl rounded-2xl w-full sm:w-auto">
             <Link to="/downloads">
                <Download className="w-6 h-6 mr-2" /> GET INSTALLER
             </Link>
          </Button>
          <Button asChild variant="outline" className="h-16 px-8 border-2 font-black italic uppercase tracking-widest rounded-2xl bg-background/50 hover:bg-primary/5">
             <Link to="/support">
                <Coffee className="w-5 h-5 mr-2 text-primary" /> SUPPORT DEV
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesktopDownload;