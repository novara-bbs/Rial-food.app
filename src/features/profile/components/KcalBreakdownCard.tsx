/**
 * KcalBreakdownCard — R8.1 (INDYA onboarding pattern IMG_1215).
 *
 * Renders the four components of a user's daily kcal target:
 *   Basal + Actividad + Entrenamientos + Objetivo = Total
 *
 * This turns the final number from a black-box into a transparent,
 * pedagogically legible calculation. Pattern: INDYA onboarding step 3.
 *
 * Usage:
 *   <KcalBreakdownCard breakdown={breakdown} showTooltip />
 *
 * Reused in:
 *  - Onboarding.tsx step 3 (primary)
 *  - SettingsNutrition.tsx macros section (secondary)
 */
import { Info } from 'lucide-react';
import { useState } from 'react';
import SectionCard from '../../../components/SectionCard';
import { useI18n } from '../../../i18n';
import type { DailyTargetsBreakdown } from '../../food/utils/nutrition';

export interface KcalBreakdownCardProps {
  breakdown: DailyTargetsBreakdown;
  /** Show a "¿Cómo se calcula?" info tooltip trigger. Default false. */
  showTooltip?: boolean;
  className?: string;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function KcalBreakdownCard({
  breakdown,
  showTooltip = false,
  className = '',
}: KcalBreakdownCardProps) {
  const { t } = useI18n();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const b = (t as any).kcalBreakdown ?? {};

  const rows: { label: string; value: number; positive?: boolean }[] = [
    { label: b.basal ?? 'Metabolismo basal', value: breakdown.basal },
    { label: b.activity ?? 'Actividad diaria', value: breakdown.activity },
    { label: b.exercise ?? 'Entrenamientos', value: breakdown.exercise },
    { label: b.objective ?? 'Objetivo', value: breakdown.objective, positive: breakdown.objective >= 0 },
  ];

  const signedStr = (n: number): string => {
    if (n === 0) return '0';
    return n > 0 ? `+${n}` : String(n);
  };

  return (
    <SectionCard padding="md" spacing="sm" className={className}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-headline font-bold text-xs uppercase tracking-widest text-tertiary">
          {b.title ?? '¿Cómo se calcula tu objetivo?'}
        </p>
        {showTooltip && (
          <button
            type="button"
            onClick={() => setTooltipOpen((v) => !v)}
            aria-label={b.tooltipAriaLabel ?? '¿Cómo se calcula?'}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {showTooltip && tooltipOpen && (
        <p className="font-label text-micro text-on-surface-variant mb-3 leading-relaxed">
          {b.tooltipText ?? 'Se calcula sumando tu metabolismo basal (energía en reposo), el gasto por actividad diaria, los entrenamientos y el ajuste según tu objetivo nutricional.'}
        </p>
      )}

      {/* Component rows */}
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="font-label text-sm text-on-surface">{row.label}</span>
            <span className={`font-mono font-bold text-sm ${
              row.positive === false
                ? 'text-error'
                : row.positive === true
                  ? 'text-primary'
                  : 'text-tertiary'
            }`}>
              {row.value === breakdown.basal ? String(row.value) : signedStr(row.value)} kcal
            </span>
          </div>
        ))}

        {/* Divider + total */}
        <div className="border-t border-outline-variant/20 pt-2 flex items-center justify-between">
          <span className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary">
            {b.total ?? 'Total'}
          </span>
          <span className="font-mono font-black text-lg text-primary">
            {breakdown.total} kcal
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
