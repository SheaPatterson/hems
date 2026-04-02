UPDATE public.content 
SET 
  title = 'HEMS Operational Manual & SOPs',
  body = '
<div class="space-y-12">
    <!-- Header Section -->
    <div class="border-l-4 border-primary pl-6 py-2">
        <h1 class="text-4xl font-black uppercase italic tracking-tighter">Mission Critical SOPs</h1>
        <p class="text-lg text-muted-foreground">Standard Operating Procedures for the HEMS Simulation Network.</p>
    </div>

    <!-- Section 1: Safety -->
    <section>
        <h2 class="text-2xl font-bold flex items-center mb-4">
            <span class="bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">01</span>
            Safety & Ground Operations
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
            <div class="p-4 border rounded-lg bg-muted/30">
                <h3 class="font-bold text-primary uppercase text-sm mb-2">Cold Loading (Standard)</h3>
                <p class="text-sm">Engines must be completely shut down and rotors stopped before any patient or crew movement within the safety circle (25ft).</p>
            </div>
            <div class="p-4 border rounded-lg bg-muted/30">
                <h3 class="font-bold text-red-500 uppercase text-sm mb-2">Hot Loading (Urgent)</h3>
                <p class="text-sm">Authorized only under "Time-Critical" dispatch. Crew must remain at the 3 or 9 o''clock positions. Pilot must remain at flight controls.</p>
            </div>
        </div>
    </section>

    <!-- Section 2: Weather -->
    <section>
        <h2 class="text-2xl font-bold flex items-center mb-4">
            <span class="bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">02</span>
            Weather Minimums (HEMS)
        </h2>
        <table class="w-full border-collapse text-sm">
            <thead>
                <tr class="bg-muted">
                    <th class="border p-2 text-left">Condition</th>
                    <th class="border p-2 text-left">Ceiling (Ft)</th>
                    <th class="border p-2 text-left">Visibility (SM)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="border p-2 font-medium">Day VFR (Local)</td>
                    <td class="border p-2 italic">800</td>
                    <td class="border p-2 italic">2</td>
                </tr>
                <tr>
                    <td class="border p-2 font-medium">Day VFR (Cross-Country)</td>
                    <td class="border p-2 italic">1000</td>
                    <td class="border p-2 italic">3</td>
                </tr>
                <tr class="text-red-500">
                    <td class="border p-2 font-medium">Night VFR (High NVG)</td>
                    <td class="border p-2 italic">1000</td>
                    <td class="border p-2 italic">3</td>
                </tr>
            </tbody>
        </table>
    </section>

    <!-- Section 3: Comms -->
    <section>
        <h2 class="text-2xl font-bold flex items-center mb-4">
            <span class="bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">03</span>
            Radio Protocol
        </h2>
        <ul class="list-disc pl-5 space-y-3 text-sm">
            <li><strong>Initial Contact:</strong> State callsign and "Ready for Dispatch" to receive mission coordinates.</li>
            <li><strong>Position Reports:</strong> Automated via simulator plugin, but manual voice confirmation is required upon reaching "At Scene" and "At Hospital."</li>
            <li><strong>Emergency:</strong> Use the "MAYDAY" keyword in the AI Dispatcher chat for immediate emergency logging.</li>
        </ul>
    </section>

    <!-- Section 4: Simulator Integration -->
    <section class="p-6 bg-primary/5 border-2 border-primary/20 rounded-xl">
        <h2 class="text-2xl font-bold mb-2">Simulator Integration</h2>
        <p class="text-sm text-muted-foreground mb-6">To sync your flight data with the Live Ops board, you must link your simulator using your unique API Key.</p>
        
        <div class="space-y-4">
            <div class="flex items-start space-x-3">
                <div class="font-mono text-primary font-bold">STEP 1</div>
                <p class="text-sm">Download the <strong>X-Plane Lua Connector</strong> from the Plugins menu.</p>
            </div>
            <div class="flex items-start space-x-3">
                <div class="font-mono text-primary font-bold">STEP 2</div>
                <p class="text-sm">Navigate to your <strong>User Profile</strong> and copy the "Simulator API Key."</p>
            </div>
            <div class="flex items-start space-x-3">
                <div class="font-mono text-primary font-bold">STEP 3</div>
                <p class="text-sm">Paste the key into the simulator HUD window and click "INITIALIZE CHANNEL."</p>
            </div>
        </div>
    </section>

    <footer class="text-[10px] text-center text-muted-foreground uppercase tracking-widest pt-10">
        End of Document | SRP Consulting Group | v4.2.0-STABLE
    </footer>
</div>',
  updated_at = NOW()
WHERE slug = 'documentation';