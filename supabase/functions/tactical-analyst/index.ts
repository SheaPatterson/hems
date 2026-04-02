// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const authHeader = req.headers.get('Authorization');
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const { mode, context } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === 'GENERATE_SCENARIO') {
        // 1. Fetch a random base scenario from the database to ensure we use "uploaded" conditions
        const { data: baseScenarios } = await supabaseAdmin
            .from('medical_scenarios')
            .select('*');
        
        const baseScenario = baseScenarios && baseScenarios.length > 0 
            ? baseScenarios[Math.floor(Math.random() * baseScenarios.length)]
            : null;

        systemPrompt = `
            You are a HEMS Dispatch Coordinator. Generate a realistic and biologically plausible medical emergency scenario.
            
            BIOLOGICAL CONSTRAINTS:
            - If age < 12, weight must be appropriate for a child (e.g., 20-100 lbs).
            - If age > 18, weight should be realistic for an adult (e.g., 120-280 lbs).
            - The condition MUST match the assigned age (e.g., don't give a 5-year-old a geriatric stroke).
            - Weight must reasonably correlate with the assigned sex and age.

            Return ONLY a JSON object with: 
            patientAge (string), 
            patientGender (Male/Female), 
            patientWeightLbs (string), 
            patientDetails (detailed 2-3 sentence clinical summary), 
            medicalResponse (specific interventions required).
        `;

        userPrompt = `
            Mission Type: ${context.type}. 
            Region: ${context.region}.
            Base Scenario to use as inspiration: ${baseScenario ? baseScenario.title : 'Random Trauma/Medical'}.
            Scenario Details: ${baseScenario ? baseScenario.description_base : 'N/A'}.
        `;
    } else if (mode === 'REVIEW_FLIGHT') {
        systemPrompt = "You are a HEMS Chief Pilot performing an After Action Review (AAR). Analyze the provided flight telemetry and pilot notes. Return ONLY a JSON object with: score (number 0-100), efficiencyRating (string), and criticalCritique (concise professional feedback).";
        userPrompt = `Telemetry: ${JSON.stringify(context.tracking)}. Pilot Notes: ${context.notes}. Airframe: ${context.helicopter}.`;
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nINPUT_DATA: ${userPrompt}` }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    return new Response(resultText, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});