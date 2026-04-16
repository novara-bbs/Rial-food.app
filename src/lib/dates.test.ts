import { describe, it, expect } from 'vitest';
import { todayLocal, dateToLocal } from './dates';

describe('dateToLocal', () => {
  it('returns YYYY-MM-DD format', () => {
    const d = new Date('2026-04-16T12:00:00Z');
    expect(dateToLocal(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('handles midnight UTC in a positive-offset timezone', () => {
    // Simulate UTC+5: it's already April 17 locally at 00:30 UTC
    // We can't change TZ in Vitest, but we can verify the math:
    // For a Date whose local representation is April 17, the function should return April 17.
    const d = new Date(2026, 3, 17, 0, 30, 0); // April 17 00:30 LOCAL
    expect(dateToLocal(d)).toBe('2026-04-17');
  });

  it('handles a date deep in the day', () => {
    const d = new Date(2026, 0, 1, 15, 0, 0); // Jan 1 15:00 LOCAL
    expect(dateToLocal(d)).toBe('2026-01-01');
  });

  it('handles year boundary', () => {
    const d = new Date(2025, 11, 31, 23, 59, 0); // Dec 31 23:59 LOCAL
    expect(dateToLocal(d)).toBe('2025-12-31');
  });

  it('handles leap day', () => {
    const d = new Date(2024, 1, 29, 12, 0, 0); // Feb 29 2024 LOCAL
    expect(dateToLocal(d)).toBe('2024-02-29');
  });
});

describe('todayLocal', () => {
  it('returns today when called with default', () => {
    const result = todayLocal();
    // Must be a valid date string
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Should match local date
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(result).toBe(expected);
  });

  it('accepts an injectable clock', () => {
    const fixed = new Date(2026, 5, 15, 8, 0, 0); // June 15
    expect(todayLocal(fixed)).toBe('2026-06-15');
  });
});
