UPDATE public.content 
SET 
  body = '
<div class="max-w-5xl mx-auto space-y-16 pb-32">
    <!-- Platform Header -->
    <header class="border-b-8 border-primary pb-8">
        <div class="flex justify-between items-start m-0">
            <div>
                <p class="text-xs font-mono text-muted-foreground uppercase tracking-[0.5em] mb-2 m-0">SRP Consulting Group, LLC</p>
                <h1 class="text-5xl font-black italic tracking-tighter uppercase leading-none m-0">Virtual HEMS <br/><span class="text-primary m-0">Platform Manual</span></h1>
            </div>
            <div class="text-right hidden md:block m-0">
                <span class="inline-block px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-sm mb-2">PART 1 & 2</span>
                <p class="text-[10px] font-mono text-muted-foreground m-0">SOP-01 / POH-EC135<br/>WESTERN PA SECTOR</p>
            </div>
        </div>
    </header>

    <!-- INTRO VIDEO SECTION -->
    <section class="space-y-6 m-0">
        <div class="flex items-center space-x-2 text-primary m-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="m-0"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
            <h4 class="text-xs font-black uppercase tracking-widest m-0">Multimedia Briefing</h4>
        </div>
        <div class="aspect-video rounded-2xl overflow-hidden bg-black border-4 border-muted shadow-xl m-0">
            <video 
                src="https://orhfcrrydmgxradibbqb.supabase.co/storage/v1/object/public/operational-assets/assets/1766281947169-uq0mpp.mp4" 
                controls 
                class="w-full h-full object-cover m-0"
            >
                Your browser does not support the video tag.
            </video>
        </div>
        <p class="text-xs text-muted-foreground italic text-center m-0">Video Briefing: The New School of Helicopter Training — Generated from professional source intelligence.</p>
    </section>

    <!-- TABLE OF CONTENTS -->
    <section class="bg-muted/30 p-8 rounded-2xl border border-dashed m-0">
        <h3 class="text-sm font-black uppercase tracking-widest mb-6 border-b pb-2 m-0">Manual Index</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 font-mono text-xs m-0">
            <a href="#identity" class="hover:text-primary transition-colors flex justify-between m-0"><span>I. Platform Identity & Mission</span> <span class="text-muted-foreground opacity-30 m-0">.......... 01</span></a>
            <a href="#access" class="hover:text-primary transition-colors flex justify-between m-0"><span>II. Access & User Interface</span> <span class="text-muted-foreground opacity-30 m-0">.......... 02</span></a>
            <a href="#sim" class="hover:text-primary transition-colors flex justify-between m-0"><span>III. Simulation Integration</span> <span class="text-muted-foreground opacity-30 m-0">.......... 03</span></a>
            <a href="#operators" class="hover:text-primary transition-colors flex justify-between m-0"><span>IV. HEMS Operational Context</span> <span class="text-muted-foreground opacity-30 m-0">.......... 04</span></a>
            <a href="#logging" class="hover:text-primary transition-colors flex justify-between m-0"><span>V. Flight Logging Requirements</span> <span class="text-muted-foreground opacity-30 m-0">.......... 05</span></a>
            <a href="#rotorcraft" class="hover:text-primary transition-colors flex justify-between m-0"><span>VI. Rotorcraft Systems (EC135)</span> <span class="text-muted-foreground opacity-30 m-0">.......... 06</span></a>
            <a href="#fundamentals" class="hover:text-primary transition-colors flex justify-between m-0"><span>VII. Piloting Fundamentals</span> <span class="text-muted-foreground opacity-30 m-0">.......... 07</span></a>
            <a href="#geography" class="hover:text-primary transition-colors flex justify-between m-0"><span>VIII. Geographic Scope</span> <span class="text-muted-foreground opacity-30 m-0">.......... 08</span></a>
        </div>
    </section>

    <div class="prose prose-neutral dark:prose-invert max-w-none space-y-20 m-0">
        
        <!-- PART 1 -->
        <div class="space-y-16 m-0">
            <div class="flex items-center space-x-4 m-0">
                <span class="px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-black text-xs m-0">PART 1</span>
                <h2 class="m-0 text-3xl font-black uppercase tracking-tight">Virtual HEMS Platform Overview</h2>
            </div>

            <!-- Section I -->
            <section id="identity" class="scroll-mt-10 m-0">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6 m-0">I. Platform Identity, Technology, and Mission</h3>
                <p class="m-0 mb-4">The Virtual HEMS platform, introduced by SRP Consulting Group, LLC, is designed specifically for simulating aeromedical and Helicopter Emergency Medical Services (HEMS) flights.</p>
                <ul class="space-y-4 list-none p-0 m-0">
                    <li class="flex items-start m-0">
                        <span class="text-primary mr-3 font-bold m-0">•</span>
                        <span class="m-0"><strong>Innovative Foundation:</strong> The platform provides a custom solution developed from the ground up, departing from traditional "Virtual Airlines" that rely on older software and generic fixed-wing templates.</span>
                    </li>
                    <li class="flex items-start m-0">
                        <span class="text-primary mr-3 font-bold m-0">•</span>
                        <span class="m-0"><strong>Data Integrity Mandate:</strong> New users must adhere to the rule that the value of the platform scales with the quality of input data. "Garbage In, Garbage Out” means consistent and accurate data provided directly benefits overall analytics, statistics, and the user experience.</span>
                    </li>
                </ul>
            </section>

            <!-- Section II -->
            <section id="access" class="scroll-mt-10 m-0">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6 m-0 m-0">II. Access and User Interface (UI)</h3>
                <p class="m-0 mb-8">The application is a fully functional Desktop & Mobile Application. Users are required to use Google Chrome on Windows or Mac operating systems to ensure proper function and installation.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 m-0">
                    <div class="p-6 bg-muted/50 rounded-xl border m-0">
                        <h4 class="font-bold text-sm uppercase m-0 mb-3 m-0">Installation</h4>
                        <p class="text-sm m-0">Users must visit the application link and select “Add to Home Screen” from the share menu for installation on both desktop computers and mobile devices.</p>
                    </div>
                    <div class="p-6 bg-muted/50 rounded-xl border m-0">
                        <h4 class="font-bold text-sm uppercase m-0 mb-3 m-0">Key UI Features</h4>
                        <ul class="text-xs space-y-2 list-none p-0 opacity-80 m-0">
                            <li class="m-0">• Virtual HEMS Operations Center</li>
                            <li class="m-0">• Real-time Flight Metrics</li>
                            <li class="m-0">• Advanced HEMS Mission Planner</li>
                            <li class="m-0">• Interactive Communication Center</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Section III -->
            <section id="sim" class="scroll-mt-10 m-0">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6 m-0 m-0">III. Simulation and Scenery Integration</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 m-0">
                    <div class="m-0">
                        <h4 class="font-bold text-sm text-primary uppercase m-0">X-Plane Scenery Focus</h4>
                        <p class="text-sm leading-relaxed m-0">The scenery is designed for X-Plane (Version 10.21 or later) utilizing necessary freeware scenery object libraries. The creator has personally developed 22 different hospitals in extreme detail for X-Plane. These hospital locations are detailed, listing ICAO codes, coordinates, and physical heliport data (dimensions, surface, lighting, and left traffic pattern).</p>
                    </div>
                    <div class="m-0">
                        <h4 class="font-bold text-sm text-primary uppercase m-0">MSFS Scenery Context</h4>
                        <p class="text-sm leading-relaxed m-0">Microsoft Flight Simulator uses Bing Maps data and Azure AI to generate photorealistic 3D models. Custom building designs created for X-Plane are rendered pointless on the MSFS platform due to reliance on AI-generated scenery and photogrammetry.</p>
                    </div>
                </div>
            </section>

            <!-- Section IV -->
            <section id="operators" class="scroll-mt-10 m-0">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6 m-0 m-0">IV. HEMS Operational Context (Western Pennsylvania)</h3>
                <div class="overflow-hidden rounded-xl border m-0">
                    <table class="w-full text-xs m-0">
                        <thead class="bg-muted m-0">
                            <tr class="uppercase font-black border-b m-0">
                                <th class="p-4 m-0 text-left">Operator</th>
                                <th class="p-4 m-0 text-left">Primary Affiliation</th>
                                <th class="p-4 m-0 text-left">Operational Scope</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y m-0">
                            <tr class="m-0">
                                <td class="p-4 font-bold m-0">STAT MedEvac</td>
                                <td class="p-4 m-0">Center for Emergency Medicine of Western PA</td>
                                <td class="p-4 m-0">18 base sites across PA, MD, NY, OH, and D.C. Uses Eurocopter EC 135 and EC-145 helicopters.</td>
                            </tr>
                            <tr class="m-0">
                                <td class="p-4 font-bold m-0 m-0">AHN LifeFlight</td>
                                <td class="p-4 m-0 m-0">Allegheny Health Network</td>
                                <td class="p-4 m-0 m-0">24/7 transport across Western PA, SE Ohio, N WV, W MD. Uses 5 helicopters at specialized bases.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Section V -->
            <section id="logging" class="scroll-mt-10 m-0">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6 m-0 m-0">V. HEMS Flight Logging Requirements</h3>
                <div class="overflow-hidden rounded-xl border border-primary/20 m-0">
                    <table class="w-full text-xs m-0">
                        <thead class="bg-primary/10 m-0">
                            <tr class="uppercase font-black border-b m-0">
                                <th class="p-4 m-0 text-left">Category</th>
                                <th class="p-4 m-0 text-left">Required Fields (Examples)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y m-0">
                            <tr class="m-0"><td class="p-4 font-bold m-0">Pre-Flight</td><td class="p-4 m-0">Pilot Signature, Location, Fuel Required, Patient Info, Hot-Load Requirement.</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0">Time Tracking</td><td class="p-4 m-0 m-0">Engine Startup, Liftoff, Arrival at Scene, Departure from Scene, Arrival at Base.</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0 m-0">Fuel Metrics</td><td class="p-4 m-0 m-0 m-0">Fuel at Liftoff [lbs], Fuel at Base [lbs], Total Burned.</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <!-- PART 2 -->
        <div class="space-y-16 m-0">
            <div class="flex items-center space-x-4 m-0">
                <span class="px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-black text-xs m-0">PART 2</span>
                <h2 class="m-0 text-3xl font-black uppercase tracking-tight m-0">Virtual Pilot Operating Handbook (POH)</h2>
            </div>

            <!-- Section VI -->
            <section id="rotorcraft" class="scroll-mt-10 m-0">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6 m-0 m-0">VI. Rotorcraft Systems and Limitations (EC 135 P2+/T2+)</h3>
                <div class="overflow-hidden rounded-xl border m-0">
                    <table class="w-full text-xs m-0">
                        <thead class="bg-muted m-0">
                            <tr class="uppercase font-black border-b m-0">
                                <th class="p-4 m-0 text-left">Parameter</th>
                                <th class="p-4 m-0 text-left">Limit</th>
                                <th class="p-4 m-0 text-left m-0">Note</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y font-mono m-0">
                            <tr class="m-0"><td class="p-4 font-bold m-0">Max Gross Mass</td><td class="p-4 m-0">2910 kg</td><td class="p-4 m-0">Approved limit</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0">VNE Speed</td><td class="p-4 m-0 m-0">155 KIAS</td><td class="p-4 m-0 m-0">Ref 0ft PA / OAT +30°C</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0 m-0">Max Op Altitude</td><td class="p-4 m-0 m-0 m-0">20,000 ft</td><td class="p-4 m-0 m-0 m-0 m-0 m-0">Ceiling limit</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0 m-0 m-0">Rotor RPM (NR)</td><td class="p-4 m-0 m-0 m-0 m-0">97% to 104%</td><td class="p-4 m-0 m-0 m-0 m-0">Continuous range</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0 m-0 m-0 m-0">Slope Operation</td><td class="p-4 m-0 m-0 m-0 m-0 m-0">Max 14°</td><td class="p-4 m-0 m-0 m-0 m-0 m-0">Avoid mast moment limits</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0 m-0 m-0 m-0 m-0">Fuel Capacity</td><td class="p-4 m-0 m-0 m-0 m-0 m-0 m-0">565.0 kg</td><td class="p-4 m-0 m-0 m-0 m-0 m-0 m-0">706 Liters total</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Section VII -->
            <section id="fundamentals" class="scroll-mt-10 m-0">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6 m-0 m-0 m-0">VII. General Helicopter Piloting Fundamentals</h3>
                <div class="overflow-hidden rounded-xl border border-primary/20 m-0">
                    <table class="w-full text-xs m-0">
                        <thead class="bg-primary/5 m-0">
                            <tr class="uppercase font-black border-b m-0">
                                <th class="p-4 m-0 text-left">Force/Effect</th>
                                <th class="p-4 m-0 text-left">Description and Control</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y m-0">
                            <tr class="m-0"><td class="p-4 font-bold m-0">Lift and Thrust</td><td class="p-4 m-0">Lift opposes weight. Thrust is derived from the tilted rotor disk.</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0 m-0">Gyroscopic Precession</td><td class="p-4 m-0 m-0 m-0">A force results in maximum deflection approximately 90° later in rotation.</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0 m-0 m-0">ETL</td><td class="p-4 m-0 m-0 m-0 m-0">Occurs at 16-24 knots. Nose will rise (blowback), requires forward cyclic.</td></tr>
                            <tr class="m-0"><td class="p-4 font-bold m-0 m-0 m-0 m-0 m-0">Coning</td><td class="p-4 m-0 m-0 m-0 m-0 m-0">Upward shape caused by centrifugal force vs lift. Critical for NR monitoring.</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="mt-8 space-y-6 m-0">
                    <h4 class="font-black uppercase text-sm border-b pb-2 m-0">Safety & handling Management</h4>
                    <ul class="space-y-4 list-none p-0 text-sm m-0">
                        <li class="m-0"><strong>Control Handover:</strong> Must be unambiguous. "You have control" -> "I have control".</li>
                        <li class="m-0"><strong>TEM (Threat and Error Management):</strong> Structured approach to managing inclement weather, airspace, and system malfunctions.</li>
                        <li class="m-0 m-0"><strong>High-Risk Maneuvers:</strong> Use HASEL check (Height, Area, Security, Engine, Lookout) before autorotations or steep approaches.</li>
                    </ul>
                </div>
            </section>

            <!-- Section VIII -->
            <section id="geography" class="scroll-mt-10 m-0">
                <h3 class="text-xl font-bold uppercase tracking-tight border-l-4 border-primary pl-4 mb-6 m-0 m-0 m-0 m-0 m-0 m-0">VIII. Geographic Scope and Infrastructure</h3>
                <p class="text-sm m-0 mb-6">The simulated flight environment covers a broad geographic scope focused on the operational area of Western Pennsylvania, Southeastern Ohio, Northern West Virginia, and Western Maryland.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 m-0">
                    <div class="space-y-4 m-0">
                        <h4 class="font-bold text-xs uppercase text-primary m-0">Prominent Rooftop Heliports</h4>
                        <ul class="text-xs space-y-1 list-none p-0 opacity-80 m-0">
                            <li class="m-0">• Allegheny General Hospital</li>
                            <li class="m-0 m-0">• Jefferson Hospital</li>
                            <li class="m-0 m-0 m-0">• UPMC Children''s Hospital</li>
                            <li class="m-0 m-0 m-0 m-0 m-0">• UPMC Mercy / Presbyterian</li>
                        </ul>
                    </div>
                    <div class="space-y-4 m-0">
                        <h4 class="font-bold text-xs uppercase text-primary m-0 m-0">Primary Ground Heliports</h4>
                        <ul class="text-xs space-y-1 list-none p-0 opacity-80 m-0 m-0">
                            <li class="m-0 m-0">• Canonsburg Hospital</li>
                            <li class="m-0 m-0 m-0">• Forbes Hospital</li>
                            <li class="m-0 m-0 m-0 m-0 m-0">• Clarion Hospital</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    </div>
</div>',
  updated_at = NOW()
WHERE slug = 'documentation';