"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { 
    Activity, LogIn, LayoutDashboard, 
    MessageSquare, Database, Zap, Coffee, Server, Cpu, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/components/AuthGuard';
import { useHemsData } from '@/hooks/useHemsData';
import { useActiveMissions } from '@/hooks/useMissions';
import TacticalMap from '@/components/maps/TacticalMap';
import ClientOnly from '@/components/ClientOnly';
import { Separator } from '@/components/ui/separator';
import BrandedFooter from '@/components/BrandedFooter';
import { azureClient } from '@/integrations/azure/client';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <Card className="flex flex-col items-start text-left p-8 h-full border-primary/10 hover:border-primary/40 transition-all hover:shadow-2xl bg-card/50 backdrop-blur-md group">
        <div className="text-primary mb-6 p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <CardTitle className="text-xl mb-4 font-black uppercase tracking-tighter italic">{title}</CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            {description}
        </p>
    </Card>
);

const Index = () => {
    const { user } = useAuth();
    const { bases } = useHemsData();
    const { data: activeMissions } = useActiveMissions();
    
    const videoUrl = azureClient.storage.getPublicUrl('operational-assets', 'assets/1766281947169-uq0mpp.mp4');

    return (
        <div className="bg-background min-h-screen selection:bg-primary/30 font-sans overflow-x-hidden flex flex-col">
            {/* Hero Section */}
            <div className="container mx-auto px-4 pt-24 pb-16 relative text-center flex-grow">
                <header className="space-y-10 relative z-10">
                    <div className="flex justify-center">
                        <div className="p-2 bg-primary/5 rounded-[3rem] shadow-[0_0_50px_rgba(255,165,0,0.1)] border border-primary/20 relative group">
                            <img 
                                src="/logo-main.png" 
                                alt="HEMS Simulation Logo" 
                                className="w-48 h-48 md:w-64 md:h-64 object-contain transition-all duration-1000 group-hover:scale-105" 
                            />
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest border-4 border-background whitespace-nowrap">
                                Standalone Environment v5.3.0
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="inline-flex items-center space-x-3 text-primary bg-primary/5 px-6 py-2 rounded-full border border-primary/10">
                            <Activity className="w-4 h-4 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Global HEMS Data Link</span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-foreground italic uppercase leading-[0.8] mb-4">
                            HEMS <span className="text-primary text-shadow-primary">OPS-CENTER</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-tight opacity-80">
                            The ultimate standalone bridge for MSFS and X-Plane. Professional mission coordination for every simulation pilot.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                        {!user ? (
                            <Button asChild size="lg" className="text-lg h-16 px-14 shadow-2xl hover:shadow-primary/20 transition-all hover:scale-105 bg-primary text-primary-foreground font-black italic rounded-2xl">
                                <Link to="/login">
                                    <LogIn className="w-5 h-5 mr-2" /> Start Your Tour of Duty
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild size="lg" className="text-lg h-16 px-14 shadow-2xl hover:shadow-primary/20 transition-all hover:scale-105 bg-primary text-primary-foreground font-black italic rounded-2xl">
                                <Link to="/dashboard">
                                    <LayoutDashboard className="w-5 h-5 mr-2" /> Access Command Center
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="outline" size="lg" className="text-lg h-16 px-14 border-2 font-black italic rounded-2xl bg-background/50 backdrop-blur-sm">
                            <Link to="/documentation">
                                <Cpu className="w-5 h-5 mr-2 text-primary" /> Technical Manual
                            </Link>
                        </Button>
                    </div>

                    {/* Simulator Compatibility Row */}
                    <div className="pt-16 pb-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-8 italic">Universal Simulator Uplink</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity duration-700">
                            <img src="/logos/msfs2024.png" alt="MSFS 2024" className="h-8 md:h-12 object-contain grayscale hover:grayscale-0 transition-all" />
                            <img src="/logos/msfs2020.png" alt="MSFS 2020" className="h-6 md:h-10 object-contain grayscale hover:grayscale-0 transition-all" />
                            <img src="/logos/xp12.png" alt="X-Plane 12" className="h-8 md:h-12 object-contain grayscale hover:grayscale-0 transition-all" />
                            <img src="/logos/xp11.png" alt="X-Plane 11" className="h-6 md:h-10 object-contain grayscale hover:grayscale-0 transition-all" />
                        </div>
                    </div>
                </header>
            </div>

            {/* Live Map Preview */}
            <section className="container mx-auto px-4 py-16">
                <div className="space-y-6 mb-12 text-center">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">THEATER <span className="text-primary">OVERWATCH</span></h2>
                </div>
                <Card className="overflow-hidden border-4 border-primary/20 rounded-[3rem] shadow-2xl bg-black relative">
                    <div className="h-[600px] w-full relative">
                        <ClientOnly>
                            <TacticalMap missions={activeMissions || []} bases={bases} />
                        </ClientOnly>
                    </div>
                </Card>
            </section>

            {/* Feature Showcase */}
            <section className="container mx-auto px-4 py-24 border-y border-border/50 bg-muted/10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-5xl font-black italic uppercase leading-[0.9] tracking-tighter">
                            EVERYTHING IS NOW <br />
                            <span className="text-primary">FREE TO PLAY</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FeatureCard
                                icon={<Zap className="w-8 h-8" />}
                                title="Mission Dispatch"
                                description="Advanced planner for scene calls and transfers. No subscription required."
                            />
                            <FeatureCard
                                icon={<Activity className="w-8 h-8" />}
                                title="Global Tracker"
                                description="Your aircraft position streamed to our theater command in real-time."
                            />
                        </div>
                    </div>
                    <div className="aspect-video rounded-[3rem] overflow-hidden border-2 border-primary/20 shadow-2xl bg-black">
                        <video src={videoUrl} controls autoPlay muted playsInline loop className="w-full h-full object-cover grayscale-[0.3]" />
                    </div>
                </div>
            </section>

            {/* Behind the Mission / Support Section */}
            <section className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-4 border-primary/20 bg-card rounded-[3rem] overflow-hidden shadow-2xl">
                        <div className="grid md:grid-cols-12">
                            <div className="md:col-span-4 bg-primary p-12 flex flex-col items-center justify-center text-primary-foreground">
                                <Coffee className="w-20 h-20 mb-4" />
                                <h3 className="text-2xl font-black italic uppercase text-center leading-tight">Support The Project</h3>
                            </div>
                            <div className="md:col-span-8 p-12 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-2xl font-black italic uppercase tracking-tighter">Behind the Scenes</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        HEMS OPS-CENTER is a passion project built to enhance simulation for everyone. While the system is <strong>free</strong>, maintaining the global infrastructure involves significant ongoing costs:
                                    </p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <li className="flex items-center text-xs font-bold text-foreground">
                                            <Server className="w-4 h-4 mr-2 text-primary" /> Global Telemetry Relay
                                        </li>
                                        <li className="flex items-center text-xs font-bold text-foreground">
                                            <MessageSquare className="w-4 h-4 mr-2 text-primary" /> AI Dispatch Processing
                                        </li>
                                        <li className="flex items-center text-xs font-bold text-foreground">
                                            <Database className="w-4 h-4 mr-2 text-primary" /> Large Scenery Hosting
                                        </li>
                                        <li className="flex items-center text-xs font-bold text-foreground">
                                            <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Standalone Security
                                        </li>
                                    </ul>
                                </div>
                                <Separator />
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <p className="text-xs italic text-muted-foreground">If you enjoy the software, consider buying us a coffee.</p>
                                    <a href="https://www.buymeacoffee.com/sheapatterson" target="_blank" rel="noreferrer" className="shrink-0 transition-transform hover:scale-105">
                                        <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=sheapatterson&button_colour=ff8500&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=FFDD00" alt="Buy Me A Coffee" className="h-12 shadow-xl" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            <BrandedFooter />
        </div>
    );
};

export default Index;