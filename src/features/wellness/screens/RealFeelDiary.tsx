import { ArrowLeft, TrendingUp, TrendingDown, Minus, Zap, Leaf, Brain, UtensilsCrossed } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { getCorrelations, getFoodInsights } from '../utils/correlations';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const EMOJI_MAP = ['😴', '😕', '😐', '😊', '💪'];

function getEnergyLabels(t: any): Record<string, string> {
  return { high: `⚡ ${t.realFeel.signals.energyHigh}`, stable: `〰 ${t.realFeel.signals.energyStable}`, low: `🔋 ${t.realFeel.signals.energyLow}` };
}
function getDigestionLabels(t: any): Record<string, string> {
  return { clean: `✅ ${t.realFeel.signals.digestionClean}`, sensitive: `⚠ ${t.realFeel.signals.digestionSensitive}`, bloated: `❌ ${t.realFeel.signals.digestionBloated}` };
}
function getMindsetLabels(t: any): Record<string, string> {
  return { calm: `🧘 ${t.realFeel.signals.mindsetCalm}`, balanced: `⚖ ${t.realFeel.signals.mindsetBalanced}`, stressed: `😤 ${t.realFeel.signals.mindsetStressed}` };
}

function calculateRealScore(logs: any[]): number {
  if (!logs.length) return 0;
  const recent = logs.slice(0, 14);
  const avg = recent.reduce((sum: number, l: any) => sum + (l.level || 3), 0) / recent.length;
  return Math.round((avg / 5) * 100);
}

// Derive "Daily Realities" insight cards from log history
function getDailyRealities(logs: any[], t: any) {
  if (logs.length < 3) return [];
  const realities = [];
  const recent = logs.slice(0, 7);
  const d = t.realFeel.realities;

  const highEnergyDays = recent.filter(l => l.energy === 'high' || (l.level >= 4)).length;
  if (highEnergyDays >= 4) {
    realities.push({ icon: '⚡', label: d.highVitality, value: `${highEnergyDays}/7 ${d.days}`, tone: 'positive' });
  }

  const cleanDigestionDays = recent.filter(l => l.digestion === 'clean').length;
  if (cleanDigestionDays >= 3) {
    realities.push({ icon: '🌱', label: d.cleanDigestion, value: `${cleanDigestionDays} ${d.days}`, tone: 'positive' });
  }

  const bloatedDays = recent.filter(l => l.digestion === 'bloated' || l.tags?.includes('bloating')).length;
  if (bloatedDays >= 2) {
    realities.push({ icon: '⚠️', label: d.recurringBloating, value: `${bloatedDays} ${d.days}`, tone: 'warning' });
  }

  const stressedDays = recent.filter(l => l.mindset === 'stressed').length;
  if (stressedDays >= 2) {
    realities.push({ icon: '😤', label: d.frequentStress, value: `${stressedDays} ${d.days}`, tone: 'warning' });
  }

  if (recent.length >= 5) {
    realities.push({ icon: '🔥', label: d.logStreak, value: `${recent.length} ${d.days}`, tone: 'positive' });
  }

  const lowEnergyDays = recent.filter(l => l.energy === 'low' || l.level <= 2).length;
  if (lowEnergyDays >= 3) {
    realities.push({ icon: '🔋', label: d.lowEnergyWeek, value: `${lowEnergyDays}/7 ${d.days}`, tone: 'warning' });
  }

  return realities.slice(0, 4);
}

// Derive weekly signal patterns
function getWeeklyPatterns(logs: any[]) {
  if (logs.length < 5) return null;
  const recent = logs.slice(0, 7);

  const energyCounts: Record<string, number> = { high: 0, stable: 0, low: 0 };
  const digestionCounts: Record<string, number> = { clean: 0, sensitive: 0, bloated: 0 };

  for (const log of recent) {
    if (log.energy) energyCounts[log.energy] = (energyCounts[log.energy] || 0) + 1;
    if (log.digestion) digestionCounts[log.digestion] = (digestionCounts[log.digestion] || 0) + 1;
  }

  const topEnergy = Object.entries(energyCounts).sort((a, b) => b[1] - a[1])[0];
  const topDigestion = Object.entries(digestionCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    energy: topEnergy[1] > 0 ? topEnergy[0] : null,
    digestion: topDigestion[1] > 0 ? topDigestion[0] : null,
  };
}

