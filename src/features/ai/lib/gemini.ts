import { GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../config/env';
import { getSupabaseClient } from '../../../lib/supabase';

/** Singleton Gemini client - used only in dev/web fallback mode. */
let client: any = null; // any: Gemini SDK types not available at build time

export async function getGeminiClient(): Promise<any> { // any: Gemini SDK types not available at build time
  if (!client) {
    const { GoogleGenAI } = await import('@google/genai');
    client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return client;
}

export const GEMINI_MODEL = 'gemini-2.0-flash';

export interface GeminiInlineData {
  mimeType: string;
  data: string;
}

export interface GeminiPart {
  text?: string;
  inlineData?: GeminiInlineData;
}

export interface GeminiContent {
  role?: 'user' | 'model';
  parts: GeminiPart[];
}

interface GenerateGeminiTextInput {
  message?: string;
  contents?: GeminiContent[];
  systemInstruction?: string;
  options?: { model?: string; temperature?: number; maxOutputTokens?: number };
}

async function buildProxyHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  const sb = getSupabaseClient();
  if (!sb) return headers;

  const { data: { session } } = await sb.auth.getSession();
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  return headers;
}

async function generateGeminiViaProxy({
  message,
  contents,
  systemInstruction,
  options = {},
}: GenerateGeminiTextInput): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/gemini-proxy`, {
    method: 'POST',
    headers: await buildProxyHeaders(),
    body: JSON.stringify({
      message,
      contents,
      systemInstruction,
      model: options.model ?? GEMINI_MODEL,
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Gemini proxy HTTP ${res.status}`);
  }

  const data = await res.json() as { text?: string };
  return data.text ?? '';
}

export async function generateGeminiText({
  message,
  contents,
  systemInstruction,
  options = {},
}: GenerateGeminiTextInput): Promise<string> {
  if (SUPABASE_URL) {
    return generateGeminiViaProxy({ message, contents, systemInstruction, options });
  }

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini is not configured');
  }

  const ai = await getGeminiClient();
  const response = await ai.models.generateContent({
    model: options.model ?? GEMINI_MODEL,
    contents: contents ?? message ?? '',
    config: {
      systemInstruction,
      temperature: options.temperature ?? 0.7,
      ...(typeof options.maxOutputTokens === 'number' ? { maxOutputTokens: options.maxOutputTokens } : {}),
    },
  });

  return response.text ?? '';
}

/**
 * Generate a Gemini AI response.
 *
 * Routes through the Supabase Edge Function proxy when SUPABASE_URL is
 * configured (production / native). This keeps the Gemini API key
 * server-side and enforces per-user rate limits (50 req/day).
 *
 * Falls back to a direct client call when no Supabase URL is set
 * (local dev only - key will be visible in the browser).
 */
export async function generateAIResponse(
  message: string,
  systemInstruction: string,
  options: { model?: string; temperature?: number } = {},
): Promise<string> {
  return generateGeminiText({ message, systemInstruction, options });
}

export interface MemoryContext {
  dailyMacros: unknown;
  checkInStatus: unknown;
  toleranceLogs: unknown;
  savedRecipes: { title: string }[];
  /** User's goal: lose, gain, maintain, muscle, performance... */
  userGoal?: string;
  /** Declared food intolerances */
  intolerances?: string[];
  /** Names of disliked foods (resolved from IDs for readability) */
  foodDislikes?: string[];
  /** Top food-feeling insights from RealFeel correlation engine */
  recentFoodInsights?: { name: string; tone: string; avgLevel: number }[];
  /** Weekly nutrition averages */
  weeklyNutritionAvg?: { cal: number; pro: number; carbs: number; fats: number };
  /** Weight trend data */
  weightTrend?: { current: number; delta7d: number; ratePerWeek: number };
  /** Current logging streak */
  loggingStreak?: number;
}

export function buildSystemPrompt(ctx: MemoryContext, locale: string): string {
  const goalLine = ctx.userGoal ? `\nUser Goal: ${ctx.userGoal}` : '';
  const intoleranceLine = ctx.intolerances?.length ? `\nIntolerances: ${ctx.intolerances.join(', ')}` : '';
  const dislikeLine = ctx.foodDislikes?.length ? `\nFood Dislikes: ${ctx.foodDislikes.join(', ')}` : '';
  const insightsLine = ctx.recentFoodInsights?.length
    ? `\nFood-Feeling Insights: ${ctx.recentFoodInsights.map(i => `${i.name} (${i.tone}, avg ${i.avgLevel.toFixed(1)}/5)`).join('; ')}`
    : '';

  return `
You are an elite AI nutrition coach for the RIAL app.
Your tone is professional, direct, scientific, and motivating.
You have access to the user's current data:

Current Macros: ${JSON.stringify(ctx.dailyMacros)}
Latest Check-in: ${JSON.stringify(ctx.checkInStatus)}
Food Tolerance Logs: ${JSON.stringify(ctx.toleranceLogs)}
Saved Recipes: ${(ctx.savedRecipes || []).slice(0, 5).map(r => r.title).join(', ')}${goalLine}${intoleranceLine}${dislikeLine}${insightsLine}${ctx.weeklyNutritionAvg ? `\nWeekly Avg: ${ctx.weeklyNutritionAvg.cal} kcal, ${ctx.weeklyNutritionAvg.pro}g P, ${ctx.weeklyNutritionAvg.carbs}g C, ${ctx.weeklyNutritionAvg.fats}g F` : ''}${ctx.weightTrend ? `\nWeight: ${ctx.weightTrend.current} kg (${ctx.weightTrend.delta7d >= 0 ? '+' : ''}${ctx.weightTrend.delta7d} kg/week)` : ''}${ctx.loggingStreak ? `\nLogging Streak: ${ctx.loggingStreak} days` : ''}

Use this data to provide highly personalized, actionable advice.
When the user has intolerances or dislikes, never suggest those foods.
When food-feeling insights exist, reference them to explain patterns.
Adjust recommendations to the user's goal (bulk=surplus, cut=deficit, maintain=balance).
Keep responses concise and formatted with markdown (bullet points, bold text).
IMPORTANT: Always respond in ${locale === 'es' ? 'Spanish' : 'English'}.
`.trim();
}
