import SectionCard from '@/components/SectionCard';
import { Heading, Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

import KcalBreakdownCard from '../components/KcalBreakdownCard';
import OnboardingScaffold from '../components/OnboardingScaffold';
import { previewBreakdown } from '../derive/derive-targets';
import { useCountUp } from '../hooks/useCountUp';
import type { OnboardingDraft } from '../state/types';

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
  const animated = useCountUp(targetKcal, 1200);

  const title = draft.name
    ? copy.titleNamed.replace('{name}', draft.name)
    : copy.title;

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
          <Heading level="h4" variant="overline">
            {copy.dailyKcal}
          </Heading>
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
