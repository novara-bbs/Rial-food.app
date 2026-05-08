import { Plus } from 'lucide-react';
import SectionCard from '../../../../components/SectionCard';
import { Heading, Text } from '../../../../components/ui/Typography';
import { Button } from '@/components/ui/button';
import MacroProgressRow from '../MacroProgressRow';
import { SALT_TO_SODIUM_MG_FACTOR } from '../../data/rda';
import type { Translations } from '../../../../i18n';
import type { computeDailyQuality } from '../../utils/daily-quality';

export interface HydrationTabProps {
  hydration: { consumed: number; target: number };
  isViewingToday: boolean;
  dailyQuality: ReturnType<typeof computeDailyQuality>;
  onAddCup: () => void;
  t: Translations;
}

export function HydrationTab({ hydration, isViewingToday, dailyQuality, onAddCup, t }: HydrationTabProps) {
  const sodiumMg = Math.round(dailyQuality.salt.value * SALT_TO_SODIUM_MG_FACTOR);

  const electrolyteRows = [
    { label: t.nutritionDetail.mineralsTab.labels.sodium,    value: sodiumMg > 0 ? `${sodiumMg} mg` : '—' },
    { label: t.nutritionDetail.mineralsTab.labels.potassium, value: '—' },
    { label: t.nutritionDetail.mineralsTab.labels.magnesium, value: '—' },
  ];

  return (
    <>
      <SectionCard padding="md" spacing="md">
        <Heading level="h3" variant="overline">{t.nutritionDetail.hydrationSection}</Heading>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 min-w-0">
            <MacroProgressRow
              label={t.home.water}
              consumed={hydration.consumed}
              target={hydration.target}
              colorClassName="bg-primary"
              unit={` ${t.home.cups}`}
              barHeight="md"
              testId="detail-hydration-row"
            />
          </div>
          {isViewingToday && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onAddCup}
              aria-label={t.home.addWater}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </SectionCard>

      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.home.hydration.electrolytes}</Heading>
        <ul className="divide-y divide-outline-variant/10">
          {electrolyteRows.map((row) => (
            <li key={row.label} className="flex items-baseline justify-between py-2.5 first:pt-0 last:pb-0">
              <Text variant="body-sm" className="font-body text-on-surface">{row.label}</Text>
              <Text variant="body-sm" className="font-body tabular-nums text-on-surface-variant italic">{row.value}</Text>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
