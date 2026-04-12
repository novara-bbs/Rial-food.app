/**
 * Supabase Edge Function: validate-receipt
 *
 * Called by RevenueCat webhooks to update user subscription status.
 * Also called directly after purchase to sync isPro → Supabase profiles table.
 *
 * Deploy:
 *   npx supabase functions deploy validate-receipt
 *
 * Set env secrets:
 *   npx supabase secrets set REVENUECAT_WEBHOOK_AUTH_HEADER=Bearer xxxx
 *
 * In RevenueCat dashboard → Integrations → Webhooks:
 *   URL: https://<project>.supabase.co/functions/v1/validate-receipt
 *   Authorization: Bearer <your-secret>
 *   Events: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, RESTORE
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify RevenueCat webhook auth header
    const authHeader = req.headers.get('Authorization');
    const expectedAuth = Deno.env.get('REVENUECAT_WEBHOOK_AUTH_HEADER');
    if (expectedAuth && authHeader !== expectedAuth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const event = body.event;
    if (!event) {
      return new Response(JSON.stringify({ error: 'No event' }), { status: 400, headers: corsHeaders });
    }

    // Initialize Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const appUserId = event.app_user_id as string;
    if (!appUserId) {
      return new Response(JSON.stringify({ error: 'No app_user_id' }), { status: 400, headers: corsHeaders });
    }

    // Determine pro status based on event type
    const proEvents = ['INITIAL_PURCHASE', 'RENEWAL', 'RESTORE', 'UNCANCELLATION'];
    const cancelEvents = ['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE'];
    const isPro = proEvents.includes(event.type)
      ? true
      : cancelEvents.includes(event.type)
      ? false
      : null;

    if (isPro !== null) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: isPro, updated_at: new Date().toISOString() })
        .eq('id', appUserId);

      if (error) {
        console.error('Failed to update profile:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, event_type: event.type, isPro }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('validate-receipt error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
