import SectionCard from '../../../../components/SectionCard';
import { Heading } from '../../../../components/ui/Typography';
import SmartInsightCard from '../SmartInsightCard';
import NutritionRow from '../NutritionRow';
import { MINERAL_RDAS, type MineralKey } from '../../data/rda';
import type { Translations } from '../../../../i18n';

export interface MineralsTabProps {
  t: Translations;
}

export function MineralsTab({ t }: MineralsTabProps) {
  const labels = t.nutritionDetail.mineralsTab.labels as Record<MineralKey, string>;
  return (
    <>
      <SmartInsightCard
        tone="neutral"
        message={t.nutritionDetail.mineralsTab.placeholderBanner}
      />
      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.nutritionDetail.mineralsTab.title}</Heading>
        <div className="divide-y divide-outline-variant/10">
          {(Object.keys(MINERAL_RDAS) as MineralKey[]).map((key) => (
            <NutritionRow
              key={key}
              label={labels[key] ?? key}
              consumed={null}
              rda={MINERAL_RDAS[key].rda}
              unit={MINERAL_RDAS[key].unit}
              rdaCaption={t.nutritionDetail.vitaminsTab.rdaCaption}
              noDataLabel={t.nutritionDetail.notTracked}
            />
          ))}
        </div>
      </SectionCard>
    </>
  );
}
