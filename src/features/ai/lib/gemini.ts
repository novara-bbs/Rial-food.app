import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../../../config/env';

/** Singleton Gemini client — reused across calls. */
let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return client;
}

export const GEMINI_MODEL = 'gemini-3-flash-preview';

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
  /** Top food↔feeling insights from RealFeel correlation engine */
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
