// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check to ensure only logged-in users can use this function
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { icao } = await req.json();
    if (!icao || typeof icao !== 'string' || icao.length < 3 || icao.length > 4) {
      return new Response(JSON.stringify({ error: 'Invalid ICAO code provided.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const apiKey = Deno.env.get('FLIGHTPLANDB_API_KEY');
    if (!apiKey) {
      console.error("[fetch-airport-info] FLIGHTPLANDB_API_KEY is not set in Supabase secrets.");
      throw new Error('FlightPlanDB API key is not configured on the server.');
    }

    const response = await fetch(`https://api.flightplandatabase.com/nav/airport/${icao.toUpperCase()}`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[fetch-airport-info] Upstream API error: ${response.status} ${errorText}`);
      return new Response(JSON.stringify({ error: `Failed to fetch data from FlightPlanDB: ${response.statusText}` }), { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[fetch-airport-info]', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});