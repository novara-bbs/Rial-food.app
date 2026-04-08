/**
 * Correlation Engine — adapted from v0-rialfood
 * Detects patterns between food, timing, and wellbeing signals.
 * Pure functional, no side effects, no API calls.
 */

export type CorrelationTone = 'positive' | 'warning' | 'neutral';

export interface CorrelationInsight {
  id: string;
  tone: CorrelationTone;
  emoji: string;
  title: string;
  detail: string;
  confidence: number;
}

export interface InsightRecommendation {
  id: string;
  tone: CorrelationTone;
  icon: string;
  title: string;
  detail: string;
  confidence: number;
  category: 'timing' | 'composition' | 'adherence' | 'wellbeing';
}

// Real Feel log entry from our app
interface RFEntry {
  id: number;
  date: string;
  level: number; // 1-5
  tags: string[];
  note?: string;
  energy?: 'high' | 'stable' | 'low';
  digestion?: 'clean' | 'sensitive' | 'bloated';
  mindset?: 'calm' | 'balanced' | 'stressed';
}

// Pearson correlation coefficient
function pearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const mx = x.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const my = y.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const a = x[i] - mx, b = y[i] - my;
    num += a * b;
    dx2 += a * a;
    dy2 += b * b;
  }
  const den = Math.sqrt(dx2 * dy2);
  return den === 0 ? 0 : num / den;
}

// ──────────────────────────────────────────
// CORRELATION DETECTORS (from Real Feel logs)
// ──────────────────────────────────────────

/** Detect tag ↔ wellbeing level correlations */
function detectTagCorrelations(logs: RFEntry[]): CorrelationInsight[] {
  if (logs.length < 7) return [];
  const insights: CorrelationInsight[] = [];

  // Aggregate: for each tag, what's the average level?
  const tagStats: Record<string, { totalLevel: number; count: number; levels: number[] }> = {};

  for (const log of logs) {
    for (const tag of (log.tags || [])) {
      if (!tagStats[tag]) tagStats[tag] = { totalLevel: 0, count: 0, levels: [] };
      tagStats[tag].totalLevel += log.level;
      tagStats[tag].count++;
      tagStats[tag].levels.push(log.level);
    }
  }

  const overallAvg = logs.reduce((s, l) => s + l.level, 0) / logs.length;

  for (const [tag, stats] of Object.entries(tagStats)) {
    if (stats.count < 3) continue;
    const tagAvg = stats.totalLevel / stats.count;
    const diff = tagAvg - overallAvg;

    if (Math.abs(diff) < 0.5) continue;

    const tone: CorrelationTone = diff < -0.5 ? 'warning' : diff > 0.5 ? 'positive' : 'neutral';
    const emoji = tone === 'warning' ? '🔴' : tone === 'positive' ? '🟢' : '🟡';

    insights.push({
      id: `tag-${tag}`,
      tone,
      emoji,
      title: tag,
      detail: tone === 'warning'
        ? `${tag} aparece en ${stats.count} registros con bienestar bajo (avg ${tagAvg.toFixed(1)}/5)`
        : `${tag} aparece en ${stats.count} registros con bienestar alto (avg ${tagAvg.toFixed(1)}/5)`,
      confidence: Math.min(0.9, 0.4 + (Math.abs(diff) * 0.3) + (stats.count / logs.length) * 0.2),
    });
  }

  return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
}

/** Detect time-of-day ↔ wellbeing patterns */
function detectTimePatterns(logs: RFEntry[]): CorrelationInsight[] {
  if (logs.length < 10) return [];
  const insights: CorrelationInsight[] = [];

  // Group by hour of day
  const hourBuckets: Record<string, { levels: number[]; label: string }> = {
    morning: { levels: [], label: 'mañana (6-12h)' },
    afternoon: { levels: [], label: 'tarde (12-18h)' },
    evening: { levels: [], label: 'noche (18-24h)' },
  };

  for (const log of logs) {
    const hour = new Date(log.date).getHours();
    if (hour >= 6 && hour < 12) hourBuckets.morning.levels.push(log.level);
    else if (hour >= 12 && hour < 18) hourBuckets.afternoon.levels.push(log.level);
    else hourBuckets.evening.levels.push(log.level);
  }

  let bestBucket = '';
  let bestAvg = 0;
  let worstBucket = '';
  let worstAvg = 6;

  for (const [key, bucket] of Object.entries(hourBuckets)) {
    if (bucket.levels.length < 3) continue;
    const avg = bucket.levels.reduce((s, v) => s + v, 0) / bucket.levels.length;
    if (avg > bestAvg) { bestAvg = avg; bestBucket = key; }
    if (avg < worstAvg) { worstAvg = avg; worstBucket = key; }
  }

  if (bestBucket && worstBucket && bestBucket !== worstBucket && (bestAvg - worstAvg) > 0.8) {
    insights.push({
      id: 'time-pattern',
      tone: 'neutral',
      emoji: '🕐',
      title: 'Patrón horario',
      detail: `Te sientes mejor por la ${hourBuckets[bestBucket].label} (avg ${bestAvg.toFixed(1)}) vs ${hourBuckets[worstBucket].label} (avg ${worstAvg.toFixed(1)})`,
      confidence: 0.6,
    });
  }

  return insights;
}

