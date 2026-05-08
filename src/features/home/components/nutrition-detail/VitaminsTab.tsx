import SectionCard from '../../../../components/SectionCard';
import { Heading } from '../../../../components/ui/Typography';
import SmartInsightCard from '../SmartInsightCard';
import NutritionRow from '../NutritionRow';
import { VITAMIN_RDAS, type VitaminKey } from '../../data/rda';
import type { Translations } from '../../../../i18n';

export interface VitaminsTabProps {
  t: Translations;
}

export function VitaminsTab({ t }: VitaminsTabProps) {
  const labels = t.nutritionDetail.vitaminsTab.labels as Record<VitaminKey, string>;
  return (
    <>
      <SmartInsightCard
        tone="neutral"
        message={t.nutritionDetail.vitaminsTab.placeholderBanner}
      />
      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.nutritionDetail.vitaminsTab.title}</Heading>
        <div className="divide-y divide-outline-variant/10">
          {(Object.keys(VITAMIN_RDAS) as VitaminKey[]).map((key) => (
            <NutritionRow
              key={key}
              label={labels[key] ?? key}
              consumed={null}
              rda={VITAMIN_RDAS[key].rda}
              unit={VITAMIN_RDAS[key].unit}
              rdaCaption={t.nutritionDetail.vitaminsTab.rdaCaption}
              noDataLabel={t.nutritionDetail.notTracked}
            />
          ))}
        </div>
      </SectionCard>
    </>
  );
}
