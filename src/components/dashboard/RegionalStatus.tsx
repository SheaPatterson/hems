"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, MapPin, Plane, ShieldCheck } from 'lucide-react';
import { useHemsData } from '@/hooks/useHemsData';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const RegionalStatus: React.FC = () => {
    const { hospitals, bases, helicopters, isLoading } = useHemsData();

    if (isLoading) return null;

    const traumaCount = hospitals.filter(h => h.isTraumaCenter).length;
    const activeHeli = helicopters.filter(h => h.maintenanceStatus === 'FMC').length;

    return (
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur shadow-xl">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-3">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Regional Asset Readiness
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center">
                            <Hospital className="w-3 h-3 mr-1" /> Trauma Hubs
                        </p>
                        <p className="text-2xl font-mono font-black italic">{traumaCount} / {hospitals.length}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center justify-end">
                            <Plane className="w-3 h-3 mr-1" /> FMC Fleet
                        </p>
                        <p className="text-2xl font-mono font-black italic text-green-600">{activeHeli} / {helicopters.length}</p>
                    </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Stations</p>
                    <div className="grid grid-cols-1 gap-2">
                        {bases.slice(0, 3).map(base => (
                            <div key={base.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-lg border border-border/50">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-bold uppercase italic">{base.name}</span>
                                </div>
                                <Badge className="bg-green-600 text-[8px] font-black h-4 px-1.5">OPEN</Badge>
                            </div>
                        ))}
                        <p className="text-[9px] text-center text-muted-foreground italic pt-1">+{bases.length - 3} additional nodes active</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RegionalStatus;