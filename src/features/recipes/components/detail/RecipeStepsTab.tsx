/**
 * RecipeDetail "Steps" tab — numbered cooking instructions + Cook Mode CTA.
 *
 * Extracted from RecipeDetail.tsx (Phase 3.1, ADR-015) — pure presentation.
 * Step shape supports both legacy `string` and the canonical `{id, text}`.
 */
import { ChefHat } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Step = string | { id?: string; text: string;[key: string]: any };

interface RecipeStepsTabProps {
  cookSteps: Step[];
  openCookMode: () => void;
  /** Default 'steps' — only override if the parent uses a different tab id. */
  tabValue?: string;
}

export default function RecipeStepsTab({
  cookSteps,
  openCookMode,
  tabValue = 'steps',
}: RecipeStepsTabProps) {
  const { t } = useI18n();

  return (
    <TabsContent value={tabValue} className="space-y-4 pt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
          {cookSteps.length} {t.recipeDetail.stepsCount}
        </span>
        <Button variant="brand" size="sm" onClick={openCookMode}>
          <ChefHat className="w-3.5 h-3.5 mr-1.5" /> {t.recipeDetail.cookMode}
        </Button>
      </div>

      <div className="space-y-3">
        {cookSteps.map((step, idx) => (
          <div
            key={typeof step === 'string' ? idx : step.id || idx}
            className="flex gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/10"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-headline font-bold text-body-sm flex items-center justify-center shrink-0">
              {idx + 1}
            </div>
            <p className="text-sm text-on-surface leading-relaxed pt-0.5">
              {typeof step === 'string' ? step : step.text}
            </p>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}
