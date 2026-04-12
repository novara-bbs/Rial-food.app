/**
 * Delete Account — Supabase Edge Function (Deno)
 *
 * GDPR right-to-erasure: deletes all user data and the auth account.
 * Requires valid user JWT (cannot be called without authentication).
 *
 * Deploy:
 *   supabase functions deploy delete-account
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ─── Verify JWT ────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace('Bearer ', '');

  if (!jwt) {
    return json({ error: 'Missing authorization token' }, 401);
  }

  // Use anon client to verify the user JWT
  const anonClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { auth: { persistSession: false } },
  );

  const { data: { user }, error: authError } = await anonClient.auth.getUser(jwt);

  if (authError || !user) {
    return json({ error: 'Invalid or expired token' }, 401);
  }

  const userId = user.id;

  // ─── Delete with admin client (service role) ───────────────────────────────
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );

  try {
    // 1. Delete all user_data rows
    const { error: dataError } = await adminClient
      .from('user_data')
      .delete()
      .eq('user_id', userId);

    if (dataError) {
      console.error('[delete-account] user_data delete error:', dataError);
      // Non-fatal — continue with profile + auth deletion
    }

    // 2. Delete profile row
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('[delete-account] profiles delete error:', profileError);
      // Non-fatal — continue with auth deletion
    }

    // 3. Delete the auth user (irreversible)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('[delete-account] auth.admin.deleteUser error:', deleteError);
      return json({ error: 'Failed to delete authentication account. Please contact support.' }, 500);
    }

    console.log(`[delete-account] Successfully deleted user ${userId}`);
    return json({ success: true });

  } catch (err) {
    console.error('[delete-account] Unexpected error:', err);
    return json({ error: 'An unexpected error occurred' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
