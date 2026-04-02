import React from 'react';
import { useNotams } from '@/hooks/useNotams';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Megaphone, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotamBanner: React.FC = () => {
  const { notams } = useNotams();

  if (notams.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {notams.map((notam) => (
        <Alert 
            key={notam.id} 
            className={cn(
                "border-l-4 shadow-md transition-all animate-in slide-in-from-top-2",
                notam.severity === 'critical' ? "bg-red-500/10 border-red-600" : 
                notam.severity === 'warning' ? "bg-amber-500/10 border-amber-600" : 
                "bg-blue-500/10 border-blue-600"
            )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
                {notam.severity === 'critical' ? <AlertTriangle className="h-5 w-5 text-red-600" /> : 
                 notam.severity === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : 
                 <Info className="h-5 w-5 text-blue-600" />}
                <div>
                    <AlertTitle className="text-xs font-black uppercase tracking-widest flex items-center">
                        <Megaphone className="w-3 h-3 mr-1" /> SYSTEM NOTAM: {notam.title}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-medium leading-tight">
                        {notam.message}
                    </AlertDescription>
                </div>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default NotamBanner;