// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@16.2.0';

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        console.error("[create-customer-portal-session] Missing Authorization header");
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
    
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
        console.error("[create-customer-portal-session] Invalid user token");
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    let stripeCustomerId = null;

    // 1. Check the new 'private_profiles' table first
    const { data: privateProfile } = await supabaseAdmin
        .from('private_profiles')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

    if (privateProfile?.stripe_customer_id) {
        stripeCustomerId = privateProfile.stripe_customer_id;
    } else {
        // 2. Fallback: Check the old 'profiles' table for legacy data
        console.log(`[create-customer-portal-session] Customer ID not in private_profiles for user ${user.id}. Checking legacy profiles table.`);
        const { data: publicProfile } = await supabaseAdmin
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (publicProfile?.stripe_customer_id) {
            console.log(`[create-customer-portal-session] Found legacy customer ID for user ${user.id}. Migrating it now.`);
            stripeCustomerId = publicProfile.stripe_customer_id;

            // 3. Perform a just-in-time migration to the new table
            const { error: migrationError } = await supabaseAdmin
                .from('private_profiles')
                .update({ stripe_customer_id: stripeCustomerId })
                .eq('user_id', user.id);
            
            if (migrationError) {
                console.error(`[create-customer-portal-session] JIT migration failed for user ${user.id}:`, migrationError);
            } else {
                console.log(`[create-customer-portal-session] JIT migration successful for user ${user.id}.`);
            }
        }
    }

    if (!stripeCustomerId) {
        console.error(`[create-customer-portal-session] Stripe customer ID not found for user: ${user.id} in either table.`);
        throw new Error("Stripe customer ID not found for this user. Please contact support.");
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
        console.error("[create-customer-portal-session] STRIPE_SECRET_KEY is not set.");
        throw new Error("Stripe secret key not configured.");
    }
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${req.headers.get('origin')}/user`,
    });
    
    return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (error) {
    console.error("[create-customer-portal-session] Error:", { message: error.message });
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});