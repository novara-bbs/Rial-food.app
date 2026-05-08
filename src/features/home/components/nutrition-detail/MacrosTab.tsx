import SectionCard from '../../../../components/SectionCard';
import { Heading, Text } from '../../../../components/ui/Typography';
import MacroProgressRow from '../MacroProgressRow';
import { DEFAULT_FIBER_TARGET_G } from '../../data/rda';
import type { Translations } from '../../../../i18n';
import type { DailyMacros } from '../../../../contexts/state/useVitalsState';
import type { computeDailyQuality } from '../../utils/daily-quality';

export interface MacrosTabProps {
  effectiveDailyMacros: DailyMacros;
  dailyQuality: ReturnType<typeof computeDailyQuality>;
  t: Translations;
}

export function MacrosTab({ effectiveDailyMacros, dailyQuality, t }: MacrosTabProps) {
  const macroRows = [
    { key: 'carbs',   label: t.home.carbs,   consumed: effectiveDailyMacros.consumed.carbs,         target: effectiveDailyMacros.target.carbs,         color: 'bg-macro-carbs'   },
    { key: 'protein', label: t.home.protein, consumed: effectiveDailyMacros.consumed.pro,           target: effectiveDailyMacros.target.pro,           color: 'bg-macro-protein' },
    { key: 'fats',    label: t.home.fats,    consumed: effectiveDailyMacros.consumed.fats,          target: effectiveDailyMacros.target.fats,          color: 'bg-macro-fats'    },
    { key: 'fiber',   label: t.home.fiber,   consumed: effectiveDailyMacros.consumed.fiber ?? 0,    target: effectiveDailyMacros.target.fiber ?? DEFAULT_FIBER_TARGET_G, color: 'bg-macro-fiber' },
  ];

  const extras = [
    { key: 'sugar',        label: t.nutritionDetail.sugar,        value: dailyQuality.sugar.value,        target: dailyQuality.sugar.target,        unit: 'g', partial: dailyQuality.sugar.partial },
    { key: 'saturatedFat', label: t.nutritionDetail.saturatedFat, value: dailyQuality.saturatedFat.value, target: dailyQuality.saturatedFat.target, unit: 'g', partial: dailyQuality.saturatedFat.partial },
  ];

  return (
    <>
      <SectionCard padding="lg" spacing="md">
        <div className="space-y-6">
          {macroRows.map((m) => (
            <MacroProgressRow
              key={m.key}
              label={m.label}
              consumed={m.consumed}
              target={m.target}
              colorClassName={m.color}
              barHeight="md"
              testId={`detail-macro-${m.key}`}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.nutritionDetail.extraSection}</Heading>
        <ul className="divide-y divide-outline-variant/10">
          {extras.map((row) => (
            <li key={row.key} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <Text variant="body-sm" className="font-body font-medium text-on-surface">
                {row.label}
              </Text>
              <Text variant="body-sm" className={`font-body tabular-nums ${row.partial ? 'italic text-on-surface-variant' : 'text-on-surface'}`}>
                {row.partial
                  ? t.nutritionDetail.notTracked
                  : `${Math.round(row.value)}${row.unit} / ${row.target}${row.unit}`}
              </Text>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
