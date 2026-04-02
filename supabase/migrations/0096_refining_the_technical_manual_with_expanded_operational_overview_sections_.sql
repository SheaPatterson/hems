UPDATE public.content 
SET 
  title = 'HEMS Operational Manual & SOPs',
  body = '
<div class="space-y-12 max-w-4xl mx-auto pb-20">
    <!-- Hero Header -->
    <div class="relative py-12 px-8 bg-primary/10 rounded-2xl border-2 border-primary/20 overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <h1 class="text-5xl font-black uppercase italic tracking-tighter text-primary">Operational Manual</h1>
        <p class="text-xl text-muted-foreground mt-2 max-w-2xl font-medium">Standard Operating Procedures & Safety Guidelines for the HEMS Simulation Network.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Sidebar Navigation (Visual Only) -->
        <div class="md:col-span-1 space-y-4">
            <div class="sticky top-8 p-6 bg-muted/30 rounded-xl border space-y-4">
                <h4 class="font-bold uppercase text-xs tracking-widest text-muted-foreground">Quick Links</h4>
                <nav class="flex flex-col space-y-2">
                    <a href="#safety" class="text-sm font-bold hover:text-primary transition-colors">01 Safety Protocols</a>
                    <a href="#weather" class="text-sm font-bold hover:text-primary transition-colors">02 Weather Minimums</a>
                    <a href="#radio" class="text-sm font-bold hover:text-primary transition-colors">03 Radio Standards</a>
                    <a href="#integration" class="text-sm font-bold hover:text-primary transition-colors">04 Sim Integration</a>
                </nav>
                <div class="pt-4 border-t">
                    <p class="text-[10px] text-muted-foreground leading-tight italic">This manual is dynamically updated by Command Staff. Last update: Feb 2024.</p>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="md:col-span-2 space-y-16">
            <!-- Safety -->
            <section id="safety" class="scroll-mt-8">
                <h2 class="text-3xl font-black uppercase italic border-b-2 border-primary/30 pb-2 mb-6">01 Safety & Ground Operations</h2>
                <div class="prose prose-sm dark:prose-invert max-w-none">
                    <p>Safety is the primary mission objective. All HEMS personnel must adhere to the following ground-handling standards during patient transport operations.</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                        <div class="p-4 bg-background border rounded-lg shadow-sm">
                            <h4 class="text-primary font-bold mb-1">COLD LOADING</h4>
                            <p class="text-xs">Standard procedure for non-urgent transfers. Rotors stopped. Full perimeter check required before patient approach.</p>
                        </div>
                        <div class="p-4 bg-background border border-red-500/20 rounded-lg shadow-sm">
                            <h4 class="text-red-500 font-bold mb-1">HOT LOADING</h4>
                            <p class="text-xs">Emergency use only. Rotors turning. Approach from 3 or 9 o''clock ONLY. Eye contact with pilot mandatory.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Weather -->
            <section id="weather" class="scroll-mt-8">
                <h2 class="text-3xl font-black uppercase italic border-b-2 border-primary/30 pb-2 mb-6">02 HEMS Weather Minimums</h2>
                <div class="overflow-hidden rounded-xl border">
                    <table class="w-full text-sm">
                        <thead class="bg-muted text-muted-foreground">
                            <tr>
                                <th class="p-4 text-left font-black uppercase tracking-tighter">Condition</th>
                                <th class="p-4 text-left font-black uppercase tracking-tighter">Ceiling</th>
                                <th class="p-4 text-left font-black uppercase tracking-tighter">Visibility</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr class="hover:bg-muted/30">
                                <td class="p-4 font-bold">Local Day VFR</td>
                                <td class="p-4">800 ft</td>
                                <td class="p-4">2 SM</td>
                            </tr>
                            <tr class="hover:bg-muted/30">
                                <td class="p-4 font-bold">Cross-Country Day</td>
                                <td class="p-4">1000 ft</td>
                                <td class="p-4">3 SM</td>
                            </tr>
                            <tr class="hover:bg-muted/30 text-primary">
                                <td class="p-4 font-bold">Night (High NVG)</td>
                                <td class="p-4">1000 ft</td>
                                <td class="p-4">3 SM</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="text-xs text-muted-foreground mt-4 italic">Note: Pilots are empowered to decline any mission based on "Pilot in Command" safety assessment (GO/NO-GO logic).</p>
            </section>

            <!-- Radio -->
            <section id="radio" class="scroll-mt-8">
                <h2 class="text-3xl font-black uppercase italic border-b-2 border-primary/30 pb-2 mb-6">03 Communication Standards</h2>
                <div class="space-y-4">
                    <div class="flex gap-4">
                        <div class="h-8 w-8 rounded-full bg-primary text-black flex items-center justify-center font-bold shrink-0">1</div>
                        <div>
                            <p class="font-bold">Dispatch Initialization</p>
                            <p class="text-sm text-muted-foreground">Use the AI Dispatcher chat to transmit "READY FOR DISPATCH" once mission planning is committed.</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="h-8 w-8 rounded-full bg-primary text-black flex items-center justify-center font-bold shrink-0">2</div>
                        <div>
                            <p class="font-bold">Phase Acknowledgements</p>
                            <p class="text-sm text-muted-foreground">Report "AT SCENE," "PATIENT ON BOARD," and "LOCKED ON HELIPAD" at appropriate mission intervals.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <footer class="pt-20 border-t flex flex-col items-center space-y-4">
        <div class="flex items-center space-x-2 text-primary/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span class="text-xs font-black uppercase tracking-[0.4em]">Secure Operations Protocol</span>
        </div>
        <p class="text-[10px] text-muted-foreground/60 uppercase text-center max-w-sm">This document is the property of SRP Consulting Group. Unauthorized reproduction is strictly prohibited.</p>
    </footer>
</div>',
  updated_at = NOW()
WHERE slug = 'documentation';