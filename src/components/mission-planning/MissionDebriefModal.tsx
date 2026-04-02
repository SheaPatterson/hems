"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, ClipboardCheck, Loader2, Trophy, Zap, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { callTacticalAnalyst } from '@/integrations/dispatch/api';
import { MissionReport } from '@/data/hemsData';

interface MissionDebriefModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    report: MissionReport;
    onConfirm: (notes: string, score: number, summary: any) => Promise<void>;
}

const MissionDebriefModal: React.FC<MissionDebriefModalProps> = ({ open, onOpenChange, report, onConfirm }) => {
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<any>(null);

    const handleFinalize = async () => {
        if (!notes.trim()) {
            toast.error("Required: Please provide a mission narrative.");
            return;
        }

        setIsAnalyzing(true);
        const audit = await callTacticalAnalyst('REVIEW_FLIGHT', {
            tracking: report.tracking,
            notes: notes,
            helicopter: report.helicopter.registration
        });

        if (audit) {
            setAiFeedback(audit);
            setIsAnalyzing(false);
            setIsSubmitting(true);
            
            // Short delay to show the AI's calculation before closing
            setTimeout(async () => {
                await onConfirm(notes, audit.score, { 
                    fuel_efficiency: audit.efficiencyRating,
                    ai_critique: audit.criticalCritique
                });
                onOpenChange(false);
                setIsSubmitting(false);
            }, 3000);
        } else {
            toast.error("AI Audit link failed. Using manual override.");
            await onConfirm(notes, 100, { fuel_efficiency: "MANUAL_BYPASS" });
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] border-t-8 border-primary">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter flex items-center">
                        <ClipboardCheck className="w-8 h-8 mr-3 text-primary" /> After Action Review (AAR)
                    </DialogTitle>
                    <DialogDescription className="text-base font-medium">
                        Log final mission narrative for the AI Tactical Audit.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center">
                                <FileText className="w-3 h-3 mr-1" /> Tactical Narrative
                            </Label>
                            <Textarea 
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Detail environmental hazards, technical snags, or clinical highlights..."
                                rows={8}
                                className="rounded-2xl border-2 focus-visible:ring-primary text-sm leading-relaxed bg-muted/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-[2rem] shadow-inner text-center relative overflow-hidden">
                            {(isAnalyzing || isSubmitting) && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Neural Analysis Active...</p>
                                </div>
                            )}
                            <Trophy className="w-10 h-10 text-primary mx-auto mb-2" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-primary/80">Flight Performance</h4>
                            <p className="text-5xl font-mono font-black italic text-primary">
                                {aiFeedback ? `${aiFeedback.score}%` : '--%'}
                            </p>
                            {aiFeedback && (
                                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-4 italic font-bold">
                                    {aiFeedback.criticalCritique}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                                <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground leading-tight">
                                    <strong>AI Performance Audit:</strong> The Tactical Analyst evaluates your fuel efficiency, phase timing, and narrative clarity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isAnalyzing || isSubmitting} className="font-bold">ABORT</Button>
                    <Button 
                        onClick={handleFinalize} 
                        disabled={isAnalyzing || isSubmitting || !notes.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black italic uppercase shadow-xl h-14 px-12 rounded-2xl text-lg transition-transform hover:scale-105"
                    >
                        {isAnalyzing || isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Activity className="w-5 h-5 mr-2" />}
                        INITIALIZE AUDIT
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MissionDebriefModal;