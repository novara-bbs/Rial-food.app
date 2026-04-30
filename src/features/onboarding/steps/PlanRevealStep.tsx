/**
 * PlanRevealStep — read-only summary of the calculated daily targets.
 *
 * Doesn't dispatch — runs `previewBreakdown(draft)` (a thin wrapper over
 * `nutrition.ts`) and animates the kcal target with `useCountUp`. Below the
 * hero number, shows a min/max range (±`KCAL_RANGE_PERCENT`) so the user
 * understands the target is a guideline, not a hard number.
 */
import SectionCard from '@/components/SectionCard';
import { Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

import KcalBreakdownCard from '../components/KcalBreakdownCard';
import OnboardingScaffold from '../components/OnboardingScaffold';
import { previewBreakdown } from '../derive/derive-targets';
import { useCountUp } from '../hooks/useCountUp';
import type { OnboardingDraft } from '../state/types';
import { interpolateName } from '../utils/copy';

/**
 * ±5% of the target — realistic daily variability of intake. Bumping this
 * widens the displayed range without touching the underlying calculation.
 */
const KCAL_RANGE_PERCENT = 0.05;

export default function PlanRevealStep({
  draft,
  titleId,
}: {
  draft: OnboardingDraft;
  titleId: string;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.plan;

  const breakdown = previewBreakdown(draft);
  const targetKcal = breakdown?.total ?? 0;
  const kcalMin = breakdown ? Math.round(targetKcal * (1 - KCAL_RANGE_PERCENT)) : 0;
  const kcalMax = breakdown ? Math.round(targetKcal * (1 + KCAL_RANGE_PERCENT)) : 0;
  const animated = useCountUp(targetKcal, 1200);

  const title = interpolateName(copy.titleNamed, copy.title, draft.name);

  return (
    <OnboardingScaffold
      titleId={titleId}
      variant="centered"
      title={title}
      subtitle={copy.subtitle}
    >
      <div className="w-full space-y-4">
        {/* Big-number kcal reveal — aria-live so it announces after the count-up. */}
        <SectionCard padding="md" spacing="sm" className="text-center">
          <Text variant="body-sm" as="div" className="font-medium text-on-surface-variant">
            {copy.dailyKcal}
          </Text>
          <p
            role="status"
            aria-live="polite"
            className="font-mono font-black text-headline text-primary tabular-nums"
          >
            {animated}
            <span className="text-body-lg align-baseline ml-2 text-on-surface-variant font-medium">
              kcal
            </span>
          </p>
          {/* kcal range (±5%) — shows after the count-up settles */}
          {breakdown && (
            <p className="text-caption text-on-surface-variant mt-1 font-mono tabular-nums">
              {kcalMin}
              {copy.kcalRangeSep}
              {kcalMax} kcal
            </p>
          )}
        </SectionCard>

        {/* Macro grid */}
        {breakdown && (
          <SectionCard padding="md" spacing="none">
            <ul className="grid grid-cols-3 divide-x divide-outline-variant/15">
              <li className="px-2 text-center">
                <Text variant="caption" as="span">
                  {copy.macros.protein}
                </Text>
                <p className="font-mono font-bold text-body-lg tabular-nums text-tertiary">
                  {breakdown.pro}
                  <span className="text-caption text-on-surface-variant ml-0.5">
                    {copy.macroUnit}
                  </span>
                </p>
              </li>
              <li className="px-2 text-center">
                <Text variant="caption" as="span">
                  {copy.macros.carbs}
                </Text>
                <p className="font-mono font-bold text-body-lg tabular-nums text-tertiary">
                  {breakdown.carbs}
                  <span className="text-caption text-on-surface-variant ml-0.5">
                    {copy.macroUnit}
                  </span>
                </p>
              </li>
              <li className="px-2 text-center">
                <Text variant="caption" as="span">
                  {copy.macros.fats}
                </Text>
                <p className="font-mono font-bold text-body-lg tabular-nums text-tertiary">
                  {breakdown.fats}
                  <span className="text-caption text-on-surface-variant ml-0.5">
                    {copy.macroUnit}
                  </span>
                </p>
              </li>
            </ul>
          </SectionCard>
        )}

        {breakdown && <KcalBreakdownCard breakdown={breakdown} />}

        <Text variant="caption" className="text-center">
          {copy.adjustLater}
        </Text>
      </div>
    </OnboardingScaffold>
  );
}
