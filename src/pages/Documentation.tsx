import { Card } from '@/components/ui/card';
import { BookOpen, Terminal, Cpu, CheckCircle2, ShieldCheck, ShieldAlert, Zap, Globe, HardDrive } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Separator } from '@/components/ui/separator';

const Documentation = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-12 animate-in fade-in duration-700">
      <PageHeader 
        title="Technical Manual"
        description="Official operational protocols for the HEMS Tactical Environment v5.3.0."
        icon={BookOpen}
      />

      {/* System Architecture Overview */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Architecture: v5.3.0 Standalone</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-muted/30 border-2 rounded-2xl space-y-3 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                    <Globe className="w-24 h-24" />
                </div>
                <h4 className="font-black text-primary uppercase text-[10px] tracking-widest">LAYER 1</h4>
                <p className="text-sm font-bold uppercase italic leading-none">Global Data Link</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Cloud-based telemetry relay and AI Dispatch Agent (Gemini 1.5 Flash). Handles secure storage and theater synchronization.
                </p>
            </div>
            <div className="p-6 bg-muted/30 border-2 rounded-2xl space-y-3 relative overflow-hidden group border-primary/20">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                    <Cpu className="w-24 h-24" />
                </div>
                <h4 className="font-black text-primary uppercase text-[10px] tracking-widest">LAYER 2</h4>
                <p className="text-sm font-bold uppercase italic leading-none">Standalone Bridge</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The local Electron application (v5.3.0). Acts as the interface between your simulator and the HEMS cloud network.
                </p>
            </div>
            <div className="p-6 bg-muted/30 border-2 rounded-2xl space-y-3 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                    <Terminal className="w-24 h-24" />
                </div>
                <h4 className="font-black text-primary uppercase text-[10px] tracking-widest">LAYER 3</h4>
                <p className="text-sm font-bold uppercase italic leading-none">Lua Uplink Pipe</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The in-simulator logic script. Continuously polls Datarefs and pushes packets to the local Bridge on port 8080.
                </p>
            </div>
        </div>
      </section>

      {/* The 2-Step Initialization */}
      <section className="space-y-8 bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary text-black rounded-2xl shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Initialization Protocol</h2>
                    <p className="text-sm font-medium text-muted-foreground">Follow these steps to establish a secure data link.</p>
                </div>
            </div>
            <div className="px-4 py-1.5 bg-black rounded-full border border-primary/30 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#00ff41]">Network Status: Nominal</span>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex items-center space-x-2 text-primary">
                    <span className="text-2xl font-black italic">01.</span>
                    <h4 className="font-black uppercase tracking-widest text-xs">The Lua Data Pipe</h4>
                </div>
                <div className="p-6 bg-background rounded-2xl border space-y-4 shadow-inner">
                    <p className="text-xs leading-relaxed">
                        Navigate to your <span className="font-bold">FlyWithLua/Scripts</span> folder within your simulator directory. Place the <code className="text-primary font-mono font-bold">hems-dispatch-xp.lua</code> file inside. 
                    </p>
                    <div className="bg-muted p-3 rounded-xl border-l-4 border-primary">
                        <p className="text-[10px] italic font-medium">This script is lightweight and optimized for high-frequency polling without impacting FPS.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2 text-primary">
                    <span className="text-2xl font-black italic">02.</span>
                    <h4 className="font-black uppercase tracking-widest text-xs">The Tactical Bridge</h4>
                </div>
                <div className="p-6 bg-background rounded-2xl border space-y-4 shadow-inner">
                    <p className="text-xs leading-relaxed">
                        Download the standalone installer for your architecture (Windows, Mac Silicon, or Intel) from the <span className="font-bold text-primary">Resource Library</span>.
                    </p>
                    <div className="flex items-center space-x-3 text-[10px] font-mono bg-muted p-2 rounded-lg">
                        <HardDrive className="w-4 h-4" />
                        <span>Storage Link: SECURE_BOX_UPLINK</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Mac Specific Permissions Section */}
      <section className="space-y-6">
          <div className="flex items-center space-x-3">
              <ShieldAlert className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">macOS: Security & Permissions</h2>
          </div>
          <div className="space-y-4">
              <div className="p-8 bg-muted/30 border-2 rounded-[2.5rem] space-y-8">
                  <div className="space-y-3">
                      <h4 className="font-black text-sm uppercase text-primary flex items-center">
                          <Terminal className="w-4 h-4 mr-2" /> 1. Fixing "Access Privileges" Errors
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                          If macOS prevents the launcher from running, you must manually grant executable permissions via the Terminal:
                      </p>
                      <div className="bg-black p-6 rounded-2xl border border-white/10 space-y-4">
                          <ol className="text-xs font-medium space-y-3 list-decimal list-inside text-white/80">
                              <li>Open the <span className="text-primary font-bold">Terminal.app</span> on your Mac.</li>
                              <li>Type <code className="bg-zinc-800 text-[#00ff41] px-2 py-1 rounded font-mono font-bold">chmod +x </code> <span className="text-red-500 font-black italic">(NOTE: Ensure there is a space after the 'x')</span></li>
                              <li>Drag the <code className="font-mono text-white">LAUNCH_BRIDGE.command</code> file from the Bridge folder directly into the terminal window.</li>
                              <li>Press <span className="font-bold text-primary">Enter</span>. The file is now authorized to run.</li>
                          </ol>
                      </div>
                  </div>
                  
                  <Separator className="opacity-20" />

                  <div className="space-y-3">
                      <h4 className="font-black text-sm uppercase text-primary flex items-center">
                          <ShieldCheck className="w-4 h-4 mr-2" /> 2. Bypassing "Unidentified Developer"
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                          Since the bridge is a custom standalone tool, macOS Gatekeeper may flag it. To bypass:
                      </p>
                      <ul className="text-xs font-medium space-y-2 list-disc list-inside text-white/70">
                          <li><span className="font-bold text-white">Right-Click</span> (or Control-Click) the application file.</li>
                          <li>Select <span className="font-bold text-white">Open</span> from the context menu.</li>
                          <li>Click <span className="font-bold text-white">Open</span> again in the security dialog box.</li>
                      </ul>
                  </div>
              </div>
          </div>
      </section>

      {/* Interface Comparison */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Display Configuration</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-2 flex flex-col h-full bg-card/40 backdrop-blur shadow-xl rounded-3xl">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-xl"><Cpu className="w-6 h-6 text-primary" /></div>
                    <h4 className="font-black text-lg uppercase italic leading-none">Standalone Bridge (v5.3)</h4>
                </div>
                <ul className="space-y-3 text-xs font-medium text-muted-foreground flex-grow mb-8">
                    <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> High-fidelity standalone desktop window.</li>
                    <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> System Tray (Menu Bar) integration.</li>
                    <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> Optimized for secondary monitor monitoring.</li>
                    <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> Full AI Radio support with voice synthesis.</li>
                </ul>
                <div className="p-4 bg-muted/50 rounded-2xl border border-dashed text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest">Recommended for Windows/PC Pilots</p>
                </div>
            </Card>
            <Card className="p-8 border-2 flex flex-col h-full bg-card/40 backdrop-blur shadow-xl rounded-3xl">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-xl"><Terminal className="w-6 h-6 text-primary" /></div>
                    <h4 className="font-black text-lg uppercase italic leading-none">Cockpit EFB (Mobile)</h4>
                </div>
                <ul className="space-y-3 text-xs font-medium text-muted-foreground flex-grow mb-8">
                    <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> Browser-based interface (No installation required).</li>
                    <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> Specifically optimized for iPad and Android tablets.</li>
                    <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> Interactive Mission Checklists (SOPs).</li>
                    <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> Real-time patient clinical briefing logs.</li>
                </ul>
                <div className="p-4 bg-muted/50 rounded-2xl border border-dashed text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest">Recommended for Tablet/Handheld users</p>
                </div>
            </Card>
        </div>
      </section>

      <Separator className="opacity-50" />

      <footer className="text-center pb-20 space-y-4">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em]">Operational Compliance v5.3.0-STABLE</p>
          <div className="flex justify-center items-center space-x-6">
              <div className="h-px w-24 bg-border" />
              <ShieldCheck className="w-6 h-6 text-primary/40" />
              <div className="h-px w-24 bg-border" />
          </div>
      </footer>
    </div>
  );
};

export default Documentation;