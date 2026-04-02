"use client";

import { useEffect, useState } from 'react';
import { Minus, Square, X, DownloadCloud, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DesktopHeader = () => {
  const [updateReady, setUpdateReady] = useState(false);
  const isDesktop = !!(window as any).electron;

  useEffect(() => {
    if (!isDesktop) return;

    (window as any).electron.receive('update_available', () => {
      toast.info("A tactical update is available and downloading...", { duration: 5000 });
    });

    (window as any).electron.receive('update_downloaded', () => {
      setUpdateReady(true);
      toast.success("Update Ready. Click the cloud to restart.", { duration: 10000 });
    });
  }, [isDesktop]);

  if (!isDesktop) return null;

  const handleAction = (action: string) => {
    (window as any).electron.send(action);
  };

  return (
    <div className="h-10 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-4 select-none drag-region">
      <div className="flex items-center space-x-3 no-drag">
        <Zap className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">
          HEMS Tactical Bridge <span className="text-primary/50 ml-2">v5.2.0</span>
        </span>
      </div>

      <div className="flex items-center space-x-1 no-drag">
        {updateReady && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleAction('restart_app')}
            className="h-8 w-8 text-green-500 hover:bg-green-500/10"
          >
            <DownloadCloud className="w-4 h-4" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleAction('window-minimize')}
          className="h-8 w-8 hover:bg-white/10"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleAction('window-maximize')}
          className="h-8 w-8 hover:bg-white/10"
        >
          <Square className="w-3 h-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleAction('window-close')}
          className="h-8 w-8 hover:bg-red-500/20 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <style>{`
        .drag-region { -webkit-app-region: drag; }
        .no-drag { -webkit-app-region: no-drag; }
      `}</style>
    </div>
  );
};

export default DesktopHeader;