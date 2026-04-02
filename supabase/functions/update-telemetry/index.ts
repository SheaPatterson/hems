// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Helper for distance calculation in Nautical Miles
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c) * 0.539957; // to NM
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    
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

    const body = await req.json();
    const { mission_id, phase, ...telemetryData } = body;

    const lat = telemetryData.latitude || 0;
    const lon = telemetryData.longitude || 0;
    const alt = telemetryData.altitudeFt ?? 0;
    const spd = telemetryData.groundSpeedKts ?? 0;
    const hdg = telemetryData.headingDeg ?? 0;
    const fuel = telemetryData.fuelRemainingLbs ?? 0;

    // 1. Fetch Active Mission (if any)
    const { data: mission } = await supabaseAdmin
      .from('missions')
      .select('mission_id, destination, tracking, helicopter, patient_age, patient_gender, callsign')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Determine Callsign for Global Status
    let callsign = 'UNIT';
    if (mission?.callsign) {
        callsign = mission.callsign;
    } else {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', userId)
            .maybeSingle();
        
        if (profile?.first_name || profile?.last_name) {
            callsign = `${profile.first_name || ''}${profile.last_name || ''}`.trim().toUpperCase() || 'UNIT';
        }
    }

    // 3. Update Global Status (For Instructor Monitoring)
    await supabaseAdmin.from('live_pilot_status').upsert({
        user_id: userId,
        last_seen: new Date().toISOString(),
        latitude: lat,
        longitude: lon,
        altitude_ft: alt,
        ground_speed_kts: spd,
        heading_deg: hdg,
        fuel_remaining_lbs: fuel,
        phase: phase || 'Online',
        callsign: callsign
    });

    // 4. Update Active Mission Tracking Data
    if (mission) {
        await supabaseAdmin.from('missions').update({
            tracking: {
                ...(mission.tracking || {}),
                latitude: lat,
                longitude: lon,
                altitudeFt: alt,
                groundSpeedKts: spd,
                headingDeg: hdg,
                fuelRemainingLbs: fuel,
                phase: phase || mission.tracking?.phase
            }
        }).eq('mission_id', mission.mission_id);
    }

    // 5. Construct Enhanced Tactical Response (returned to sim)
    let resp = "ID:NONE|TO:STANDBY|PHASE:ONLINE|DIST:0|REM:0|PT:NONE";
    if (mission) {
        const dist = calculateDistance(lat, lon, mission.destination.latitude, mission.destination.longitude);
        const burnRate = mission.helicopter?.fuel_burn_rate_lb_hr || 450;
        const endurance = Math.floor((fuel / burnRate) * 60);
        const pt = `${mission.patient_age || '?'}${mission.patient_gender || '?'}`;
        
        resp = `ID:${mission.mission_id}|TO:${mission.destination.name}|PHASE:${mission.tracking?.phase || 'ENROUTE'}|DIST:${dist.toFixed(1)}|REM:${endurance}|PT:${pt}`;
    }

    return new Response(resp, { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });

  } catch (error) {
    console.error("[update-telemetry] Error:", error.message);
    return new Response(`ERR:${error.message}`, { status: 500, headers: corsHeaders });
  }
});