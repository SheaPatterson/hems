import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { signalrManager, ConnectionStatus } from '@/integrations/azure/realtime';
import { cn } from '@/lib/utils';

const ConnectionStatusBanner: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(signalrManager.connectionStatus);

  useEffect(() => {
    const unsubscribe = signalrManager.onConnectionStatus(setStatus);
    return unsubscribe;
  }, []);

  const isVisible = status === 'disconnected' || status === 'reconnecting';

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-600/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300',
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>
        {status === 'reconnecting'
          ? 'Connection lost — reconnecting…'
          : 'Connection lost — waiting to reconnect'}
      </span>
    </div>
  );
};

export default ConnectionStatusBanner;
