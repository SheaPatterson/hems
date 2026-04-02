// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Verify the requester is an admin (Server-side validation)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { data: { user: requester } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (!requester) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Check if requester has admin role
    const { data: adminCheck } = await supabaseAdmin
        .from('user_roles')
        .select('role_id')
        .eq('user_id', requester.id)
        .eq('role_id', 'admin')
        .single();
    
    if (!adminCheck) {
        return new Response('Forbidden: Admin access required', { status: 403, headers: corsHeaders });
    }

    // 2. Perform the role update
    const { targetUserId, action } = await req.json();

    if (!targetUserId || !action) {
        return new Response('Missing required fields', { status: 400, headers: corsHeaders });
    }

    // Prevent self-demotion
    if (requester.id === targetUserId) {
        return new Response('Cannot modify your own roles', { status: 400, headers: corsHeaders });
    }

    let result;
    if (action === 'grant') {
        result = await supabaseAdmin
            .from('user_roles')
            .upsert({ user_id: targetUserId, role_id: 'admin' });
    } else {
        result = await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', targetUserId)
            .eq('role_id', 'admin');
    }

    if (result.error) throw result.error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Role management error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});