export default function RealFeelDiary({ realFeelLogs = [], onBack }: { realFeelLogs: any[]; onBack: () => void }) {
  const { t } = useI18n();
  const { dictionary } = useAppState();
  const ENERGY_LABELS = getEnergyLabels(t);
  const DIGESTION_LABELS = getDigestionLabels(t);
  const MINDSET_LABELS = getMindsetLabels(t);
  const realScore = calculateRealScore(realFeelLogs);
  const correlations = getCorrelations(realFeelLogs);
  const foodInsights = getFoodInsights(realFeelLogs, dictionary);
  const needsMoreData = realFeelLogs.length < 7;
  const dailyRealities = getDailyRealities(realFeelLogs, t);
  const weeklyPatterns = getWeeklyPatterns(realFeelLogs);

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">{t.realFeel.diary}</h1>
      </div>

      {/* Real Score */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{t.realFeel.score}</span>
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
            {realFeelLogs.length} {t.home.days}
          </span>
        </div>
        <div className="flex items-end gap-4">
          <span className="font-mono text-5xl font-black text-primary">{realScore}</span>
          <span className="text-on-surface-variant text-sm mb-2">/100</span>
        </div>
        {realFeelLogs.length >= 3 ? (
          <div className="mt-4 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={
                [...realFeelLogs].reverse().slice(-14).map((l: any) => ({
                  name: new Date(l.date).toLocaleDateString(undefined, { weekday: 'short' }),
                  score: ((l.level || 3) / 5) * 100,
                }))
              }>
                <defs>
                  <linearGradient id="rfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #dcfd05)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary, #dcfd05)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-on-surface-variant, #888)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ background: 'var(--color-surface-container, #222)', border: '1px solid var(--color-outline-variant, #333)', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="score" stroke="var(--color-primary, #dcfd05)" strokeWidth={2} fill="url(#rfGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-end gap-1 mt-4 h-12">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t bg-outline-variant/20" style={{ height: '10%', minHeight: 4 }} />
                <span className="text-[8px] text-on-surface-variant">{t.realFeel.dayAbbr[i]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Realities */}
      {dailyRealities.length > 0 && (
        <div>
          <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-3">{t.realFeel.dailyRealities}</h2>
          <div className="grid grid-cols-2 gap-3">
            {dailyRealities.map((r, i) => (
              <div key={i} className={`p-4 rounded-sm border ${r.tone === 'positive' ? 'bg-primary/5 border-primary/20' : 'bg-error/5 border-error/20'}`}>
                <div className="text-xl mb-2">{r.icon}</div>
                <p className="font-headline text-xs font-bold uppercase tracking-wide text-tertiary">{r.label}</p>
                <p className={`font-label text-xs font-bold mt-1 ${r.tone === 'positive' ? 'text-primary' : 'text-error'}`}>{r.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food ↔ Feeling Insights */}
      {foodInsights.length > 0 && (
        <div>
          <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-3">{t.realFeel.foodInsights}</h2>
          <div className="space-y-2">
            {foodInsights.map((fi) => (
              <div key={fi.ingredientId} className={`p-4 rounded-sm border flex items-center gap-3 ${
                fi.tone === 'positive' ? 'bg-primary/5 border-primary/20' : fi.tone === 'warning' ? 'bg-error/5 border-error/20' : 'bg-surface-container-low border-outline-variant/20'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  fi.tone === 'positive' ? 'bg-primary/20 text-primary' : fi.tone === 'warning' ? 'bg-error/20 text-error' : 'bg-brand-secondary/20 text-brand-secondary'
                }`}>
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-sm font-bold uppercase text-tertiary truncate">{fi.ingredientName}</p>
                  <p className="text-xs text-on-surface-variant">
                    {t.realFeel.insightLogs.replace('{count}', String(fi.count))} · avg {fi.avgLevel.toFixed(1)}/5
                    {fi.dominantTag && <span className="ml-1 text-[9px] bg-surface-container-highest px-1.5 py-0.5 rounded">{fi.dominantTag}</span>}
                  </p>
                </div>
                <span className="text-lg shrink-0">{fi.tone === 'positive' ? '🟢' : fi.tone === 'warning' ? '🔴' : '🟡'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Patterns */}
      {weeklyPatterns && (weeklyPatterns.energy || weeklyPatterns.digestion) && (
        <div>
          <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-3">{t.realFeel.weeklyPatterns}</h2>
          <div className="flex gap-3">
            {weeklyPatterns.energy && (
              <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{t.realFeel.energy}</p>
                  <p className="font-headline text-xs font-bold text-tertiary uppercase">{ENERGY_LABELS[weeklyPatterns.energy]}</p>
                </div>
              </div>
            )}
            {weeklyPatterns.digestion && (
              <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{t.realFeel.digestion}</p>
                  <p className="font-headline text-xs font-bold text-tertiary uppercase">{DIGESTION_LABELS[weeklyPatterns.digestion]}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Correlations */}
      <div>
        <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-4">{t.realFeel.correlations}</h2>
        {needsMoreData ? (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-8 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-on-surface-variant text-sm">{t.realFeel.insights.noDataYet}</p>
            <div className="mt-4 w-full bg-surface-container-highest rounded-full h-2">
              <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${(realFeelLogs.length / 7) * 100}%` }} />
            </div>
            <p className="text-xs text-on-surface-variant mt-2">{t.realFeel.insights.progress.replace('{current}', String(realFeelLogs.length))}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {correlations.map((cor, i) => (
              <div key={cor.id || i} className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  cor.tone === 'warning' ? 'bg-error' : cor.tone === 'positive' ? 'bg-primary' : 'bg-brand-secondary'
                }`}>
                  {cor.tone === 'warning' ? <TrendingDown className="w-5 h-5" /> : cor.tone === 'positive' ? <TrendingUp className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-headline text-sm font-bold uppercase text-tertiary">{cor.title}</p>
                  <p className="text-xs text-on-surface-variant">{cor.detail}</p>
                </div>
                <span className="text-lg">{cor.emoji}</span>
              </div>
            ))}
            {correlations.length === 0 && (
              <p className="text-center text-on-surface-variant text-sm py-8">{t.realFeel.insights.noDataYet}</p>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div>
        <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-4">{t.realFeel.timeline}</h2>
        <div className="space-y-2">
          {realFeelLogs.slice(0, 20).map((log: any, i: number) => (
            <div key={log.id || i} className="flex items-start gap-4 p-3 bg-surface-container-low border border-outline-variant/20 rounded-sm">
              <span className="text-2xl shrink-0">{EMOJI_MAP[(log.level || 3) - 1]}</span>
              <div className="flex-1 min-w-0">
                {/* Structured signals row */}
                {(log.energy || log.digestion || log.mindset) && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {log.energy && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> {ENERGY_LABELS[log.energy]}
                      </span>
                    )}
                    {log.digestion && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Leaf className="w-2.5 h-2.5" /> {DIGESTION_LABELS[log.digestion]}
                      </span>
                    )}
                    {log.mindset && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Brain className="w-2.5 h-2.5" /> {MINDSET_LABELS[log.mindset]}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {(log.tags || []).map((tag: string, j: number) => (
                    <span key={j} className="text-[9px] font-bold uppercase tracking-wider bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">{tag}</span>
                  ))}
                </div>
                {log.note && <p className="text-xs text-on-surface-variant mt-1 truncate">{log.note}</p>}
              </div>
              <span className="text-[10px] text-on-surface-variant shrink-0">
                {log.date ? new Date(log.date).toLocaleDateString() : ''}
              </span>
            </div>
          ))}
          {realFeelLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">📓</div>
              <p className="text-on-surface-variant text-sm">{t.empty.diaryEmpty}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
