UPDATE public.content
SET body = '
  <p>The HEMS Tactical Bridge uses a high-fidelity AI Dispatch Agent for realistic radio communications. For the best experience, ensure your system is configured correctly.</p>
  
  <h3 class="text-2xl font-black italic uppercase tracking-tight border-b-2 border-primary/20 pb-2">Interface Options</h3>
  <p>The HEMS ecosystem provides two distinct ways to monitor your flight data in real-time:</p>
  <div class="grid md:grid-cols-2 gap-6 not-prose mt-6">
      <div class="p-6 bg-muted/30 border-2 flex flex-col h-full">
          <div class="flex items-center space-x-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cpu w-5 h-5 text-primary"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v4"/><path d="M12 16v-4"/><path d="M8 12h4"/><path d="M16 12h-4"/><path d="M12 2v-2"/><path d="M12 24v-2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M12 4h.01"/><path d="M12 20h.01"/><path d="M4 12h.01"/><path d="M20 12h.01"/></svg>
              <h4 class="font-black text-sm uppercase">Tactical Bridge (Desktop)</h4>
          </div>
          <p class="text-[10px] text-muted-foreground flex-grow">
              A high-fidelity standalone application for your second monitor. Best for complex mission coordination, viewing regional traffic, and managing AI Dispatcher radio comms.
          </p>
      </div>
      <div class="p-6 bg-muted/30 border-2 flex flex-col h-full">
          <div class="flex items-center space-x-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tablet w-5 h-5 text-primary"><rect width="18" height="22" x="3" y="1" rx="2" ry="2"/><line x1="12" x2="12" y1="17" y2="17"/></svg>
              <h4 class="font-black text-sm uppercase">Cockpit EFB (Tablet)</h4>
          </div>
          <p class="text-[10px] text-muted-foreground flex-grow">
              A browser-based mobile interface optimized for iPads and tablets. Includes simplified mapping, patient medical reports, and interactive mission checklists.
          </p>
      </div>
  </div>

  <h3 class="text-2xl font-black italic uppercase tracking-tight border-b-2 border-primary/20 pb-2 mt-12">Audio Enhancement (TTS)</h3>
  <p>
    The Dispatch Agent now uses a high-quality Text-to-Speech (TTS) service architecture for realistic radio calls, replacing generic system voices. For the full radio effect, you need to provide a short audio file for static:
  </p>
  <ul class="list-disc list-inside ml-4 space-y-2">
    <li><code class="font-mono">/public/audio/radio_static.mp3</code>: Place a short static/click sound here. This is used for the PTT click and release effect.</li>
    <li><code class="font-mono">/public/audio/dispatch_response.mp3</code>: The server uses a placeholder URL pointing to this file to simulate the high-quality voice response. For a real deployment, you would integrate a service like ElevenLabs here.</li>
  </ul>

  <h3 class="text-2xl font-black italic uppercase tracking-tight border-b-2 border-primary/20 pb-2 mt-12">Launching the System</h3>
  <ol class="space-y-4">
    <li>
        <strong>Start X-Plane:</strong> Ensure FlyWithLua is active and your script is loaded.
    </li>
    <li>
        <strong>Open the Bridge:</strong> Run the launcher file in your desktop Bridge folder.
    </li>
    <li>
        <strong>Verify Link:</strong> Look for the <span class="text-[#00ff41] font-bold">SIM_LINK_ACTIVE</span> status indicator in the top right of the Bridge window.
    </li>
  </ol>
'
WHERE slug = 'documentation';