/**
 * KcalBreakdownCard — onboarding plan-reveal breakdown.
 *
 * Renders the four components of the daily kcal target:
 *   Basal + Actividad + Entrenamientos + Objetivo = Total
 *
 * Pattern reference: INDYA onboarding step "cálculo basal + actividad".
 * The point is to turn the final number from a black-box into a transparent,
 * pedagogically legible calculation.
 *
 * Token-pure (no hex, no `dark:`). All copy is i18n-driven.
 */
import SectionCard from '@/components/SectionCard';
import { Heading, Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

import type { DailyTargetsBreakdown } from '../../food/utils/nutrition';

export interface KcalBreakdownCardProps {
  breakdown: DailyTargetsBreakdown;
  className?: string;
}

function signed(n: number): string {
  if (n === 0) return '0';
  return n > 0 ? `+${n}` : String(n);
}

export default function KcalBreakdownCard({
  breakdown,
  className = '',
}: KcalBreakdownCardProps) {
  const { t } = useI18n();
  const labels = t.onboarding.plan;

  /**
   * Row descriptor — `signed: false` means we render the raw number (basal
   * is always positive, no need for a "+" prefix). `positive` drives color:
   *   undefined  → tertiary (neutral)
   *   true       → primary (green-ish)
   *   false      → error (red)
   *
   * Hide the exercise row when value is 0 (model doesn't parameterise
   * per-session yet — showing "+0 kcal" is just noise).
   */
  const attr = labels.breakdownAttribution;

  const rows: {
    label: string;
    attribution: string;
    value: number;
    signed: boolean;
    positive?: boolean;
  }[] = [
    { label: labels.breakdownBasal,    attribution: attr.basal,    value: breakdown.basal,     signed: false },
    { label: labels.breakdownActivity, attribution: attr.activity,  value: breakdown.activity,  signed: true  },
    ...(breakdown.exercise !== 0
      ? [{ label: labels.breakdownExercise, attribution: attr.exercise, value: breakdown.exercise, signed: true }]
      : []),
    {
      label:       labels.breakdownObjective,
      attribution: attr.objective,
      value:       breakdown.objective,
      signed:      true,
      positive:    breakdown.objective >= 0,
    },
  ];

  return (
    <SectionCard padding="md" spacing="sm" className={className}>
      <Heading level="h4" variant="overline" className="mb-2">
        {labels.breakdownTitle}
      </Heading>

      <ul className="space-y-3">
        {rows.map(row => (
          <li key={row.label} className="flex items-start justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <Text variant="body-sm" as="span">
                {row.label}
              </Text>
              <Text variant="micro" as="span" className="text-on-surface-variant/60 leading-tight">
                {row.attribution}
              </Text>
            </div>
            <Text
              as="span"
              variant="body-sm"
              className={[
                'font-mono font-bold tabular-nums shrink-0',
                row.positive === false
                  ? 'text-error'
                  : row.positive === true
                    ? 'text-primary'
                    : 'text-tertiary',
              ].join(' ')}
            >
              {row.signed ? signed(row.value) : String(row.value)} kcal
            </Text>
          </li>
        ))}

        <li className="border-t border-outline-variant/20 pt-2 flex items-center justify-between">
          <Heading level="h4" variant="overline">
            {labels.breakdownTotal}
          </Heading>
          <Text
            as="span"
            variant="body-lg"
            className="font-mono font-black tabular-nums text-primary"
          >
            {breakdown.total} kcal
          </Text>
        </li>
      </ul>
    </SectionCard>
  );
}
