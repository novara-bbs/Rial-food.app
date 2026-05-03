/**
 * TodaysWorkouts — Sprint K-fix7 [1.5.211].
 *
 * Parallel of `TodaysMeals` for intentional exercise sessions. Lives directly
 * under "REGISTRAR COMIDA" in the Home stack so the user reads two cohesive
 * timelines for their day: comida + deporte.
 *
 *   ┌──────────────────────────────────────────┐
 *   │  🏋️  DEPORTE DE HOY    2 entrenos · +520 │
 *   │  ─────────────────────────────────────── │
 *   │  ✓ REGISTRADO                            │
 *   │  • [Flame] Cardio · 18:30 · 45 min · 295 │
 *   │  • [Flame] Fuerza · 19:30 · 30 min · 225 │
 *   │  ─────────────────────────────────────── │
 *   │  [+ Registrar deporte] (full-width pill) │
 *   └──────────────────────────────────────────┘
 *
 * Reuses `<ExerciseLogSheet>` for both add (intensity='none' + minutes=0
 * defaults to medium/30 inside the sheet) and edit (passes the entry's
 * current values).
 *
 * Intentionally NOT merging with TodaysMeals — keeping each timeline in its
 * own component preserves the existing TodaysMeals abstraction and avoids a
 * forced merge-sort primitive that would couple food and workout concerns.
 */
