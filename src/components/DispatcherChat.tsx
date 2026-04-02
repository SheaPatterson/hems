import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Mic, Activity, Radio, Volume2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MissionReport as IMissionReport } from '@/data/hemsData';
import { sendCrewMessageToAgent, fetchDispatchAudio } from '@/integrations/dispatch/api';
import { useMissionLogs } from '@/hooks/useMissionLogs';
import { Badge } from '@/components/ui/badge';
import { azureClient } from '@/integrations/azure/client';

interface DispatcherChatProps {
    missionReport: IMissionReport | null;
}

// Audio assets for immersion
const staticAudio = new Audio(azureClient.storage.getPublicUrl('operational-assets', 'assets/radio_static.mp3')); 
staticAudio.volume = 0.2;

const DispatcherChat: React.FC<DispatcherChatProps> = ({ missionReport }) => {
    const { logs, addLog } = useMissionLogs(missionReport?.missionId);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTransmitting, setIsTransmitting] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playAudioFromUrl = (url: string) => {
        setIsTransmitting(true);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = url;
        } else {
            audioRef.current = new Audio(url);
        }

        // Play intro squelch
        staticAudio.currentTime = 0;
        staticAudio.play();

        audioRef.current.onloadeddata = () => {
            // Cut static slightly after voice starts
            setTimeout(() => staticAudio.pause(), 400); 
            audioRef.current?.play();
        };

        audioRef.current.onended = () => {
            // Outro squelch
            staticAudio.currentTime = 0;
            staticAudio.play();
            setTimeout(() => {
                staticAudio.pause();
                setIsTransmitting(false);
            }, 600);
        };
    };

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript.toUpperCase());
                setIsListening(false);
                handleSend(transcript.toUpperCase());
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const handlePTT = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const handleSend = async (manualText?: string) => {
        if (!missionReport) return;
        const text = manualText || input.trim();
        if (text === '') return;

        const callsign = missionReport.callsign || "HEMS UNIT";
        await addLog('Crew', text, callsign);
        setInput('');
        setIsProcessing(true);

        // Call the Gemini Dispatch Agent
        const response = await sendCrewMessageToAgent(missionReport.missionId, text);
        
        setIsProcessing(false);
        if (response) {
            await addLog('Dispatcher', response.responseText);
            // Fetch and play TTS audio
            const audioUrl = await fetchDispatchAudio(response.responseText);
            if (audioUrl) playAudioFromUrl(audioUrl);
        }
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [logs, isProcessing, isTransmitting]);

    if (!missionReport) return null;

    return (
        <Card className="h-full flex flex-col border-2 border-primary/20 bg-[#020202] text-[#00ff41] font-mono shadow-2xl overflow-hidden relative">
            <CardHeader className="p-3 border-b border-[#00ff41]/20 bg-black/60 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <CardTitle className="text-[10px] tracking-[0.2em] uppercase font-black italic flex items-center">
                            <Radio className="w-3 h-3 mr-2 text-primary" /> COMSAT_UPLINK_v5.2
                        </CardTitle>
                        <div className="flex items-center space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={cn("w-1 h-2 rounded-full bg-[#00ff41]/20", i <= 4 && "bg-primary animate-pulse")} />
                            ))}
                            <span className="text-[7px] font-bold opacity-40 ml-2">SIGNAL: NOMINAL</span>
                        </div>
                    </div>
                    <Badge className={cn("bg-black border-[#00ff41]/40 text-[#00ff41] text-[9px] h-5 uppercase font-mono", isTransmitting && "border-primary text-primary animate-pulse")}>
                        {isTransmitting ? 'RX_TRANSMIT' : 'IDLE_MONITOR'}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="flex-1 min-h-0 p-0 relative">
                <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
                <ScrollArea className="h-full w-full absolute inset-0" ref={scrollAreaRef}>
                    <div className="p-4 space-y-5">
                        {logs.map((msg) => (
                            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex justify-between items-center text-[7px] mb-1 opacity-50 font-black">
                                    <span>{msg.sender === 'Crew' ? (msg.callsign || 'PILOT') : msg.sender}</span>
                                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}Z</span>
                                </div>
                                <div className={cn(
                                    "p-2.5 rounded border-l-4 text-xs leading-relaxed",
                                    msg.sender === 'Dispatcher' ? "bg-[#00ff41]/5 border-[#00ff41]" : 
                                    msg.sender === 'System' ? "bg-primary/5 border-primary text-primary" : "bg-white/5 border-white/20 text-white/90"
                                )}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        {(isProcessing || isTransmitting) && (
                            <div className="flex items-center space-x-3 p-2 bg-[#00ff41]/5 rounded-lg border border-[#00ff41]/10">
                                <Activity className="w-4 h-4 text-[#00ff41] animate-pulse" />
                                <div className="flex space-x-1 h-3 items-center">
                                    {[1,2,3,4,5,6].map(i => (
                                        <div key={i} className="w-0.5 bg-[#00ff41] animate-[bounce_1s_infinite]" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#00ff41]/60">VOICE_SYNTH_ACTIVE</span>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
            </CardContent>

            <CardFooter className="p-4 border-t border-[#00ff41]/10 bg-black flex flex-col gap-4">
                <div className="flex items-center justify-between w-full h-8 px-2 bg-[#00ff41]/5 rounded border border-[#00ff41]/10">
                    <Volume2 className="w-3 h-3 text-[#00ff41]/40" />
                    <div className="flex items-center space-x-0.5 flex-grow px-4 h-full">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "w-px bg-[#00ff41] transition-all duration-300", 
                                    isTransmitting ? "opacity-100 h-full animate-pulse" : "opacity-10 h-1"
                                )} 
                                style={{ height: isTransmitting ? `${Math.random() * 80 + 20}%` : '4px' }}
                            />
                        ))}
                    </div>
                    <span className="text-[7px] font-mono opacity-40">123.025 MHz</span>
                </div>

                <div className="flex flex-col gap-3">
                    <Button 
                        onMouseDown={handlePTT}
                        onMouseUp={handlePTT}
                        className={cn(
                            "h-14 font-black italic uppercase transition-all rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                            isListening ? "bg-red-600 text-white animate-pulse" : "bg-primary text-black hover:bg-primary/90"
                        )}
                    >
                        <Mic className="w-5 h-5 mr-2" /> {isListening ? 'VOICE_TX_ACTIVE...' : 'PUSH TO TALK'}
                    </Button>
                    <div className="flex w-full space-x-2">
                        <Input
                            placeholder="INPUT_TAC_CMD..."
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="bg-zinc-950 border-[#00ff41]/20 text-[#00ff41] h-10 text-[10px] placeholder:text-[#00ff41]/10 focus-visible:ring-[#00ff41]/40"
                        />
                        <Button onClick={() => handleSend()} size="sm" className="bg-[#00ff41] text-black h-10 px-4 hover:bg-[#00cc33]">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

export default DispatcherChat;