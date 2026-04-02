// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@16.2.0'; // Import Stripe SDK

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
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const { data: privateProfile } = await supabaseAdmin
        .from('private_profiles')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
        throw new Error("Stripe secret key not configured.");
    }
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

    // --- IMPORTANT ---
    // This is a placeholder Price ID. You must replace it with a real one from your Stripe Dashboard.
    // 1. Go to your Stripe Dashboard -> Products.
    // 2. Create a new Product (e.g., "HEMS OPS-CENTER Premium").
    // 3. Add a recurring price to it (e.g., $11.99/month).
    // 4. Copy the Price ID (it will look like 'price_xxxxxxxxxxxx') and paste it below.
    const priceId = 'price_1ShyODCmY2JSkQjQ2Lhe5Zmg'; // <-- User provided this ID

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [{
            price: priceId, 
            quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.headers.get('origin')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/pricing`,
        metadata: {
            user_id: user.id,
        },
    };

    if (privateProfile?.stripe_customer_id) {
        sessionParams.customer = privateProfile.stripe_customer_id;
    } else {
        sessionParams.customer_email = user.email;
    }
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    return new Response(JSON.stringify({ sessionId: session.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (error) {
    console.error("[create-checkout-session] Error:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error during checkout creation' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});