/** Detect streak ↔ wellbeing trend (consistency helps) */
function detectConsistencyTrend(logs: RFEntry[]): CorrelationInsight | null {
  if (logs.length < 14) return null;

  const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  const avgFirst = firstHalf.reduce((s, l) => s + l.level, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, l) => s + l.level, 0) / secondHalf.length;

  const diff = avgSecond - avgFirst;
  if (Math.abs(diff) < 0.3) return null;

  return {
    id: 'trend-consistency',
    tone: diff > 0 ? 'positive' : 'warning',
    emoji: diff > 0 ? '📈' : '📉',
    title: diff > 0 ? 'Tendencia positiva' : 'Tendencia a la baja',
    detail: diff > 0
      ? `Tu bienestar mejoró de ${avgFirst.toFixed(1)} a ${avgSecond.toFixed(1)} en las últimas semanas. ¡Sigue así!`
      : `Tu bienestar bajó de ${avgFirst.toFixed(1)} a ${avgSecond.toFixed(1)}. Revisa descanso, variedad o hidratación.`,
    confidence: Math.min(0.85, 0.5 + Math.abs(diff) * 0.3),
  };
}

// ──────────────────────────────────────────
// INSIGHT RULES (heuristic, no ML)
// ──────────────────────────────────────────

function insightLowVariety(savedRecipes: any[], mealPlan: any): InsightRecommendation | null {
  // Count unique recipes used in plan this week
  const uniqueRecipes = new Set<string>();
  for (const dayMeals of Object.values(mealPlan || {})) {
    for (const meal of (dayMeals as any[]) || []) {
      if (meal.title) uniqueRecipes.add(meal.title);
    }
  }
  if (uniqueRecipes.size >= 5 || uniqueRecipes.size === 0) return null;

  return {
    id: 'low-variety',
    tone: 'warning',
    icon: '🥬',
    title: 'Poca variedad esta semana',
    detail: `Solo ${uniqueRecipes.size} receta${uniqueRecipes.size === 1 ? '' : 's'} distinta${uniqueRecipes.size === 1 ? '' : 's'} en tu plan. Diversificar ayuda a cubrir micronutrientes.`,
    confidence: 0.65,
    category: 'composition',
  };
}

function insightProteinTarget(dailyMacros: any): InsightRecommendation | null {
  if (!dailyMacros?.consumed || !dailyMacros?.target) return null;
  const ratio = dailyMacros.consumed.pro / dailyMacros.target.pro;

  if (ratio >= 0.8) return null;
  if (dailyMacros.consumed.pro === 0) return null;

  return {
    id: 'protein-low',
    tone: 'warning',
    icon: '🥩',
    title: 'Proteína por debajo del objetivo',
    detail: `Llevas ${dailyMacros.consumed.pro}g de ${dailyMacros.target.pro}g (${Math.round(ratio * 100)}%). Prioriza proteína en tu próxima comida.`,
    confidence: 0.7,
    category: 'composition',
  };
}

function insightHydration(hydration: any): InsightRecommendation | null {
  if (!hydration) return null;
  const ratio = hydration.consumed / hydration.target;
  if (ratio >= 0.6) return null;

  return {
    id: 'hydration-low',
    tone: 'warning',
    icon: '💧',
    title: 'Baja hidratación',
    detail: `${hydration.consumed}/${hydration.target} vasos. La hidratación afecta energía, digestión y concentración.`,
    confidence: 0.6,
    category: 'wellbeing',
  };
}

function insightStreak(streakDays: number): InsightRecommendation | null {
  if (streakDays < 3) return null;

  return {
    id: 'streak-motivation',
    tone: 'positive',
    icon: '🔥',
    title: `¡Racha de ${streakDays} días!`,
    detail: streakDays >= 30
      ? 'Un mes registrando. Tu historial de correlaciones es cada vez más preciso.'
      : streakDays >= 7
      ? 'Una semana consistente. Las correlaciones de Real Feel empiezan a mostrar patrones reales.'
      : `${streakDays} días seguidos. La consistencia es la clave del autoconocimiento.`,
    confidence: 0.8,
    category: 'adherence',
  };
}

function insightRealFeelProgress(rfLogs: RFEntry[]): InsightRecommendation | null {
  if (rfLogs.length >= 7) return null;
  if (rfLogs.length === 0) return null;

  return {
    id: 'realfeel-progress',
    tone: 'neutral',
    icon: '📓',
    title: 'Real Feel en progreso',
    detail: `${rfLogs.length}/7 días registrados. Las correlaciones aparecen tras 7 días consistentes.`,
    confidence: 0.5,
    category: 'wellbeing',
  };
}

