import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Volume2, Globe, Send } from 'lucide-react';
import { useMissionLogs } from '@/hooks/useMissionLogs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const GlobalRadioFeed = () => {
    const { logs, isLoading, addLog } = useMissionLogs(undefined, true);
    const [input, setInput] = useState('');
    const [isTransmitting, setIsTransmitting] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [logs]);

    const handleSend = async () => {
        if (!input.trim() || isTransmitting) return;
        
        setIsTransmitting(true);
        try {
            await addLog('Crew', input.trim().toUpperCase(), 'UNIT');
            setInput('');
        } catch (e) {
            toast.error("Transmission failed.");
        } finally {
            setIsTransmitting(false);
        }
    };

    return (
        <Card className="h-[450px] flex flex-col border-2 border-primary/20 bg-black/95 text-[#00ff41] font-mono shadow-2xl overflow-hidden">
            <CardHeader className="p-3 border-b border-[#00ff41]/20 bg-zinc-900/50 shrink-0">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-primary" /> REGIONAL TACTICAL FREQ
                    </CardTitle>
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
                        <span className="text-[8px] font-bold uppercase">Active</span>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="flex-1 min-h-0 p-0 relative">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full opacity-50">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-[10px] uppercase">Syncing...</span>
                    </div>
                ) : (
                    <ScrollArea className="h-full w-full absolute inset-0" ref={scrollAreaRef}>
                        <div className="p-4 space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="animate-in fade-in slide-in-from-bottom-1 duration-500">
                                    <div className="flex items-baseline space-x-2 mb-1">
                                        <span className={cn(
                                            "text-[8px] font-black px-1.5 py-0.5 rounded italic",
                                            log.sender === 'Dispatcher' ? "bg-[#00ff41] text-black" : "bg-zinc-800 text-[#00ff41]"
                                        )}>
                                            {log.sender === 'Crew' ? (log.callsign || 'UNIT') : 'DISPATCH'}
                                        </span>
                                        <span className="text-[7px] opacity-40">
                                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}Z
                                        </span>
                                    </div>
                                    <p className="text-[11px] leading-tight pl-2 border-l-2 border-[#00ff41]/20">
                                        {log.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>

            <CardFooter className="p-3 border-t border-[#00ff41]/10 bg-black flex flex-col gap-2">
                <div className="flex w-full space-x-2">
                    <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="BROADCAST CMD..."
                        className="h-8 bg-zinc-900 border-[#00ff41]/30 text-[#00ff41] text-[10px] placeholder:opacity-20"
                    />
                    <Button 
                        onClick={handleSend} 
                        size="icon" 
                        className="h-8 w-8 bg-[#00ff41] text-black hover:bg-[#00cc33]"
                        disabled={isTransmitting}
                    >
                        {isTransmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
                <div className="flex items-center justify-center text-[7px] font-black uppercase opacity-40 tracking-widest">
                    <Volume2 className="w-3 h-3 mr-1" /> Monitoring Sector 4 (Pittsburgh)
                </div>
            </CardFooter>
        </Card>
    );
};

export default GlobalRadioFeed;