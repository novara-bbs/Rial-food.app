/**
 * workout-handlers — Sprint K-fix7 [1.5.211].
 *
 * Locks the contract of the workout log factory: kcal frozen on entry, edit
 * recomputes, delete by id, multi-entry support.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  createHandleLogWorkout,
  createHandleEditWorkout,
  createHandleDeleteWorkout,
} from './workout-handlers';
import type { WorkoutLogEntry } from '../types/workout-log';

type Setter<T> = (fn: T | ((prev: T) => T)) => void;

function makeStore(initial: WorkoutLogEntry[] = []) {
  let state = initial;
  const setWorkoutLog: Setter<WorkoutLogEntry[]> = (next) => {
    state = typeof next === 'function' ? (next as (prev: WorkoutLogEntry[]) => WorkoutLogEntry[])(state) : next;
  };
  return {
    get state() { return state; },
    setWorkoutLog,
  };
}

describe('createHandleLogWorkout', () => {
  it('appends a new entry with frozen kcal computed via kcalFromExercise', () => {
    const store = makeStore();
    const log = createHandleLogWorkout({ setWorkoutLog: store.setWorkoutLog });

    const entry = log('medium', 45, { weight: 75, sex: 'male' });

    // 6 MET × 75 kg × 0.75 × 1.0 = 337.5 → 338
    expect(entry.kcal).toBe(338);
    expect(entry.intensity).toBe('medium');
    expect(entry.minutes).toBe(45);
    expect(typeof entry.id).toBe('number');
    expect(entry.time).toMatch(/^\d{2}:\d{2}$/);
    expect(store.state).toHaveLength(1);
  });

  it('supports multiple entries on the same day (no overwrite)', () => {
    const store = makeStore();
    const log = createHandleLogWorkout({ setWorkoutLog: store.setWorkoutLog });

    log('medium', 30, { weight: 75, sex: 'male' });
    log('intense', 60, { weight: 75, sex: 'male' });

    expect(store.state).toHaveLength(2);
    expect(store.state[0].intensity).toBe('medium');
    expect(store.state[1].intensity).toBe('intense');
  });

  it('clamps minutes to ≥ 1', () => {
    const store = makeStore();
    const log = createHandleLogWorkout({ setWorkoutLog: store.setWorkoutLog });

    const entry = log('medium', 0, { weight: 75 });
    expect(entry.minutes).toBe(1);
  });

  it('applies female sex factor (×0.95)', () => {
    const store = makeStore();
    const log = createHandleLogWorkout({ setWorkoutLog: store.setWorkoutLog });

    const male = log('medium', 30, { weight: 70, sex: 'male' });
    store.setWorkoutLog([]);
    const female = log('medium', 30, { weight: 70, sex: 'female' });

    // Female should be ~5% less
    expect(female.kcal).toBeLessThan(male.kcal);
    expect(female.kcal / male.kcal).toBeCloseTo(0.95, 1);
  });
});

describe('createHandleEditWorkout', () => {
  it('replaces intensity + minutes + recomputed kcal, preserves id and time', () => {
    const initial: WorkoutLogEntry[] = [
      { id: 1, time: '10:00', intensity: 'moderate', minutes: 30, kcal: 100 },
    ];
    const store = makeStore(initial);
    const edit = createHandleEditWorkout({ setWorkoutLog: store.setWorkoutLog });

    edit(1, 'intense', 60, { weight: 75, sex: 'male' });

    expect(store.state).toHaveLength(1);
    expect(store.state[0].id).toBe(1);
    expect(store.state[0].time).toBe('10:00');
    expect(store.state[0].intensity).toBe('intense');
    expect(store.state[0].minutes).toBe(60);
    // 9 MET × 75 × 1.0 × 1.0 = 675
    expect(store.state[0].kcal).toBe(675);
  });

  it('no-op when id does not exist', () => {
    const initial: WorkoutLogEntry[] = [
      { id: 1, time: '10:00', intensity: 'moderate', minutes: 30, kcal: 100 },
    ];
    const store = makeStore(initial);
    const edit = createHandleEditWorkout({ setWorkoutLog: store.setWorkoutLog });

    edit(999, 'intense', 60, { weight: 75 });

    expect(store.state).toEqual(initial);
  });
});

describe('createHandleDeleteWorkout', () => {
  it('removes entry by id', () => {
    const initial: WorkoutLogEntry[] = [
      { id: 1, time: '10:00', intensity: 'moderate', minutes: 30, kcal: 100 },
      { id: 2, time: '18:00', intensity: 'intense', minutes: 45, kcal: 500 },
    ];
    const store = makeStore(initial);
    const del = createHandleDeleteWorkout({ setWorkoutLog: store.setWorkoutLog });

    del(1);

    expect(store.state).toHaveLength(1);
    expect(store.state[0].id).toBe(2);
  });

  it('no-op when id does not exist', () => {
    const initial: WorkoutLogEntry[] = [
      { id: 1, time: '10:00', intensity: 'moderate', minutes: 30, kcal: 100 },
    ];
    const store = makeStore(initial);
    const del = createHandleDeleteWorkout({ setWorkoutLog: store.setWorkoutLog });

    del(999);

    expect(store.state).toEqual(initial);
  });
});

describe('handler memoization safety', () => {
  it('handler reads current state via setter callback (not closure)', () => {
    const store = makeStore();
    const log = createHandleLogWorkout({ setWorkoutLog: store.setWorkoutLog });

    log('medium', 30, { weight: 75 });
    log('moderate', 20, { weight: 75 });

    // Both entries present despite handler being created against initial empty state
    expect(store.state).toHaveLength(2);
  });

  it('Date.now ids are unique enough for typical use (rapid sequential logs)', () => {
    const store = makeStore();
    const log = createHandleLogWorkout({ setWorkoutLog: store.setWorkoutLog });

    // Log 5 in a tight loop — ids should all be distinct due to random suffix
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-03T10:00:00'));
    for (let i = 0; i < 5; i++) {
      log('medium', 30, { weight: 75 });
    }
    vi.useRealTimers();

    const ids = store.state.map((e) => e.id);
    expect(new Set(ids).size).toBe(5);
  });
});