/** Detect structured signal ↔ wellbeing correlations */
function detectSignalCorrelations(logs: RFEntry[]): CorrelationInsight[] {
  if (logs.length < 5) return [];
  const insights: CorrelationInsight[] = [];

  // Energy correlations
  const energyGroups: Record<string, number[]> = { high: [], stable: [], low: [] };
  for (const log of logs) {
    if (log.energy) energyGroups[log.energy].push(log.level);
  }
  const highEnergyAvg = energyGroups.high.length > 2
    ? energyGroups.high.reduce((s, v) => s + v, 0) / energyGroups.high.length : 0;
  const lowEnergyAvg = energyGroups.low.length > 2
    ? energyGroups.low.reduce((s, v) => s + v, 0) / energyGroups.low.length : 0;
  if (highEnergyAvg > 3.5 && energyGroups.high.length > 2) {
    insights.push({ id: 'signal-energy-high', tone: 'positive', emoji: '⚡', title: 'Alta energía = alto bienestar', detail: `Los días de alta energía tienes una puntuación promedio de ${highEnergyAvg.toFixed(1)}/5`, confidence: 0.75 });
  }
  if (lowEnergyAvg < 2.5 && energyGroups.low.length > 2) {
    insights.push({ id: 'signal-energy-low', tone: 'warning', emoji: '🔋', title: 'Baja energía recurrente', detail: `Detectados ${energyGroups.low.length} episodios de baja energía con bienestar bajo (${lowEnergyAvg.toFixed(1)}/5)`, confidence: 0.70 });
  }

  // Digestion correlations
  const bloatedLogs = logs.filter(l => l.digestion === 'bloated');
  if (bloatedLogs.length >= 2) {
    const bloatedAvg = bloatedLogs.reduce((s, l) => s + l.level, 0) / bloatedLogs.length;
    insights.push({ id: 'signal-digestion-bloated', tone: 'warning', emoji: '🌊', title: 'Hinchazón afecta el bienestar', detail: `${bloatedLogs.length} episodios de hinchazón con bienestar promedio ${bloatedAvg.toFixed(1)}/5. Revisa posibles triggers.`, confidence: 0.65 });
  }
  const cleanLogs = logs.filter(l => l.digestion === 'clean');
  if (cleanLogs.length >= 3) {
    const cleanAvg = cleanLogs.reduce((s, l) => s + l.level, 0) / cleanLogs.length;
    if (cleanAvg > 3.5) {
      insights.push({ id: 'signal-digestion-clean', tone: 'positive', emoji: '✅', title: 'Digestión limpia = mejor día', detail: `Los días con digestión limpia alcanzas bienestar promedio de ${cleanAvg.toFixed(1)}/5`, confidence: 0.70 });
    }
  }

  // Mindset correlations
  const stressedLogs = logs.filter(l => l.mindset === 'stressed');
  if (stressedLogs.length >= 2) {
    const stressedAvg = stressedLogs.reduce((s, l) => s + l.level, 0) / stressedLogs.length;
    insights.push({ id: 'signal-mindset-stressed', tone: 'warning', emoji: '😤', title: 'Estrés reduce el bienestar', detail: `Los días estresados tu bienestar es ${stressedAvg.toFixed(1)}/5. Considera descanso o mindfulness.`, confidence: 0.65 });
  }

  return insights;
}

// ──────────────────────────────────────────
// PUBLIC API
// ──────────────────────────────────────────

export function getCorrelations(realFeelLogs: RFEntry[]): CorrelationInsight[] {
  const results: CorrelationInsight[] = [];
  results.push(...detectTagCorrelations(realFeelLogs));
  results.push(...detectSignalCorrelations(realFeelLogs));
  results.push(...detectTimePatterns(realFeelLogs));
  const trend = detectConsistencyTrend(realFeelLogs);
  if (trend) results.push(trend);
  return results.sort((a, b) => b.confidence - a.confidence);
}

export function getInsights(ctx: {
  realFeelLogs: RFEntry[];
  savedRecipes: any[];
  mealPlan: any;
  dailyMacros: any;
  hydration: any;
  streakDays: number;
}): InsightRecommendation[] {
  const results: InsightRecommendation[] = [];

  const variety = insightLowVariety(ctx.savedRecipes, ctx.mealPlan);
  if (variety) results.push(variety);

  const protein = insightProteinTarget(ctx.dailyMacros);
  if (protein) results.push(protein);

  const water = insightHydration(ctx.hydration);
  if (water) results.push(water);

  const streak = insightStreak(ctx.streakDays);
  if (streak) results.push(streak);

  const rfProgress = insightRealFeelProgress(ctx.realFeelLogs);
  if (rfProgress) results.push(rfProgress);

  return results.sort((a, b) => b.confidence - a.confidence);
}
