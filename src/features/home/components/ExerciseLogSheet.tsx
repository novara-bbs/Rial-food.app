/**
 * ExerciseLogSheet — Sprint K-fix5 [1.5.209].
 *
 * BottomSheet for picking workout intensity tier + duration in minutes.
 * Live kcal preview computed via `kcalFromExercise(intensity, minutes, profile)`.
 *
 *   ┌──────────────────────────────────┐
 *   │  ¿CUÁNTO HAS ENTRENADO?          │
 *   │  ─────────────────────────────── │
 *   │  INTENSIDAD                      │
 *   │  [Card Ligera] [Card Media] [Card Intensa]
 *   │                                  │
 *   │  DURACIÓN                        │
 *   │  [-]  45 min  [+]                │
 *   │  [15] [30] [45] [60] [90]        │
 *   │                                  │
 *   │  ≈ 295 kcal                      │
 *   │  6 MET × 75 kg × 45 min ÷ 60    │
 *   │                                  │
 *   │  [Quitar]        [Guardar]       │
 *   └──────────────────────────────────┘
 */
import { useEffect, useState } from 'react';
import { Activity, Footprints, Flame, Check, Minus, Plus, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import BottomSheet from '../../../components/ui/bottom-sheet';
import SectionCard from '../../../components/SectionCard';
import { Button } from '@/components/ui/button';
import StatusChip from '@/components/ui/StatusChip';
import { useI18n } from '../../../i18n';
import {
  type ExerciseIntensity,
  INTENSITY_TIERS,
} from '../utils/exercise-intensity';
import {
  kcalFromExercise,
  INTENSITY_METS,
  type ActivityProfile,
} from '../utils/activity-calories';

const TIER_ICONS: Record<Exclude<ExerciseIntensity, 'none'>, LucideIcon> = {
  moderate: Footprints,
  medium: Activity,
  intense: Flame,
};

const MINUTES_MIN = 5;
const MINUTES_MAX = 180;
const MINUTES_STEP = 5;
const MINUTE_PRESETS = [15, 30, 45, 60, 90];
const DEFAULT_MINUTES = 30;

export interface ExerciseLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current intensity tier (highlighted). */
  currentIntensity: ExerciseIntensity;
  /** Current workout minutes (preserved if user re-opens to edit). */
  currentMinutes: number;
  /** User profile for live kcal preview. */
  profile: ActivityProfile;
  /** Called on Save with both values, or on Clear with ('none', 0). */
  onSelect: (intensity: ExerciseIntensity, minutes: number) => void;
}

