/**
 * Gemini API Proxy — Supabase Edge Function (Deno)
 *
 * Keeps GEMINI_API_KEY server-side, out of the client bundle.
 * Enforces per-user rate limiting (50 req/day).
 *
 * Required Supabase secrets:
 *   supabase secrets set GEMINI_API_KEY=your_key_here
 *
 * Deploy:
 *   supabase functions deploy gemini-proxy
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RATE_LIMIT_PER_DAY = 50;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiKey) {
    return json({ error: 'GEMINI_API_KEY not configured' }, 500);
  }

  // ─── Auth: get user ID from JWT (optional — anonymous allowed) ─────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace('Bearer ', '');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );

  let userId: string | null = null;
  if (jwt && jwt !== Deno.env.get('SUPABASE_ANON_KEY')) {
    const { data: { user } } = await supabase.auth.getUser(jwt);
    userId = user?.id ?? null;
  }

  // ─── Rate limiting for authenticated users ─────────────────────────────────
  if (userId) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const rateKey = `gemini_rate_${today}`;

    const { data: rateRow } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', rateKey)
      .maybeSingle();

    const currentCount = typeof rateRow?.value === 'number' ? rateRow.value : 0;

    if (currentCount >= RATE_LIMIT_PER_DAY) {
      return json({ error: 'Daily AI message limit reached (50/day). Upgrade to RIAL+ for more.' }, 429);
    }

    // Increment counter (fire-and-forget)
    supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        key: rateKey,
        value: currentCount + 1,
        updated_at: new Date().toISOString(),
      })
      .then(() => {/* ignore */});
  }

  // ─── Parse request body ────────────────────────────────────────────────────
  let body: {
    message?: string;
    systemInstruction?: string;
    model?: string;
    temperature?: number;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const {
    message,
    systemInstruction,
    model = 'gemini-2.0-flash',
    temperature = 0.7,
  } = body;

  if (!message) {
    return json({ error: '"message" field is required' }, 400);
  }

  // ─── Call Gemini REST API ─────────────────────────────────────────────────
  const geminiUrl = `${GEMINI_BASE}/${model}:generateContent?key=${geminiKey}`;

  const geminiBody: Record<string, unknown> = {
    contents: [{ parts: [{ text: message }] }],
    generationConfig: { temperature, maxOutputTokens: 1024 },
  };

  if (systemInstruction) {
    geminiBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  let geminiRes: Response;
  try {
    geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });
  } catch (err) {
    console.error('[gemini-proxy] Network error:', err);
    return json({ error: 'Failed to reach Gemini API' }, 502);
  }

  if (!geminiRes.ok) {
    const errBody = await geminiRes.text();
    console.error(`[gemini-proxy] Gemini HTTP ${geminiRes.status}:`, errBody);
    return json({ error: `Gemini API error: ${geminiRes.status}` }, 502);
  }

  interface GeminiResponse {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  }
  const data = await geminiRes.json() as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  return json({ text });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
