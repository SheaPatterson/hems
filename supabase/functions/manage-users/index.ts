// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Verify the requester is an admin
    const authHeader = req.headers.get('Authorization');
    const { data: { user: requester } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (!requester) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const { data: adminCheck } = await supabaseAdmin
        .from('user_roles')
        .select('role_id')
        .eq('user_id', requester.id)
        .eq('role_id', 'admin')
        .single();
    
    if (!adminCheck) return new Response('Forbidden: Admin access required', { status: 403, headers: corsHeaders });

    // 2. Process Deletion
    const { targetUserId } = await req.json();

    if (requester.id === targetUserId) {
        return new Response('Cannot delete your own account via this interface', { status: 400, headers: corsHeaders });
    }

    // This will delete from auth.users and cascade delete profiles/roles
    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});