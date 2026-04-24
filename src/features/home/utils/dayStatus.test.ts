import { describe, it, expect } from 'vitest';
import { computeDayStatus } from './dayStatus';

const at = (hour: number, minute = 0) => {
  const d = new Date('2026-04-24T00:00:00');
  d.setHours(hour, minute, 0, 0);
  return d;
};

describe('computeDayStatus', () => {
  it('returns on-track when target is 0 or negative', () => {
    expect(computeDayStatus(0, 0, at(12))).toBe('on-track');
    expect(computeDayStatus(500, -1, at(12))).toBe('on-track');
  });

  it('returns over when consumed exceeds target', () => {
    expect(computeDayStatus(2600, 2500, at(18))).toBe('over');
    expect(computeDayStatus(3000, 2500, at(8))).toBe('over');
  });

  it('returns on-track when consumed ratio matches day fraction within tolerance', () => {
    expect(computeDayStatus(1250, 2500, at(12))).toBe('on-track');
    expect(computeDayStatus(625, 2500, at(6))).toBe('on-track');
  });

  it('returns ahead when consumption is well above day fraction', () => {
    expect(computeDayStatus(2000, 2500, at(9))).toBe('ahead');
  });

  it('returns behind when consumption is well below day fraction', () => {
    expect(computeDayStatus(0, 2500, at(18))).toBe('behind');
    expect(computeDayStatus(400, 2500, at(20))).toBe('behind');
  });

  it('treats early morning 0 kcal as on-track (day fraction ~0)', () => {
    expect(computeDayStatus(0, 2500, at(0, 30))).toBe('on-track');
  });
});
