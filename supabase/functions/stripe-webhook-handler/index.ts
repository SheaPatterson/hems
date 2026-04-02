// @ts-nocheck
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import Stripe from 'https://esm.sh/stripe@16.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey || !stripeWebhookSecret) {
        throw new Error("Stripe keys not configured.");
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature!, stripeWebhookSecret);
    } catch (err: unknown) {
      console.error(`[stripe-webhook-handler] Webhook signature verification failed: ${(err as Error).message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${(err as Error).message}` }), { status: 400, headers: corsHeaders });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;

        if (!userId || !customerId) {
          console.error("[stripe-webhook-handler] Webhook Error: Missing user_id or customerId in session.");
          return new Response(JSON.stringify({ error: 'Missing user_id or customerId' }), { status: 400, headers: corsHeaders });
        }

        // Update private profile with Stripe customer ID
        const { error: privateUpdateError } = await supabaseAdmin
          .from('private_profiles')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', userId);

        if (privateUpdateError) throw privateUpdateError;

        // Update public profile with subscription status
        const { error: publicUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({ is_subscribed: true, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (publicUpdateError) throw publicUpdateError;

        console.log(`[stripe-webhook-handler] Subscription activated for user: ${userId}, Customer ID: ${customerId}`);
        break;
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const customerIdFromSubscription = subscription.customer as string;

        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('private_profiles')
            .select('user_id')
            .eq('stripe_customer_id', customerIdFromSubscription)
            .single();

        if (profileError || !profileData) {
            console.error("[stripe-webhook-handler] Error finding user for subscription update:", profileError?.message || "Profile not found");
            return new Response(JSON.stringify({ error: 'User not found for subscription update' }), { status: 404, headers: corsHeaders });
        }

        const newSubscriptionStatus = subscription.status === 'active' || subscription.status === 'trialing';

        const { error: subUpdateError } = await supabaseAdmin
            .from('profiles')
            .update({ is_subscribed: newSubscriptionStatus, updated_at: new Date().toISOString() })
            .eq('id', profileData.user_id);

        if (subUpdateError) throw subUpdateError;
        
        console.log(`[stripe-webhook-handler] Subscription status for user ${profileData.user_id} updated to: ${newSubscriptionStatus}`);
        break;

      default:
        console.log(`[stripe-webhook-handler] Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("[stripe-webhook-handler] Webhook Handler Error:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});