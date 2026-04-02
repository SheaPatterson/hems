// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

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

    // 1. Authenticate via JWT or API Key
    if (authHeader) {
        const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) userId = user.id;
    } else if (pluginApiKey) {
        const { data: mapping } = await supabaseAdmin
            .from('user_api_keys')
            .select('user_id')
            .eq('api_key', pluginApiKey)
            .single();
        if (mapping) userId = mapping.user_id;
    }

    if (!userId) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const body = await req.json();
    const { mission_id } = body;

    if (!mission_id) {
        return new Response(JSON.stringify({ error: 'Missing mission_id' }), { status: 400, headers: corsHeaders });
    }

    // 2. Fetch full mission details with ownership check
    const { data: mission, error } = await supabaseAdmin
      .from('missions')
      .select('*')
      .eq('mission_id', mission_id)
      .eq('user_id', userId)
      .single();

    if (error || !mission) {
        return new Response(JSON.stringify({ error: 'Mission not found or access denied' }), { status: 404, headers: corsHeaders });
    }

    // 3. Fetch latest radio messages to include in the briefing
    const { data: logs } = await supabaseAdmin
        .from('mission_radio_logs')
        .select('sender, message, timestamp')
        .eq('mission_id', mission_id)
        .order('timestamp', { ascending: false })
        .limit(5);

    return new Response(JSON.stringify({ 
        success: true, 
        mission,
        recent_comms: logs || []
    }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Error' }), { status: 500, headers: corsHeaders });
  }
});