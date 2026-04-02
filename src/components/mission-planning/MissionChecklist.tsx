"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { HEMS_CHECKLISTS } from '@/data/checklists';
import { ClipboardCheck, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const MissionChecklistComponent: React.FC = () => {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const toggleItem = (id: string) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const allItems = HEMS_CHECKLISTS.flatMap(c => c.items);
    const completedCount = allItems.filter(i => checkedItems[i.id]).length;
    const progress = (completedCount / allItems.length) * 100;

    return (
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur shadow-2xl h-full flex flex-col overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center">
                        <ClipboardCheck className="w-4 h-4 mr-2" /> Tactical SOP Checklist
                    </CardTitle>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">{completedCount}/{allItems.length}</span>
                </div>
                <Progress value={progress} className="h-1 mt-3 bg-primary/10" />
            </CardHeader>
            <CardContent className="flex-grow p-0 overflow-y-auto">
                <div className="p-4 space-y-8">
                    {HEMS_CHECKLISTS.map((section) => (
                        <div key={section.phase} className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center">
                                <Activity className="w-3 h-3 mr-2" /> {section.phase}
                            </h4>
                            <div className="space-y-2">
                                {section.items.map((item) => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => toggleItem(item.id)}
                                        className={cn(
                                            "flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer group",
                                            checkedItems[item.id] 
                                                ? "bg-green-600/10 border-green-600/30 opacity-60" 
                                                : "bg-muted/30 border-border/50 hover:border-primary/40 hover:bg-muted/50"
                                        )}
                                    >
                                        <Checkbox 
                                            id={item.id} 
                                            checked={checkedItems[item.id]} 
                                            onCheckedChange={() => toggleItem(item.id)}
                                            className="mt-0.5 border-2 data-[state=checked]:bg-green-600"
                                        />
                                        <div className="space-y-1">
                                            <Label className={cn(
                                                "text-xs font-bold leading-none cursor-pointer uppercase tracking-tight",
                                                checkedItems[item.id] ? "line-through text-muted-foreground" : "text-foreground"
                                            )}>
                                                {item.label}
                                            </Label>
                                            {item.description && (
                                                <p className="text-[9px] text-muted-foreground leading-tight italic">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <div className="p-4 bg-muted/20 border-t border-border/50 text-center">
                <div className="inline-flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Safety Standard v4.2 Compliance</span>
                </div>
            </div>
        </Card>
    );
};

export default MissionChecklistComponent;