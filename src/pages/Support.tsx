"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coffee, Heart, HeartPulse, Zap, ShieldCheck, Globe } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const Support = () => {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-12 max-w-5xl">
            <PageHeader 
                title="Support the Mission"
                description="HEMS OPS-CENTER is now free for everyone. Support our development via Buy Me a Coffee."
                icon={Coffee}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Everything is <span className="text-primary">Free</span></h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We believe that high-quality tactical simulation tools should be accessible to the entire HEMS community. 
                            We have removed all subscription paywalls. You now have full access to the Mission Dispatcher, 
                            Live Flight Following, and AI Tactical Controller.
                        </p>
                    </section>

                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-2xl border flex flex-col items-center text-center space-y-2">
                            <Zap className="w-6 h-6 text-primary" />
                            <p className="text-xs font-black uppercase tracking-widest leading-none">Mission Planning</p>
                            <p className="text-[10px] text-muted-foreground">Unlimited Dispatch</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-2xl border flex flex-col items-center text-center space-y-2">
                            <Globe className="w-6 h-6 text-primary" />
                            <p className="text-xs font-black uppercase tracking-widest leading-none">Live Tracking</p>
                            <p className="text-[10px] text-muted-foreground">Global Telemetry</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-2xl border flex flex-col items-center text-center space-y-2">
                            <HeartPulse className="w-6 h-6 text-primary" />
                            <p className="text-xs font-black uppercase tracking-widest leading-none">AI Comms</p>
                            <p className="text-[10px] text-muted-foreground">Contextual Radio</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-2xl border flex flex-col items-center text-center space-y-2">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <p className="text-xs font-black uppercase tracking-widest leading-none">Scenery Library</p>
                            <p className="text-[10px] text-muted-foreground">Full Access</p>
                        </div>
                    </section>
                </div>

                <Card className="border-4 border-primary shadow-2xl rounded-[2.5rem] overflow-hidden bg-primary/5">
                    <CardHeader className="text-center p-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-4 border-primary/20 mb-4">
                            <Coffee className="w-10 h-10 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-black italic uppercase">Buy Us a Coffee</CardTitle>
                        <CardDescription className="text-base font-medium">Your donations keep our servers running and our developers coding.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pb-12 space-y-8">
                        <div className="flex flex-col items-center space-y-4">
                            <p className="text-sm font-bold text-center italic">Support the creation of more custom scenery and AI tactical features.</p>
                            <a href="https://www.buymeacoffee.com/sheapatterson" target="_blank" rel="noreferrer">
                                <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=sheapatterson&button_colour=ff8500&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=FFDD00" alt="Buy Me A Coffee" className="h-12 shadow-xl hover:scale-105 transition-transform" />
                            </a>
                        </div>
                        <div className="flex items-center space-x-2 text-primary">
                            <Heart className="w-4 h-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Community Driven Project</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Support;