/**
 * Phase 1 rework — HomeQuickStats chip-row.
 *
 * Conservative density pass: a single horizontally-scrollable row of tinted
 * chips that surfaces secondary metrics (hydration, weight delta, activity,
 * insights) without opening new bottom sheets. Each chip is a `<button>` that
 * calls `onNavigate(target)` — Home.tsx resolves each target to an existing
 * route or focus action. See `razona-el-header-de-generic-cocke.md` §3.
 *
 * Mode behavior:
 *   - `simple` — omits the row entirely (a single chip looks lonely and
 *     breaks the rhythm; the Hydration card already covers the data).
 *   - `advanced` — renders 3-4 chips depending on data availability.
 *
 * Layout:
 *   - Wrapper: `flex flex-wrap gap-2 overflow-x-auto -mx-6 px-6 snap-x` —
 *     horizontal scroll at ≤320px without breaking the `PageShell px-6` gutter.
 *   - Each chip: `min-h-11` HIG-compliant touch target, `rounded-full`,
 *     subtle `shadow-elev-1`, theme-token colors only.
 */
import type { ReactElement } from 'react';
import { Droplets, TrendingDown, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { useI18n } from '../../../i18n';

export type QuickStatTarget = 'hydration' | 'progress' | 'activity' | 'insights';

interface HomeQuickStatsProps {
  mode: 'simple' | 'advanced';
  hydration: { consumed: number; target: number };
  weightDelta?: { value: number; unit: 'kg' | 'lb'; since: 'week' | 'month' };
  activityToday?: { minutes: number; isTrainingDay: boolean };
  insightCount?: number;
  onNavigate: (target: QuickStatTarget) => void;
}

const CHIP_BASE =
  'inline-flex items-center gap-1.5 min-h-11 px-3 rounded-full border border-outline-variant bg-surface shadow-elev-1 hover:bg-surface-container transition-colors whitespace-nowrap font-headline text-micro font-semibold normal-case tracking-normal snap-start';

export default function HomeQuickStats({
  mode,
  hydration,
  weightDelta,
  activityToday,
  insightCount = 0,
  onNavigate,
}: HomeQuickStatsProps) {
  const { t } = useI18n();

  if (mode === 'simple') return null;

  const chips: Array<{ key: QuickStatTarget; node: ReactElement }> = [];

  chips.push({
    key: 'hydration',
    node: (
      <button
        key="hydration"
        type="button"
        onClick={() => onNavigate('hydration')}
        className={CHIP_BASE}
        aria-label={`${t.home.quickHydration}: ${hydration.consumed} / ${hydration.target}`}
      >
        <Droplets className="w-3.5 h-3.5 text-brand-secondary" aria-hidden="true" />
        <span className="text-tertiary">
          {hydration.consumed} / {hydration.target}
        </span>
      </button>
    ),
  });

  if (weightDelta && Number.isFinite(weightDelta.value)) {
    const Arrow = weightDelta.value >= 0 ? TrendingUp : TrendingDown;
    const signed = `${weightDelta.value > 0 ? '+' : ''}${weightDelta.value.toFixed(1)} ${weightDelta.unit}`;
    chips.push({
      key: 'progress',
      node: (
        <button
          key="progress"
          type="button"
          onClick={() => onNavigate('progress')}
          className={CHIP_BASE}
          aria-label={`${t.home.quickWeight}: ${signed}`}
        >
          <Arrow className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span className="text-tertiary">{signed}</span>
        </button>
      ),
    });
  }

  if (activityToday && activityToday.minutes > 0) {
    chips.push({
      key: 'activity',
      node: (
        <button
          key="activity"
          type="button"
          onClick={() => onNavigate('activity')}
          className={CHIP_BASE}
          aria-label={`${t.home.quickActivity}: ${activityToday.minutes} min`}
        >
          <Activity className="w-3.5 h-3.5 text-brand-secondary" aria-hidden="true" />
          <span className="text-tertiary">
            {activityToday.minutes} min
            {activityToday.isTrainingDay && ` · ${t.home.quickTraining}`}
          </span>
        </button>
      ),
    });
  }

  if (insightCount > 0) {
    chips.push({
      key: 'insights',
      node: (
        <button
          key="insights"
          type="button"
          onClick={() => onNavigate('insights')}
          className={CHIP_BASE}
          aria-label={`${insightCount} ${t.home.quickInsights}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span className="text-tertiary">
            {insightCount} {t.home.quickInsights}
          </span>
        </button>
      ),
    });
  }

  if (chips.length === 0) return null;

  return (
    <nav
      aria-label={t.home.quickInsights}
      data-testid="home-quick-stats"
      className="flex flex-nowrap gap-2 overflow-x-auto -mx-6 px-6 snap-x scrollbar-none"
    >
      {chips.map((c) => c.node)}
    </nav>
  );
}
