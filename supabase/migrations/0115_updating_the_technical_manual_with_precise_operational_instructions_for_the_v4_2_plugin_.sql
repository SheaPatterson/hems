UPDATE public.content 
SET body = '
<div class="space-y-8">
  <section>
    <h2 class="text-3xl font-black italic uppercase text-primary border-b-2 border-primary/20 pb-2">1. Deployment Protocol</h2>
    <p>The HEMS Tactical Link v4.2 uses a <strong>State-Aware Handshake</strong>. Unlike older versions, you do not need to manually enter mission IDs. The plugin polls the HEMS Cloud for any mission you have "Dispatched" on the web dashboard.</p>
    <ul class="list-disc pl-6 space-y-2 mt-4 text-sm font-medium">
      <li><strong>Handshake:</strong> Occurs every 10 seconds when idle.</li>
      <li><strong>Lock-On:</strong> Occurs instantly once a mission is marked "Active" in the Ops Center.</li>
      <li><strong>Telemetry:</strong> 4-second resolution uplink of GPS, Altitude, and Fuel.</li>
    </ul>
  </section>

  <section>
    <h2 class="text-3xl font-black italic uppercase text-primary border-b-2 border-primary/20 pb-2">2. X-Plane 11/12 Configuration</h2>
    <div class="bg-muted p-4 rounded-xl border font-mono text-xs">
      <p class="text-primary font-bold">-- REQUIRED DIRECTORY --</p>
      <p>X-Plane/Resources/plugins/FlyWithLua/Scripts/hems-dispatch-xp.lua</p>
    </div>
    <p class="mt-4">Ensure your <code>API_KEY</code> is wrapped in double quotes. The script utilizes the <code>io.popen</code> library to execute system-level CURL commands, bypassing Lua''s internal networking limitations for maximum stability.</p>
  </section>

  <section>
    <h2 class="text-3xl font-black italic uppercase text-primary border-b-2 border-primary/20 pb-2">3. AviTab EFB Projection</h2>
    <p>The HEMS OPS-CENTER provides a dedicated <strong>Cockpit View</strong> optimized for in-sim tablets. This view provides high-contrast typography and large touch targets for VR or heavy turbulence environments.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div class="p-4 border rounded-xl bg-primary/5">
        <h4 class="font-black uppercase text-xs">Tactical View</h4>
        <p class="text-[10px] text-muted-foreground mt-1">Satellite tracking and route visualization.</p>
      </div>
      <div class="p-4 border rounded-xl bg-primary/5">
        <h4 class="font-black uppercase text-xs">Clinical View</h4>
        <p class="text-[10px] text-muted-foreground mt-1">Real-time patient vitals and landing zone photos.</p>
      </div>
    </div>
  </section>

  <section class="pb-10">
    <h2 class="text-3xl font-black italic uppercase text-primary border-b-2 border-primary/20 pb-2">4. Support Frequencies</h2>
    <p>If the Tactical Link display in the cockpit remains stuck on "AWAITING DISPATCH," verify that you have clicked <strong>"INITIALIZE DISPATCH"</strong> in the web planner. The server only transmits mission packets for missions with an <code>active</code> status.</p>
  </section>
</div>'
WHERE slug = 'documentation';