/**
 * StepsCard — Sprint K-fix7 [1.5.211].
 *
 * Successor to `HealthAndExerciseCard`'s "Pasos" section, now standalone.
 * The "Deporte" half of the old card moved to `<TodaysWorkouts>` (lives
 * directly under Today's meals as a parallel timeline).
 *
 *   ┌──────────────────────────────────────────┐
 *   │  PASOS                                ⓘ │
 *   │  [Footprints w-10] 8 432 / 10 000        │
 *   │                    84% · +316 kcal        │
 *   │  [progress bar]                          │
 *   │                          [Editar pill]   │
 *   └──────────────────────────────────────────┘
 *
 * Steps are NOT events — they're a continuous accumulator across the day, so
 * they don't fit the "logged entry" timeline metaphor. They keep their own
 * dedicated card. Visually grouped near `TodaysWorkouts` in the Home stack so
 * the user reads activity-related surfaces together.
 */
import { useState } from 'react';
import { Footprints, Info } from 'lucide-react';
import SectionCard from '../../../components/SectionCard';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { useI18n } from '../../../i18n';
import {
  kcalFromSteps,
  kcalPerStep,
  type ActivityProfile,
} from '../utils/activity-calories';
import StepsLogSheet from './StepsLogSheet';

interface StepsState {
  steps: number;
  target: number;
}

export interface StepsCardProps {
  movement: StepsState;
  /** Updates only the `steps` field. Card is unaware of the broader MovementState shape. */
  onStepsChange: (steps: number) => void;
  profile: ActivityProfile;
  /** Read-only view for past days. */
  disabled?: boolean;
  className?: string;
}

const OVERLINE_LABEL = 'font-label text-label font-bold uppercase tracking-widest text-on-surface-variant';

export default function StepsCard({
  movement,
  onStepsChange,
  profile,
  disabled = false,
  className,
}: StepsCardProps) {
  const { t } = useI18n();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const stepKcal = kcalFromSteps(movement.steps, profile);
  const stepsPct = movement.target > 0
    ? Math.min((movement.steps / movement.target) * 100, 100)
    : 0;

  const weight = profile.weight ?? 70;
  const stepsInfoBody = (t.home.healthCard.stepsInfoBody as string)
    .replace('{weight}', String(weight))
    .replace('{kcalPerStep}', kcalPerStep(profile).toFixed(4))
    .replace('{steps}', movement.steps.toLocaleString())
    .replace('{kcal}', String(stepKcal));

  const stepsCta = movement.steps > 0 ? t.home.healthCard.editSteps : t.home.healthCard.addSteps;

  const handleSave = (newSteps: number) => {
    if (disabled) return;
    onStepsChange(newSteps);
  };

  return (
    <>
      <div data-testid="steps-card">
        <SectionCard padding="md" spacing="md" className={className}>
          <div className="flex items-center justify-between gap-2">
            <span className={OVERLINE_LABEL}>
              {t.home.stepsLabel}
            </span>
            <TooltipProvider>
              <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTooltipOpen((o) => !o);
                    }}
                    aria-label={t.home.healthCard.stepsInfoTitle as string}
                    className="flex items-center justify-center w-6 h-6 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-colors shrink-0"
                    data-testid="steps-info-button"
                  >
                    <Info className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="end"
                  sideOffset={6}
                  className="max-w-[280px] bg-on-surface text-surface px-3 py-2 rounded-sm"
                >
                  <p className="font-headline font-bold text-micro uppercase tracking-widest mb-1">
                    {t.home.healthCard.stepsInfoTitle}
                  </p>
                  <p className="font-body text-micro leading-snug normal-case">
                    {stepsInfoBody}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
              aria-hidden="true"
            >
              <Footprints className="w-5 h-5 text-primary" strokeWidth={2.2} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-body-sm leading-tight text-on-surface tabular-nums">
                {movement.steps.toLocaleString()}
                <span className="text-on-surface-variant font-normal">
                  {' / '}
                  {movement.target.toLocaleString()}
                </span>
              </p>
              <p className="font-body text-label text-on-surface-variant leading-snug mt-0.5 tabular-nums">
                {Math.round(stepsPct)}% · +{stepKcal} {t.home.kcal}
              </p>
            </div>
            <Button
              variant="outline"
              size="pill"
              onClick={() => !disabled && setSheetOpen(true)}
              disabled={disabled}
              className="shrink-0"
              data-testid="steps-card-cta"
            >
              {stepsCta}
            </Button>
          </div>

          <div
            className="h-2 bg-surface-container-highest rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={movement.steps}
            aria-valuemin={0}
            aria-valuemax={movement.target}
            aria-label={t.home.stepsLabel}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${stepsPct}%` }}
            />
          </div>
        </SectionCard>
      </div>

      <StepsLogSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        currentSteps={movement.steps}
        target={movement.target}
        profile={profile}
        onSelect={handleSave}
      />
    </>
  );
}
