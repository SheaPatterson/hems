import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Mail, Globe, Zap, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const FooterLink = ({ to, children, external = false }: { to: string; children: React.ReactNode; external?: boolean }) => {
    if (external) {
        return (
            <a href={to} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-xs font-medium">
                {children}
            </a>
        );
    }
    return (
        <Link to={to} className="text-muted-foreground hover:text-primary transition-colors text-xs font-medium">
            {children}
        </Link>
    );
};

export const BrandedFooter = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="mt-auto border-t bg-card/50 backdrop-blur-xl relative z-10">
            {/* Top Branding Bar */}
            <div className="bg-primary/5 py-3 border-b border-primary/10">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-primary/60">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] font-mono">
                            Operational Integrity Verified
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest italic">Ironpine AI Tactical Engine</span>
                        <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Column 1: Company / Identity */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground">
                                SRP <span className="text-primary">Consulting Group</span>
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Specialized mission-critical systems and advanced training solutions for the global HEMS community.
                            </p>
                        </div>
                        <div className="flex flex-col space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic">Keep the link alive</p>
                            <a href="https://www.buymeacoffee.com/sheapatterson" target="_blank" rel="noreferrer" className="transition-transform hover:scale-105 active:scale-95 shadow-xl rounded-xl overflow-hidden w-fit">
                                <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=sheapatterson&button_colour=ff8500&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=FFDD00" alt="Buy Me A Coffee" className="h-10" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Legal & Transparency */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Compliance</h4>
                        <nav className="flex flex-col space-y-2">
                            <FooterLink to="/privacy">Privacy Protocol</FooterLink>
                            <FooterLink to="/terms">Terms of Service</FooterLink>
                            <FooterLink to="/whitepaper">Whitepaper / SOP</FooterLink>
                            <FooterLink to="/incident-reports">SMS Compliance</FooterLink>
                        </nav>
                    </div>

                    {/* Column 3: Technology Stack */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Tech Stack</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors"><Cpu className="w-4 h-4 text-muted-foreground group-hover:text-primary" /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-foreground leading-none">Ironpine Tactical</p>
                                    <p className="text-[9px] text-muted-foreground">AI Intelligence Layer</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors"><Zap className="w-4 h-4 text-muted-foreground group-hover:text-primary" /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-foreground leading-none">Supabase Realtime</p>
                                    <p className="text-[9px] text-muted-foreground">Global Telemetry Hub</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Communication */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Connect</h4>
                        <div className="space-y-4">
                            <FooterLink to="mailto:ops@hemssim.com" external>
                                <div className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                                    <Mail className="w-4 h-4" />
                                    <span>ops@hemssim.com</span>
                                </div>
                            </FooterLink>
                            <FooterLink to="/discord">
                                <div className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                                    <Globe className="w-4 h-4" />
                                    <span>Theater Discord</span>
                                </div>
                            </FooterLink>
                        </div>
                    </div>
                </div>

                <Separator className="my-12 opacity-50" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                            &copy; {currentYear} SRP Consulting Group, LLC. All rights reserved.
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-[9px] font-mono font-black uppercase tracking-tighter opacity-40">
                        <span className="flex items-center"><Zap className="w-3 h-3 mr-1" /> CLOUD_SYNC_ACTIVE</span>
                        <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> V5.3.0-STABLE</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default BrandedFooter;