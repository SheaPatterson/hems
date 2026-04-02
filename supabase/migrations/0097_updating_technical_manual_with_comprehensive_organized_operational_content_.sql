UPDATE public.content 
SET 
  title = 'HEMS Operational Manual (SOP-01)',
  body = '
<div class="max-w-5xl mx-auto space-y-16 pb-32">
    <!-- Header/Cover -->
    <header class="border-b-8 border-primary pb-8">
        <div class="flex justify-between items-start">
            <div>
                <p class="text-xs font-mono text-muted-foreground uppercase tracking-[0.5em] mb-2">SRP Consulting Group // Ops Division</p>
                <h1 class="text-6xl font-black italic tracking-tighter uppercase leading-none">Technical <br/><span class="text-primary">Manual</span></h1>
            </div>
            <div class="text-right">
                <span class="inline-block px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-sm mb-2">Status: STABLE</span>
                <p class="text-[10px] font-mono text-muted-foreground">VERSION: 4.2.0-STABLE<br/>RELEASE: FEB 2024</p>
            </div>
        </div>
        <p class="mt-8 text-xl text-muted-foreground max-w-2xl">The definitive guide for pilots, clinical crew, and dispatchers operating within the HEMS Simulation Network.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <!-- Sticky Nav -->
        <aside class="lg:col-span-1">
            <div class="sticky top-8 space-y-8">
                <div>
                    <h4 class="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b pb-2 mb-4">Table of Contents</h4>
                    <nav class="flex flex-col space-y-3 font-mono text-xs">
                        <a href="#intro" class="hover:text-primary transition-colors flex items-center"><span class="w-4 text-primary opacity-50">00</span> Introduction</a>
                        <a href="#safety" class="hover:text-primary transition-colors flex items-center"><span class="w-4 text-primary opacity-50">01</span> Operational Safety</a>
                        <a href="#weather" class="hover:text-primary transition-colors flex items-center"><span class="w-4 text-primary opacity-50">02</span> Weather Thresholds</a>
                        <a href="#comms" class="hover:text-primary transition-colors flex items-center"><span class="w-4 text-primary opacity-50">03</span> Radio Procedures</a>
                        <a href="#logistics" class="hover:text-primary transition-colors flex items-center"><span class="w-4 text-primary opacity-50">04</span> Clinical Logistics</a>
                        <a href="#integration" class="hover:text-primary transition-colors flex items-center"><span class="w-4 text-primary opacity-50">05</span> Sim Integration</a>
                    </nav>
                </div>
                <div class="p-4 bg-muted/30 rounded border border-dashed text-[10px] text-muted-foreground leading-relaxed italic">
                    All procedures outlined herein are simulated. For training purposes only.
                </div>
            </div>
        </aside>

        <!-- Document Content -->
        <main class="lg:col-span-3 space-y-24 prose prose-neutral dark:prose-invert max-w-none">
            
            <!-- Intro -->
            <section id="intro" class="scroll-mt-10">
                <h2 class="text-3xl font-black uppercase italic border-l-4 border-primary pl-4 mb-8">Introduction & Mission</h2>
                <p>The <strong>HEMS Simulation Network</strong> is designed to replicate the high-stakes environment of Air Medical Services. Pilots and crew are expected to maintain professional standards, prioritizing safety over mission completion. Our objective is the rapid transport of critically ill or injured patients while managing complex aeronautical and clinical variables.</p>
            </section>

            <!-- Safety -->
            <section id="safety" class="scroll-mt-10">
                <h2 class="text-3xl font-black uppercase italic border-l-4 border-primary pl-4 mb-8">01. Operational Safety</h2>
                <div class="space-y-6">
                    <div class="p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <h4 class="text-red-500 uppercase font-black tracking-widest text-sm mb-3">The Safety Circle (25 Feet)</h4>
                        <p class="text-sm">The area within 25 feet of the aircraft is designated the <strong>Critical Safety Zone</strong>. No personnel shall enter this zone without explicit "thumbs-up" confirmation from the Pilot in Command (PIC).</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="p-6 bg-muted/50 rounded-xl border">
                            <h4 class="font-bold text-primary mb-2 uppercase text-xs">Standard Loading (Cold)</h4>
                            <ul class="text-sm space-y-2 list-none p-0">
                                <li>• Engine: SHUTDOWN</li>
                                <li>• Rotors: STOPPED</li>
                                <li>• Used for: All stable facility transfers.</li>
                            </ul>
                        </div>
                        <div class="p-6 bg-muted/50 rounded-xl border">
                            <h4 class="font-bold text-orange-500 mb-2 uppercase text-xs">Urgent Loading (Hot)</h4>
                            <ul class="text-sm space-y-2 list-none p-0">
                                <li>• Engine: RUNNING</li>
                                <li>• Approach: 3 or 9 o''clock ONLY</li>
                                <li>• Requirement: Pilot must remain at controls.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Weather -->
            <section id="weather" class="scroll-mt-10">
                <h2 class="text-3xl font-black uppercase italic border-l-4 border-primary pl-4 mb-8">02. Weather Minimums</h2>
                <p class="text-sm mb-6">Mission dispatches are subject to real-time weather evaluation. Pilots must utilize the "GO/NO-GO" logic in the Mission Planner.</p>
                <div class="overflow-hidden rounded-xl border border-primary/20">
                    <table class="w-full text-left m-0">
                        <thead class="bg-primary/10">
                            <tr class="text-[10px] uppercase font-black tracking-widest border-b">
                                <th class="p-4">Operational Status</th>
                                <th class="p-4">Ceiling (AGL)</th>
                                <th class="p-4">Visibility (SM)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y font-mono text-xs">
                            <tr>
                                <td class="p-4 font-bold">VFR Day (Local)</td>
                                <td class="p-4">800 ft</td>
                                <td class="p-4">2 SM</td>
                            </tr>
                            <tr>
                                <td class="p-4 font-bold">VFR Day (Cross-Country)</td>
                                <td class="p-4">1,000 ft</td>
                                <td class="p-4">3 SM</td>
                            </tr>
                            <tr class="text-primary">
                                <td class="p-4 font-bold">VFR Night (NVG Equipped)</td>
                                <td class="p-4">1,000 ft</td>
                                <td class="p-4">3 SM</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Comms -->
            <section id="comms" class="scroll-mt-10">
                <h2 class="text-3xl font-black uppercase italic border-l-4 border-primary pl-4 mb-8">03. Radio Procedures</h2>
                <div class="space-y-4">
                    <div class="p-4 bg-muted/30 rounded border-l-4 border-primary">
                        <p class="text-xs font-bold uppercase mb-1">Standard Transmission Structure</p>
                        <p class="text-sm italic">"[Callsign], [Position/Phase], [Intentions/Status]"</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="p-3 border rounded text-center">
                            <p class="font-bold text-xs uppercase mb-1">Phase 1</p>
                            <p class="text-[10px] text-muted-foreground italic">"Ready for Dispatch"</p>
                        </div>
                        <div class="p-3 border rounded text-center">
                            <p class="font-bold text-xs uppercase mb-1">Phase 2</p>
                            <p class="text-[10px] text-muted-foreground italic">"At Scene / Transfer"</p>
                        </div>
                        <div class="p-3 border rounded text-center">
                            <p class="font-bold text-xs uppercase mb-1">Phase 3</p>
                            <p class="text-[10px] text-muted-foreground italic">"Locked on Helipad"</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Integration -->
            <section id="integration" class="scroll-mt-10">
                <h2 class="text-3xl font-black uppercase italic border-l-4 border-primary pl-4 mb-8">05. Simulator Integration</h2>
                <div class="bg-primary text-primary-foreground p-8 rounded-2xl shadow-xl">
                    <h3 class="text-2xl font-black italic uppercase mb-4 m-0 text-primary-foreground">Live Telemetry Sync</h3>
                    <p class="text-sm mb-6 opacity-90">Our custom API bridges X-Plane and MSFS directly to the Dispatch Dashboard.</p>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-4">
                            <span class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold">1</span>
                            <p class="text-sm font-bold">Download the Lua or WASM Connector from the Plugins page.</p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold">2</span>
                            <p class="text-sm font-bold">Copy your "Private API Key" from your Pilot Profile.</p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold">3</span>
                            <p class="text-sm font-bold">Paste and Initialize within the simulator in-sim HUD.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <footer class="pt-24 text-center">
        <div class="h-px w-full bg-border mb-12"></div>
        <p class="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-4">Secure Operations Registry</p>
        <p class="text-[9px] text-muted-foreground max-w-sm mx-auto leading-relaxed italic">
            This technical document is dynamically generated for active HEMS simulation personnel. Content is subject to change based on Command Staff operational updates.
        </p>
    </footer>
</div>',
  updated_at = NOW()
WHERE slug = 'documentation';