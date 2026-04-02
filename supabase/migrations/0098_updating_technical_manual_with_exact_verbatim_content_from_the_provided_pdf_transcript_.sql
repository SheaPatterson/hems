UPDATE public.content 
SET 
  title = 'HEMS Technical Manual & SOPs',
  body = '
<div class="max-w-5xl mx-auto space-y-16 pb-32">
    <!-- Platform Header -->
    <header class="border-b-8 border-primary pb-8">
        <div class="flex justify-between items-end">
            <div>
                <p class="text-xs font-mono text-muted-foreground uppercase tracking-[0.5em] mb-2">SRP Consulting Group, LLC</p>
                <h1 class="text-5xl font-black italic tracking-tighter uppercase leading-none">Virtual HEMS <br/><span class="text-primary">Platform Manual</span></h1>
            </div>
            <div class="text-right hidden md:block">
                <span class="inline-block px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-sm mb-2">PART 1 & 2</span>
                <p class="text-[10px] font-mono text-muted-foreground">SOP-01 / POH-EC135<br/>WESTERN PA SECTOR</p>
            </div>
        </div>
    </header>

    <!-- TABLE OF CONTENTS -->
    <section class="bg-muted/30 p-8 rounded-2xl border border-dashed">
        <h3 class="text-sm font-black uppercase tracking-widest mb-6 border-b pb-2">Manual Index</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 font-mono text-xs">
            <a href="#identity" class="hover:text-primary transition-colors flex justify-between"><span>I. Platform Identity & Mission</span> <span class="text-muted-foreground opacity-30">.......... 01</span></a>
            <a href="#access" class="hover:text-primary transition-colors flex justify-between"><span>II. Access & User Interface</span> <span class="text-muted-foreground opacity-30">.......... 02</span></a>
            <a href="#sim" class="hover:text-primary transition-colors flex justify-between"><span>III. Simulation Integration</span> <span class="text-muted-foreground opacity-30">.......... 03</span></a>
            <a href="#operators" class="hover:text-primary transition-colors flex justify-between"><span>IV. HEMS Operational Context</span> <span class="text-muted-foreground opacity-30">.......... 04</span></a>
            <a href="#logging" class="hover:text-primary transition-colors flex justify-between"><span>V. Flight Logging Requirements</span> <span class="text-muted-foreground opacity-30">.......... 05</span></a>
            <a href="#rotorcraft" class="hover:text-primary transition-colors flex justify-between"><span>VI. Rotorcraft Systems (EC135)</span> <span class="text-muted-foreground opacity-30">.......... 06</span></a>
            <a href="#fundamentals" class="hover:text-primary transition-colors flex justify-between"><span>VII. Piloting Fundamentals</span> <span class="text-muted-foreground opacity-30">.......... 07</span></a>
            <a href="#geography" class="hover:text-primary transition-colors flex justify-between"><span>VIII. Geographic Scope</span> <span class="text-muted-foreground opacity-30">.......... 08</span></a>
        </div>
    </section>

    <div class="prose prose-neutral dark:prose-invert max-w-none space-y-20">
        
        <!-- PART 1 -->
        <div class="space-y-16">
            <div class="flex items-center space-x-4">
                <span class="px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-black text-xs">PART 1</span>
                <h2 class="m-0 text-3xl font-black uppercase tracking-tight">Virtual HEMS Platform Overview</h2>
            </div>

            <!-- Section I -->
            <section id="identity" class="scroll-mt-10">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6">I. Platform Identity, Technology, and Mission</h3>
                <p>The Virtual HEMS platform, introduced by SRP Consulting Group, LLC, is designed specifically for simulating aeromedical and Helicopter Emergency Medical Services (HEMS) flights.</p>
                <ul class="space-y-4 list-none p-0">
                    <li class="flex items-start">
                        <span class="text-primary mr-3 font-bold">•</span>
                        <span><strong>Innovative Foundation:</strong> The platform provides a custom solution developed from the ground up, departing from traditional "Virtual Airlines" that rely on older software and generic fixed-wing templates.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="text-primary mr-3 font-bold">•</span>
                        <span><strong>Data Integrity Mandate:</strong> New users must adhere to the rule that the value of the platform scales with the quality of input data. "Garbage In, Garbage Out” means consistent and accurate data provided directly benefits overall analytics, statistics, and the user experience.</span>
                    </li>
                </ul>
            </section>

            <!-- Section II -->
            <section id="access" class="scroll-mt-10">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6">II. Access and User Interface (UI)</h3>
                <p>The application is a fully functional Desktop & Mobile Application. Users are required to use Google Chrome on Windows or Mac operating systems to ensure proper function and installation.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div class="p-6 bg-muted/50 rounded-xl border">
                        <h4 class="font-bold text-sm uppercase m-0 mb-3">Installation</h4>
                        <p class="text-sm">Users must visit the application link and select “Add to Home Screen” from the share menu for installation on both desktop computers and mobile devices.</p>
                    </div>
                    <div class="p-6 bg-muted/50 rounded-xl border">
                        <h4 class="font-bold text-sm uppercase m-0 mb-3">Key UI Features</h4>
                        <ul class="text-xs space-y-2 list-none p-0 opacity-80">
                            <li>• Virtual HEMS Operations Center</li>
                            <li>• Real-time Flight Metrics</li>
                            <li>• Advanced HEMS Mission Planner</li>
                            <li>• Interactive Communication Center</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Section III -->
            <section id="sim" class="scroll-mt-10">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6">III. Simulation and Scenery Integration</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 class="font-bold text-sm text-primary uppercase">X-Plane Scenery Focus</h4>
                        <p class="text-sm leading-relaxed">The scenery is designed for X-Plane (Version 10.21 or later) utilizing necessary freeware scenery object libraries. The creator has personally developed 22 different hospitals in extreme detail for X-Plane. These hospital locations are detailed, listing ICAO codes, coordinates, and physical heliport data (dimensions, surface, lighting, and left traffic pattern).</p>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm text-primary uppercase">MSFS Scenery Context</h4>
                        <p class="text-sm leading-relaxed">Microsoft Flight Simulator uses Bing Maps data and Azure AI to generate photorealistic 3D models. Custom building designs created for X-Plane are rendered pointless on the MSFS platform due to reliance on AI-generated scenery and photogrammetry.</p>
                    </div>
                </div>
            </section>

            <!-- Section IV -->
            <section id="operators" class="scroll-mt-10">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6">IV. HEMS Operational Context (Western Pennsylvania)</h3>
                <div class="overflow-hidden rounded-xl border">
                    <table class="w-full text-xs m-0">
                        <thead class="bg-muted">
                            <tr class="uppercase font-black border-b">
                                <th class="p-4">Operator</th>
                                <th class="p-4">Primary Affiliation</th>
                                <th class="p-4">Operational Scope</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr>
                                <td class="p-4 font-bold">STAT MedEvac</td>
                                <td class="p-4">UPMC Consortium</td>
                                <td class="p-4">18 base sites across PA, MD, NY, OH, and D.C. Uses Eurocopter EC 135 and EC-145 helicopters.</td>
                            </tr>
                            <tr>
                                <td class="p-4 font-bold">AHN LifeFlight</td>
                                <td class="p-4">Allegheny Health Network</td>
                                <td class="p-4">24/7 transport across Western PA, SE Ohio, N WV, W MD. Uses 5 helicopters at specialized bases.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Section V -->
            <section id="logging" class="scroll-mt-10">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6">V. HEMS Flight Logging Requirements</h3>
                <div class="overflow-hidden rounded-xl border border-primary/20">
                    <table class="w-full text-xs m-0">
                        <thead class="bg-primary/10">
                            <tr class="uppercase font-black border-b">
                                <th class="p-4">Category</th>
                                <th class="p-4">Required Fields (Examples)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr><td class="p-4 font-bold">Pre-Flight</td><td class="p-4">Pilot Signature, Location, Fuel Required, Patient Info, Hot-Load Requirement.</td></tr>
                            <tr><td class="p-4 font-bold">Time Tracking</td><td class="p-4">Engine Startup, Liftoff, Arrival at Scene, Departure from Scene, Arrival at Base.</td></tr>
                            <tr><td class="p-4 font-bold">Fuel Metrics</td><td class="p-4">Fuel at Liftoff [lbs], Fuel at Base [lbs], Total Burned.</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <!-- PART 2 -->
        <div class="space-y-16">
            <div class="flex items-center space-x-4">
                <span class="px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-black text-xs">PART 2</span>
                <h2 class="m-0 text-3xl font-black uppercase tracking-tight">Virtual Pilot Operating Handbook (POH)</h2>
            </div>

            <!-- Section VI -->
            <section id="rotorcraft" class="scroll-mt-10">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6">VI. Rotorcraft Systems and Limitations (EC 135 P2+/T2+)</h3>
                <div class="overflow-hidden rounded-xl border">
                    <table class="w-full text-xs m-0">
                        <thead class="bg-muted">
                            <tr class="uppercase font-black border-b">
                                <th class="p-4">Parameter</th>
                                <th class="p-4">Limit</th>
                                <th class="p-4">Note</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y font-mono">
                            <tr><td class="p-4 font-bold">Max Gross Mass</td><td class="p-4">2910 kg</td><td class="p-4">Approved limit</td></tr>
                            <tr><td class="p-4 font-bold">VNE Speed</td><td class="p-4">155 KIAS</td><td class="p-4">Ref 0ft PA / OAT +30°C</td></tr>
                            <tr><td class="p-4 font-bold">Max Op Altitude</td><td class="p-4">20,000 ft</td><td class="p-4">Ceiling limit</td></tr>
                            <tr><td class="p-4 font-bold">Rotor RPM (NR)</td><td class="p-4">97% to 104%</td><td class="p-4">Continuous range</td></tr>
                            <tr><td class="p-4 font-bold">Slope Operation</td><td class="p-4">Max 14°</td><td class="p-4">Avoid mast moment limits</td></tr>
                            <tr><td class="p-4 font-bold">Fuel Capacity</td><td class="p-4">565.0 kg</td><td class="p-4">706 Liters total</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Section VII -->
            <section id="fundamentals" class="scroll-mt-10">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6">VII. General Helicopter Piloting Fundamentals</h3>
                <div class="overflow-hidden rounded-xl border border-primary/20">
                    <table class="w-full text-xs m-0">
                        <thead class="bg-primary/5">
                            <tr class="uppercase font-black border-b">
                                <th class="p-4">Force/Effect</th>
                                <th class="p-4">Description and Control</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr><td class="p-4 font-bold">Lift and Thrust</td><td class="p-4">Lift opposes weight. Thrust is derived from the tilted rotor disk.</td></tr>
                            <tr><td class="p-4 font-bold">Gyroscopic Precession</td><td class="p-4">A force results in maximum deflection approximately 90° later in rotation.</td></tr>
                            <tr><td class="p-4 font-bold">ETL</td><td class="p-4">Occurs at 16-24 knots. Nose will rise (blowback), requires forward cyclic.</td></tr>
                            <tr><td class="p-4 font-bold">Coning</td><td class="p-4">Upward shape caused by centrifugal force vs lift. Critical for NR monitoring.</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="mt-8 space-y-6">
                    <h4 class="font-black uppercase text-sm border-b pb-2">Safety & handling Management</h4>
                    <ul class="space-y-4 list-none p-0 text-sm">
                        <li><strong>Control Handover:</strong> Must be unambiguous. "You have control" -> "I have control".</li>
                        <li><strong>TEM (Threat and Error Management):</strong> Structured approach to managing inclement weather, airspace, and system malfunctions.</li>
                        <li><strong>High-Risk Maneuvers:</strong> Use HASEL check (Height, Area, Security, Engine, Lookout) before autorotations or steep approaches.</li>
                    </ul>
                </div>
            </section>

            <!-- Section VIII -->
            <section id="geography" class="scroll-mt-10">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6">VIII. Geographic Scope and Infrastructure</h3>
                <p class="text-sm">The simulated flight environment covers a broad geographic scope focused on the operational area of Western Pennsylvania, Southeastern Ohio, Northern West Virginia, and Western Maryland.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div class="space-y-4">
                        <h4 class="font-bold text-xs uppercase text-primary">Prominent Rooftop Heliports</h4>
                        <ul class="text-xs space-y-1 list-none p-0 opacity-80">
                            <li>• Allegheny General Hospital</li>
                            <li>• Jefferson Hospital</li>
                            <li>• UPMC Children''s Hospital</li>
                            <li>• UPMC Mercy / Presbyterian</li>
                        </ul>
                    </div>
                    <div class="space-y-4">
                        <h4 class="font-bold text-xs uppercase text-primary">Primary Ground Heliports</h4>
                        <ul class="text-xs space-y-1 list-none p-0 opacity-80">
                            <li>• Canonsburg Hospital</li>
                            <li>• Forbes Hospital</li>
                            <li>• Clarion Hospital</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <!-- Footer Disclaimer -->
    <footer class="pt-24 border-t text-center space-y-4">
        <div class="flex justify-center items-center space-x-2 text-primary opacity-50 grayscale hover:grayscale-0 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span class="text-[10px] font-black uppercase tracking-[0.4em]">Secure Operations Protocol</span>
        </div>
        <p class="text-[10px] text-muted-foreground uppercase leading-relaxed max-w-lg mx-auto">
            This document is the property of SRP Consulting Group. Operational precision is required for all personnel. All data entered directly impacts system-wide analytics.
        </p>
    </footer>
</div>',
  updated_at = NOW()
WHERE slug = 'documentation';