export default function ExerciseLogSheet({
  open,
  onOpenChange,
  currentIntensity,
  currentMinutes,
  profile,
  onSelect,
}: ExerciseLogSheetProps) {
  const { t } = useI18n();

  // Draft state — user picks tier + minutes, save on CTA
  const [draftIntensity, setDraftIntensity] = useState<Exclude<ExerciseIntensity, 'none'>>(
    currentIntensity !== 'none' ? currentIntensity : 'medium',
  );
  const [draftMinutes, setDraftMinutes] = useState(
    currentMinutes > 0 ? currentMinutes : DEFAULT_MINUTES,
  );

  useEffect(() => {
    if (open) {
      setDraftIntensity(currentIntensity !== 'none' ? currentIntensity : 'medium');
      setDraftMinutes(currentMinutes > 0 ? currentMinutes : DEFAULT_MINUTES);
    }
  }, [open, currentIntensity, currentMinutes]);

  const kcal = kcalFromExercise(draftIntensity, draftMinutes, profile);
  const met = INTENSITY_METS[draftIntensity];
  const weight = profile.weight ?? 70;

  const formulaTpl = (t.home.exerciseSheet.formulaPreview as string) ?? '';
  const formula = formulaTpl
    .replace('{met}', String(met))
    .replace('{weight}', String(weight))
    .replace('{minutes}', String(draftMinutes));

  const kcalPreviewTpl = (t.home.exerciseSheet.kcalPreview as string) ?? '';
  const kcalLabel = kcalPreviewTpl.replace('{kcal}', String(kcal));

  const handleSave = () => {
    const safeMinutes = Math.max(MINUTES_MIN, Math.min(MINUTES_MAX, draftMinutes));
    onSelect(draftIntensity, safeMinutes);
    onOpenChange(false);
  };

  const handleClear = () => {
    onSelect('none', 0);
    onOpenChange(false);
  };

  const decreaseMinutes = () => {
    setDraftMinutes((prev) => Math.max(MINUTES_MIN, prev - MINUTES_STEP));
  };

  const increaseMinutes = () => {
    setDraftMinutes((prev) => Math.min(MINUTES_MAX, prev + MINUTES_STEP));
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.home.exerciseSheet.title}
      description={t.home.exerciseSheet.subtitle}
      size="focus"
    >
      <div className="px-4 pb-6 space-y-5" data-testid="exercise-log-sheet-body">
        {/* Intensity section */}
        <div className="space-y-2">
          <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
            {t.home.exerciseSheet.intensityLabel}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {INTENSITY_TIERS.map((tier) => {
              const Icon = TIER_ICONS[tier];
              const isActive = draftIntensity === tier;
              const tierCopy = t.home.exerciseSheet.tiers[tier];

              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setDraftIntensity(tier)}
                  aria-pressed={isActive}
                  data-testid={`exercise-tier-${tier}`}
                  data-active={isActive ? 'true' : 'false'}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-sm border-2 transition-colors text-center min-h-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isActive
                      ? 'bg-primary/8 border-primary'
                      : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container hover:border-outline-variant'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                      isActive ? 'bg-primary/15' : 'bg-on-surface-variant/10'
                    }`}
                    aria-hidden="true"
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
                      strokeWidth={2.2}
                    />
                  </div>
                  <p className="font-headline font-bold text-body-sm text-on-surface leading-tight">
                    {tierCopy.label}
                  </p>
                  <p className="font-body text-micro text-on-surface-variant">
                    {tierCopy.kcal}
                  </p>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5" strokeWidth={3} aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration section */}
        <div className="space-y-2">
          <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
            {t.home.exerciseSheet.durationLabel}
          </span>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={decreaseMinutes}
              disabled={draftMinutes <= MINUTES_MIN}
              aria-label={t.home.exerciseSheet.decreaseMinutes as string}
              data-testid="minutes-decrement"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex items-baseline gap-1.5 min-w-[6rem] justify-center">
              <span
                className="font-headline font-bold text-title text-on-surface tabular-nums leading-none"
                data-testid="minutes-value"
              >
                {draftMinutes}
              </span>
              <span className="font-body text-label text-on-surface-variant">
                {t.home.exerciseSheet.minutesUnit}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={increaseMinutes}
              disabled={draftMinutes >= MINUTES_MAX}
              aria-label={t.home.exerciseSheet.increaseMinutes as string}
              data-testid="minutes-increment"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center pt-1">
            {MINUTE_PRESETS.map((preset) => (
              <StatusChip
                key={preset}
                tone={draftMinutes === preset ? 'primary' : 'neutral'}
                onClick={() => setDraftMinutes(preset)}
                ariaLabel={`${preset} ${t.home.exerciseSheet.minutesUnit}`}
                testId={`minutes-preset-${preset}`}
              >
                {preset}
              </StatusChip>
            ))}
          </div>
        </div>

        {/* Live kcal + formula preview */}
        <SectionCard padding="md" spacing="none">
          <p
            className="font-headline font-bold text-body-sm text-primary tabular-nums"
            data-testid="exercise-kcal-preview"
          >
            {kcalLabel}
          </p>
          <p className="font-body text-label text-on-surface-variant mt-0.5 tabular-nums">
            {formula}
          </p>
        </SectionCard>

        {/* Actions */}
        <div className="flex gap-2">
          {currentIntensity !== 'none' && (
            <Button
              variant="ghost"
              size="default"
              onClick={handleClear}
              className="flex-1 text-error hover:text-error"
              data-testid="exercise-tier-clear"
            >
              <X className="w-4 h-4" />
              {t.home.exerciseSheet.clearLabel}
            </Button>
          )}
          <Button
            variant="default"
            size="default"
            onClick={handleSave}
            className="flex-1"
            data-testid="exercise-save-cta"
          >
            {t.home.stepsSheet.save}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
