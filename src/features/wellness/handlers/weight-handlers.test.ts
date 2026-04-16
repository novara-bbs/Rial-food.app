import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHandleLogWeight } from './weight-handlers';
import type { BodySnapshot } from '../../../contexts/AppStateContext';

describe('createHandleLogWeight', () => {
  let setWeightHistory: ReturnType<typeof vi.fn>;
  let setUserProfile: ReturnType<typeof vi.fn>;
  let handleLogWeight: ReturnType<typeof createHandleLogWeight>;

  beforeEach(() => {
    setWeightHistory = vi.fn();
    setUserProfile = vi.fn();
    handleLogWeight = createHandleLogWeight({
      setWeightHistory: setWeightHistory as any,
      setUserProfile: setUserProfile as any,
    });
  });

  it('writes to both weightHistory and userProfile.weight', () => {
    handleLogWeight({ kg: 75.5 });
    expect(setWeightHistory).toHaveBeenCalledOnce();
    expect(setUserProfile).toHaveBeenCalledOnce();

    // setUserProfile receives a function → test it updates weight
    const profileFn = setUserProfile.mock.calls[0][0];
    const updated = profileFn({ name: 'Test', weight: 70 });
    expect(updated.weight).toBe(75.5);
    expect(updated.name).toBe('Test'); // other fields preserved
  });

  it('replaces existing entry for the same date', () => {
    const today = new Date().toISOString().slice(0, 10);
    const existing: BodySnapshot[] = [
      { date: today, kg: 70 },
      { date: '2026-01-01', kg: 72 },
    ];
    handleLogWeight({ kg: 74 });

    const historyFn = setWeightHistory.mock.calls[0][0];
    const result = historyFn(existing);

    const todayEntries = result.filter((e: BodySnapshot) => e.date === today);
    expect(todayEntries).toHaveLength(1);
    expect(todayEntries[0].kg).toBe(74);
    expect(result).toHaveLength(2); // replaced, not appended
  });

  it('appends new entry when date has no existing entry', () => {
    const existing: BodySnapshot[] = [{ date: '2026-01-01', kg: 72 }];
    handleLogWeight({ kg: 74 });

    const historyFn = setWeightHistory.mock.calls[0][0];
    const result = historyFn(existing);
    expect(result).toHaveLength(2);
  });

  it('includes note when provided', () => {
    handleLogWeight({ kg: 73, note: 'morning, fasted' });
    const historyFn = setWeightHistory.mock.calls[0][0];
    const result = historyFn([]);
    expect(result[0].note).toBe('morning, fasted');
  });

  it('omits note when empty string', () => {
    handleLogWeight({ kg: 73, note: '  ' });
    const historyFn = setWeightHistory.mock.calls[0][0];
    const result = historyFn([]);
    expect(result[0].note).toBeUndefined();
  });

  it('accepts a custom date', () => {
    handleLogWeight({ kg: 72, date: '2026-03-15' });
    const historyFn = setWeightHistory.mock.calls[0][0];
    const result = historyFn([]);
    expect(result[0].date).toBe('2026-03-15');
  });

  it('rejects kg outside valid range via caller — handler stores any value', () => {
    // Handler itself doesn't validate range (callers do); verify no crash
    expect(() => handleLogWeight({ kg: 0 })).not.toThrow();
    expect(() => handleLogWeight({ kg: 999 })).not.toThrow();
  });
});
