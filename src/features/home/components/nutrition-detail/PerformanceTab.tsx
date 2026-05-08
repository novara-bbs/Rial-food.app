import { TrendingUp, ChevronRight } from 'lucide-react';
import SectionCard from '../../../../components/SectionCard';
import { Text } from '../../../../components/ui/Typography';
import type { Translations } from '../../../../i18n';

export interface PerformanceTabProps {
  onNavigateToProgress: () => void;
  t: Translations;
}

export function PerformanceTab({ onNavigateToProgress, t }: PerformanceTabProps) {
  return (
    <SectionCard padding="lg" spacing="md">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <TrendingUp className="w-10 h-10 text-on-surface-variant" aria-hidden="true" />
        <Text variant="body-sm" className="font-body text-on-surface-variant max-w-xs mx-auto">
          {t.nutritionDetail.performanceTab.empty}
        </Text>
        <button
          type="button"
          onClick={onNavigateToProgress}
          className="flex items-center gap-2 font-body text-body-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
          data-testid="view-progress-cta"
        >
          {t.nutritionDetail.performanceTab.viewProgress}
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </SectionCard>
  );
}
