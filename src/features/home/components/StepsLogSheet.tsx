/**
 * StepsLogSheet — Sprint K-fix5 [1.5.209].
 *
 * BottomSheet to edit the user's steps for the day. Replaces the inline
 * `+500/+1000` chips with a precise input (slider + presets). Live kcal
 * preview shows what the formula yields based on the user's profile.
 *
 *   ┌──────────────────────────────────┐
 *   │  PASOS DE HOY                    │
 *   │  ─────────────────────────────── │
 *   │  ┌────────────────────────────┐  │
 *   │  │   12 500                   │  │
 *   │  │   pasos                     │  │
 *   │  └────────────────────────────┘  │
 *   │                                  │
 *   │  [slider 0–30000, step 100]     │
 *   │  [5k] [10k] [15k] [20k]          │
 *   │                                  │
 *   │  ≈ 469 kcal quemadas             │
 *   │  Calculado con tu peso (75 kg)   │
 *   │                                  │
 *   │  [Cancelar]      [Guardar]       │
 *   └──────────────────────────────────┘
 */
import { useEffect, useState } from 'react';
import { Footprints } from 'lucide-react';
import BottomSheet from '../../../components/ui/bottom-sheet';
import SectionCard from '../../../components/SectionCard';
import { Button } from '@/components/ui/button';
import StatusChip from '@/components/ui/StatusChip';
import { useI18n } from '../../../i18n';
import { kcalFromSteps, type ActivityProfile } from '../utils/activity-calories';

const STEPS_MIN = 0;
const STEPS_MAX = 30000;
const STEPS_STEP = 100;
const PRESETS = [5000, 10000, 15000, 20000];

export interface StepsLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSteps: number;
  target: number;
  profile: ActivityProfile;
  onSelect: (steps: number) => void;
}

export default function StepsLogSheet({
  open,
  onOpenChange,
  currentSteps,
  target,
  profile,
  onSelect,
}: StepsLogSheetProps) {
  const { t } = useI18n();
  const [draftSteps, setDraftSteps] = useState(currentSteps);

  // Reset draft when sheet opens (mirror current value)
  useEffect(() => {
    if (open) setDraftSteps(currentSteps);
  }, [open, currentSteps]);

  const kcal = kcalFromSteps(draftSteps, profile);
  const subtitleTpl = (t.home.stepsSheet.subtitle as string) ?? '';
  const weightKg = profile.weight ?? 70;
  const subtitle = subtitleTpl.replace('{weight}', String(weightKg));
  const kcalPreviewTpl = (t.home.stepsSheet.kcalPreview as string) ?? '';
  const kcalLabel = kcalPreviewTpl.replace('{kcal}', String(kcal));

  const pct = target > 0 ? Math.min((draftSteps / target) * 100, 100) : 0;

  const handleSave = () => {
    onSelect(Math.max(0, Math.min(STEPS_MAX, draftSteps)));
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.home.stepsSheet.title}
      size="focus"
    >
      <div className="px-4 pb-6 space-y-5" data-testid="steps-log-sheet-body">
        {/* Big number + icon */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <span
            className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10"
            aria-hidden="true"
          >
            <Footprints className="w-7 h-7 text-primary" strokeWidth={2} />
          </span>
          <div className="text-center">
            <p className="font-headline font-bold text-display text-on-surface tabular-nums leading-none">
              {draftSteps.toLocaleString()}
            </p>
            <p className="font-body text-label text-on-surface-variant mt-1">
              {t.home.stepsLabel.toLowerCase()} · {Math.round(pct)}% {t.home.stepsSheet.ofTarget.replace('{target}', target.toLocaleString())}
            </p>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={STEPS_MIN}
            max={STEPS_MAX}
            step={STEPS_STEP}
            value={draftSteps}
            onChange={(e) => setDraftSteps(parseInt(e.target.value, 10))}
            aria-label={t.home.stepsSheet.title as string}
            aria-valuetext={`${draftSteps.toLocaleString()} ${(t.home.stepsLabel as string).toLowerCase()}`}
            className="w-full accent-primary"
            data-testid="steps-slider"
          />
          <div className="flex justify-between font-body text-micro text-on-surface-variant tabular-nums">
            <span>0</span>
            <span>{(STEPS_MAX / 1000).toFixed(0)}k</span>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 justify-center">
          {PRESETS.map((preset) => (
            <StatusChip
              key={preset}
              tone={draftSteps === preset ? 'primary' : 'neutral'}
              onClick={() => setDraftSteps(preset)}
              ariaLabel={`${preset.toLocaleString()} ${(t.home.stepsLabel as string).toLowerCase()}`}
              testId={`steps-preset-${preset}`}
            >
              {(preset / 1000).toFixed(0)}k
            </StatusChip>
          ))}
        </div>

        {/* Live kcal preview */}
        <SectionCard padding="md" spacing="none">
          <p className="font-headline font-bold text-body-sm text-primary tabular-nums" data-testid="steps-kcal-preview">
            {kcalLabel}
          </p>
          <p className="font-body text-label text-on-surface-variant mt-0.5">
            {subtitle}
          </p>
        </SectionCard>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="default"
            onClick={handleCancel}
            className="flex-1"
            data-testid="steps-cancel-cta"
          >
            {t.home.stepsSheet.cancel}
          </Button>
          <Button
            variant="default"
            size="default"
            onClick={handleSave}
            className="flex-1"
            data-testid="steps-save-cta"
          >
            {t.home.stepsSheet.save}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
