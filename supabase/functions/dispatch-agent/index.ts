// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * HEMS TACTICAL AGENT v3.0 (Powered by Gemini)
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    const pluginApiKey = req.headers.get('x-api-key');

    if (authHeader) {
        const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) userId = user.id;
    } else if (pluginApiKey) {
        const { data: mapping } = await supabaseAdmin.from('user_api_keys').select('user_id').eq('api_key', pluginApiKey).single();
        if (mapping) userId = mapping.user_id;
    }

    if (!userId) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const { mission_id, crew_message } = await req.json();

    // Fetch full mission context for the AI
    const { data: mission } = await supabaseAdmin
        .from('missions')
        .select('*')
        .eq('mission_id', mission_id)
        .single();

    if (!mission) throw new Error("Mission context not found");

    // Construct the Tactical System Prompt
    const systemPrompt = `
        You are an AI Tactical Controller for a HEMS (Helicopter Emergency Medical Services) organization. 
        Your callsign is "DISPATCH". Your tone is professional, concise, clipped, and safety-oriented.
        Use standard aviation terminology (e.g., "Roger", "Wilco", "Lifting", "On the deck", "Squawk", "Altimeter").
        Use NATO phonetic alphabet for identifiers.
        
        MISSION CONTEXT:
        Callsign: ${mission.callsign}
        Type: ${mission.mission_type}
        Status/Phase: ${mission.tracking?.phase || 'Dispatch'}
        Origin: ${mission.origin?.name}
        Target Destination: ${mission.destination?.name}
        Aircraft: ${mission.helicopter?.model} (${mission.helicopter?.registration})
        Patient: ${mission.patient_age || 'Unknown'} year old ${mission.patient_gender || 'N/A'}, ${mission.patient_details || 'No clinical data yet.'}
        
        INSTRUCTIONS:
        1. Keep responses under 30 words.
        2. If the user mentions "LIFTING" or "OFF THE DECK", provide a departure time and squawk code.
        3. If the user mentions "WAYPOINT REACHED", acknowledge progress toward ${mission.destination?.name}.
        4. If the message starts with "EVENT_", it is an automated simulator trigger. Translate this into a tactical radio call.
        5. If there is a MAYDAY, prioritize safety and ask for souls on board and nature of emergency.
        6. Always act like you are in a high-stakes, real-world flight operations center.
    `;

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `SYSTEM_INSTRUCTION: ${systemPrompt}` }] },
          { role: "user", parts: [{ text: `CREW_TRANSMISSION: ${crew_message}` }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      })
    });

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "DISPATCH COPIES. STANDBY.";

    // Filter out "Internal Event" messages from the publicly visible radio log
    if (!crew_message.startsWith('EVENT_')) {
        await supabaseAdmin.from('mission_radio_logs').insert([
            { mission_id, sender: 'Crew', message: crew_message, user_id: userId, callsign: mission.callsign || 'UNIT' }
        ]);
    }

    // Always log the Dispatcher's response
    await supabaseAdmin.from('mission_radio_logs').insert([
        { mission_id, sender: 'Dispatcher', message: responseText, user_id: userId, callsign: 'DISPATCH' }
    ]);

    return new Response(JSON.stringify({ response_text: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("[dispatch-agent] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});