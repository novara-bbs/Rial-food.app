import { Zap, BarChart3, ShieldCheck } from 'lucide-react';
import SectionCard from '../../../../components/SectionCard';
import { Heading, Text } from '../../../../components/ui/Typography';
import { CalorieRing } from '../NutritionHeroRing';
import type { Translations } from '../../../../i18n';
import type { DailyMacros } from '../../../../contexts/state/useVitalsState';
import type { computeDailyQuality } from '../../utils/daily-quality';

export interface SummaryTabProps {
  effectiveDailyMacros: DailyMacros;
  dailyQuality: ReturnType<typeof computeDailyQuality>;
  remaining: number;
  onSwitchTab: (id: string) => void;
  t: Translations;
}

export function SummaryTab({ effectiveDailyMacros, dailyQuality, remaining, onSwitchTab, t }: SummaryTabProps) {
  const score = dailyQuality.coverageScore;
  const scoreColor = score >= 70 ? 'text-primary' : score >= 40 ? 'text-tertiary' : 'text-error';

  const tiles = [
    {
      icon: Zap,
      label: t.nutritionDetail.tabs.macros,
      display: `${effectiveDailyMacros.consumed.cal}`,
      unit: 'kcal',
      tab: 'macros',
      valueClass: 'text-primary',
    },
    {
      icon: BarChart3,
      label: t.home.protein,
      display: `${Math.round(effectiveDailyMacros.consumed.pro)}`,
      unit: 'g',
      tab: 'macros',
      valueClass: 'text-on-surface',
    },
    {
      icon: ShieldCheck,
      label: t.nutritionDetail.tabs.quality,
      display: `${score}`,
      unit: '/100',
      tab: 'quality',
      valueClass: scoreColor,
    },
  ];

  return (
    <>
      <SectionCard padding="lg" spacing="md">
        <div className="flex flex-col items-center gap-3">
          <CalorieRing
            consumed={effectiveDailyMacros.consumed.cal}
            target={effectiveDailyMacros.target.cal}
            size={200}
            ariaLabel={t.home.ringAriaLabel.replace('{remaining}', String(remaining))}
            layout="consumed-target"
            consumedLabel={t.home.consumed}
            targetLabel={t.home.target}
            remainingLabel={t.home.remaining}
          />
        </div>
      </SectionCard>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map(({ icon: Icon, label, display, unit, tab, valueClass }) => (
          <button
            key={tab + label}
            type="button"
            onClick={() => onSwitchTab(tab)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-sm bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container-highest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Icon className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
            <div className="flex items-baseline gap-0.5">
              <span className={`font-headline font-bold text-title-sm tabular-nums ${valueClass}`}>{display}</span>
              <span className="font-body text-micro text-on-surface-variant">{unit}</span>
            </div>
            <span className="font-label text-label font-semibold uppercase tracking-widest text-on-surface-variant text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.nutritionDetail.summary.recommendation}</Heading>
        <Text variant="body-sm" className="font-body text-on-surface-variant leading-relaxed">
          {t.nutritionDetail.summary.intro}
        </Text>
      </SectionCard>
    </>
  );
}