import { useState } from 'react';
import { Activity, Dumbbell, Flame, Footprints, Trash2, Pencil, Plus, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SectionCard from '../../../components/SectionCard';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Typography';
import { useI18n } from '../../../i18n';
import type { WorkoutLogEntry } from '../types/workout-log';
import type { ExerciseIntensity } from '../utils/exercise-intensity';
import type { ActivityProfile } from '../utils/activity-calories';
import ExerciseLogSheet from './ExerciseLogSheet';

type SupportedIntensity = Exclude<ExerciseIntensity, 'none'>;

const TIER_ICONS: Record<SupportedIntensity, LucideIcon> = {
  moderate: Footprints,
  medium: Activity,
  intense: Flame,
};

const interpolate = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

export interface TodaysWorkoutsProps {
  workoutLog: WorkoutLogEntry[];
  profile: ActivityProfile;
  /** Append a new workout entry. The handler computes kcal from (intensity, minutes, profile). */
  onLogWorkout: (intensity: SupportedIntensity, minutes: number, profile: ActivityProfile) => void;
  /** Replace existing workout by id. */
  onEditWorkout: (id: number, intensity: SupportedIntensity, minutes: number, profile: ActivityProfile) => void;
  /** Remove workout by id. */
  onDeleteWorkout: (id: number) => void;
  /** Read-only when viewing past days. */
  disabled?: boolean;
  className?: string;
}

export default function TodaysWorkouts({
  workoutLog,
  profile,
  onLogWorkout,
  onEditWorkout,
  onDeleteWorkout,
  disabled = false,
  className,
}: TodaysWorkoutsProps) {
  const { t } = useI18n();
  const [sheetOpen, setSheetOpen] = useState(false);
  /** When set, the sheet opens in edit-mode for this entry. null = add-mode. */
  const [editingId, setEditingId] = useState<number | null>(null);

  const editingEntry = editingId != null
    ? workoutLog.find((w) => w.id === editingId) ?? null
    : null;

  const totalKcal = workoutLog.reduce((sum, w) => sum + w.kcal, 0);
  const hasLog = workoutLog.length > 0;

  const openAdd = () => {
    if (disabled) return;
    setEditingId(null);
    setSheetOpen(true);
  };

  const openEdit = (id: number) => {
    if (disabled) return;
    setEditingId(id);
    setSheetOpen(true);
  };

  const handleSheetSave = (next: ExerciseIntensity, minutes: number) => {
    if (next === 'none') {
      // "Quitar entrenamiento" inside the sheet behaves as delete in edit-mode,
      // and as a no-op cancel in add-mode.
      if (editingId != null) onDeleteWorkout(editingId);
      setSheetOpen(false);
      setEditingId(null);
      return;
    }
    if (editingId != null) {
      onEditWorkout(editingId, next, minutes, profile);
    } else {
      onLogWorkout(next, minutes, profile);
    }
    setSheetOpen(false);
    setEditingId(null);
  };

  const countLabel = workoutLog.length === 1
    ? interpolate(t.home.todaysWorkouts.countSingular, { count: workoutLog.length })
    : interpolate(t.home.todaysWorkouts.countPlural, { count: workoutLog.length });

  return (
    <>
      <section className={`space-y-3 ${className ?? ''}`} data-testid="todays-workouts">
        <div className="flex items-center justify-between px-1">
          <Heading level="h2" className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" /> {t.home.todaysWorkouts.title}
          </Heading>
          {hasLog && (
            <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
              {countLabel}
              <span className="ml-2 text-primary">
                {interpolate(t.home.todaysWorkouts.kcalSummary, { kcal: totalKcal })}
              </span>
            </span>
          )}
        </div>

        {/* Empty state — no workouts logged yet today */}
        {!hasLog && (
          <SectionCard
            padding="none"
            spacing="none"
            className="border-dashed border-outline-variant/40 px-4 py-6 text-center"
          >
            <p className="font-body text-body-sm text-on-surface-variant">
              {t.home.todaysWorkouts.empty}
            </p>
            <div className="mt-4 flex items-center justify-center">
              <Button
                variant="outline"
                size="pill"
                onClick={openAdd}
                disabled={disabled}
                data-testid="todays-workouts-empty-cta"
              >
                <Plus className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                {t.home.todaysWorkouts.registerCta}
              </Button>
            </div>
          </SectionCard>
        )}

        {/* Populated state — one row per workout + CTA at the bottom */}
        {hasLog && (
          <SectionCard padding="none" spacing="none" className="overflow-hidden">
            <div>
              <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" /> {t.home.todaysWorkouts.loggedSection}
                </span>
              </div>

              <div className="divide-y divide-outline-variant/10">
                {workoutLog.map((entry) => {
                  const TierIcon = TIER_ICONS[entry.intensity];
                  const tierLabel = t.home.exerciseSheet.tiers[entry.intensity].label;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-4 py-2.5 group animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
                      data-testid={`todays-workouts-entry-${entry.id}`}
                    >
                      <span
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                        aria-hidden="true"
                      >
                        <TierIcon className="w-5 h-5 text-primary" strokeWidth={2.2} />
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(entry.id)}
                        disabled={disabled}
                        aria-label={`${t.home.todaysWorkouts.editAria}: ${tierLabel}`}
                        className="flex-1 min-w-0 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-default"
                      >
                        <span className="font-headline text-body-sm font-bold text-on-surface truncate block">
                          {tierLabel}
                        </span>
                        <div className="flex items-center gap-1.5 font-body text-label text-on-surface-variant normal-case tracking-normal">
                          <span>{entry.time}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-primary font-semibold">
                            {entry.minutes} {t.home.exerciseSheet.minutesUnit}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{interpolate(t.home.todaysWorkouts.kcalSuffix, { kcal: entry.kcal })}</span>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(entry.id)}
                          disabled={disabled}
                          aria-label={t.home.todaysWorkouts.editAria}
                          className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteWorkout(entry.id)}
                          disabled={disabled}
                          aria-label={t.home.todaysWorkouts.deleteAria}
                          className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add-another CTA at the bottom of the populated card */}
            <div className="border-t border-outline-variant/15 px-4 py-3">
              <Button
                variant="outline"
                size="pill"
                onClick={openAdd}
                disabled={disabled}
                className="w-full"
                data-testid="todays-workouts-add-cta"
              >
                <Plus className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                {t.home.todaysWorkouts.addCta}
              </Button>
            </div>
          </SectionCard>
        )}
      </section>

      <ExerciseLogSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingId(null);
        }}
        currentIntensity={editingEntry?.intensity ?? 'none'}
        currentMinutes={editingEntry?.minutes ?? 0}
        profile={profile}
        onSelect={handleSheetSave}
      />
    </>
  );
}
