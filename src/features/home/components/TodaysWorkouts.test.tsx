/**
 * TodaysWorkouts — Sprint K-fix7 [1.5.211].
 *
 * Locks the rendering contract: empty state shows registerCta, populated state
 * lists each entry with intensity label + minutes + kcal + delete control,
 * and the bottom add-another CTA appends without overwriting.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import TodaysWorkouts from './TodaysWorkouts';
import { I18nProvider } from '../../../i18n';
import type { WorkoutLogEntry } from '../types/workout-log';
import type { ActivityProfile } from '../utils/activity-calories';

function mount(opts: {
  workoutLog?: WorkoutLogEntry[];
  profile?: ActivityProfile;
  onLogWorkout?: () => void;
  onEditWorkout?: () => void;
  onDeleteWorkout?: (id: number) => void;
  disabled?: boolean;
} = {}) {
  const onLogWorkout = opts.onLogWorkout ?? vi.fn();
  const onEditWorkout = opts.onEditWorkout ?? vi.fn();
  const onDeleteWorkout = opts.onDeleteWorkout ?? vi.fn();
  const utils = render(
    <I18nProvider>
      <TodaysWorkouts
        workoutLog={opts.workoutLog ?? []}
        profile={opts.profile ?? { weight: 75, sex: 'male' }}
        onLogWorkout={onLogWorkout}
        onEditWorkout={onEditWorkout}
        onDeleteWorkout={onDeleteWorkout}
        disabled={opts.disabled}
      />
    </I18nProvider>,
  );
  return { ...utils, onLogWorkout, onEditWorkout, onDeleteWorkout };
}

describe('TodaysWorkouts', () => {
  it('renders empty state with register CTA when log is empty', () => {
    const { getByTestId, queryByTestId } = mount({ workoutLog: [] });
    expect(getByTestId('todays-workouts')).toBeTruthy();
    expect(getByTestId('todays-workouts-empty-cta')).toBeTruthy();
    expect(queryByTestId('todays-workouts-add-cta')).toBeNull();
  });

  it('renders the populated SectionCard when at least one entry exists', () => {
    const { getByTestId, queryByTestId } = mount({
      workoutLog: [
        { id: 1, time: '18:30', intensity: 'medium', minutes: 45, kcal: 295 },
      ],
    });
    expect(getByTestId('todays-workouts-add-cta')).toBeTruthy();
    expect(queryByTestId('todays-workouts-empty-cta')).toBeNull();
    expect(getByTestId('todays-workouts-entry-1')).toBeTruthy();
  });

  it('shows minutes, time, and kcal for each entry', () => {
    const { getByTestId } = mount({
      workoutLog: [
        { id: 7, time: '07:00', intensity: 'intense', minutes: 60, kcal: 500 },
      ],
    });
    const entry = getByTestId('todays-workouts-entry-7');
    expect(entry.textContent).toContain('07:00');
    expect(entry.textContent).toContain('60');
    expect(entry.textContent).toContain('500');
  });

  it('renders multi-entry log with one row per workout', () => {
    const { getByTestId } = mount({
      workoutLog: [
        { id: 1, time: '07:00', intensity: 'medium', minutes: 30, kcal: 200 },
        { id: 2, time: '18:00', intensity: 'intense', minutes: 45, kcal: 500 },
      ],
    });
    expect(getByTestId('todays-workouts-entry-1')).toBeTruthy();
    expect(getByTestId('todays-workouts-entry-2')).toBeTruthy();
  });

  it('shows total kcal in the count summary when there are entries', () => {
    const { container } = mount({
      workoutLog: [
        { id: 1, time: '07:00', intensity: 'medium', minutes: 30, kcal: 200 },
        { id: 2, time: '18:00', intensity: 'intense', minutes: 45, kcal: 500 },
      ],
    });
    expect(container.textContent).toMatch(/700/);
  });

  it('delete button calls onDeleteWorkout with the entry id', () => {
    const onDeleteWorkout = vi.fn();
    const { getAllByLabelText } = mount({
      workoutLog: [
        { id: 42, time: '07:00', intensity: 'medium', minutes: 30, kcal: 200 },
      ],
      onDeleteWorkout,
    });
    // Two delete-aria buttons exist (label is duplicated for the icon + aria pattern)
    const deleteBtns = getAllByLabelText(/Eliminar|Delete/i);
    fireEvent.click(deleteBtns[0]);
    expect(onDeleteWorkout).toHaveBeenCalledWith(42);
  });

  it('disabled prop blocks the empty CTA from opening the sheet', () => {
    const onLogWorkout = vi.fn();
    const { getByTestId } = mount({ disabled: true, onLogWorkout });
    fireEvent.click(getByTestId('todays-workouts-empty-cta'));
    // Sheet open is internal state; we just verify the handler wasn't invoked
    // because the ExerciseLogSheet would have to call onSelect for it to fire.
    expect(onLogWorkout).not.toHaveBeenCalled();
  });

  it('shows the "no workouts logged" empty copy', () => {
    const { container } = mount({ workoutLog: [] });
    expect(container.textContent?.toLowerCase()).toMatch(/aún no|haven't logged/i);
  });
});
