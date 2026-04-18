import { describe, it, expect } from 'vitest';
import { daysBetweenISO } from './BeforeAfterCompare';

describe('daysBetweenISO', () => {
  it('returns 0 for the same date', () => {
    expect(daysBetweenISO('2026-04-18', '2026-04-18')).toBe(0);
  });

  it('returns exact day count for consecutive days', () => {
    expect(daysBetweenISO('2026-04-17', '2026-04-18')).toBe(1);
  });

  it('returns 7 for a week', () => {
    expect(daysBetweenISO('2026-04-11', '2026-04-18')).toBe(7);
  });

  it('is direction-agnostic (always positive)', () => {
    expect(daysBetweenISO('2026-04-18', '2026-04-11')).toBe(7);
  });

  it('spans month boundaries correctly', () => {
    expect(daysBetweenISO('2026-03-30', '2026-04-03')).toBe(4);
  });

  it('spans DST boundaries without drifting (midday anchor)', () => {
    // Spain DST spring-forward is the last Sunday of March (2026-03-29).
    // Midday anchor on both sides absorbs the 23h day without rounding to 0 or 2.
    expect(daysBetweenISO('2026-03-28', '2026-03-30')).toBe(2);
  });
});
