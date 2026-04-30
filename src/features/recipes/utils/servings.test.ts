import { describe, it, expect } from 'vitest';
import {
  SERVINGS_MIN,
  SERVINGS_MAX,
  SERVINGS_STEP,
  clampServings,
  incrementServings,
  decrementServings,
  formatServings,
} from './servings';

describe('servings — constants', () => {
  it('exposes a 0.5 step starting at 1 with a 99 ceiling', () => {
    expect(SERVINGS_STEP).toBe(0.5);
    expect(SERVINGS_MIN).toBe(1);
    expect(SERVINGS_MAX).toBe(99);
  });
});

describe('clampServings', () => {
  it('snaps fractional inputs to the nearest 0.5', () => {
    expect(clampServings(2.3)).toBe(2.5);
    expect(clampServings(2.2)).toBe(2);
    expect(clampServings(1.74)).toBe(1.5);
  });
  it('floors below SERVINGS_MIN', () => {
    expect(clampServings(0.5)).toBe(SERVINGS_MIN);
    expect(clampServings(0)).toBe(SERVINGS_MIN);
    expect(clampServings(-3)).toBe(SERVINGS_MIN);
  });
  it('caps at SERVINGS_MAX', () => {
    expect(clampServings(120)).toBe(SERVINGS_MAX);
    expect(clampServings(SERVINGS_MAX + 0.5)).toBe(SERVINGS_MAX);
  });
  it('returns SERVINGS_MIN for non-finite input', () => {
    expect(clampServings(NaN)).toBe(SERVINGS_MIN);
    expect(clampServings(Infinity)).toBe(SERVINGS_MAX);
  });
});

describe('incrementServings', () => {
  it('advances by 0.5', () => {
    expect(incrementServings(1)).toBe(1.5);
    expect(incrementServings(1.5)).toBe(2);
    expect(incrementServings(2.5)).toBe(3);
  });
  it('caps at SERVINGS_MAX', () => {
    expect(incrementServings(SERVINGS_MAX)).toBe(SERVINGS_MAX);
  });
});

describe('decrementServings', () => {
  it('steps down by 0.5', () => {
    expect(decrementServings(2)).toBe(1.5);
    expect(decrementServings(1.5)).toBe(1);
    expect(decrementServings(3.5)).toBe(3);
  });
  it('clamps to SERVINGS_MIN at and below the floor', () => {
    expect(decrementServings(1)).toBe(SERVINGS_MIN);
    expect(decrementServings(0.5)).toBe(SERVINGS_MIN);
  });
});

describe('formatServings', () => {
  it('renders integers without a decimal', () => {
    expect(formatServings(1)).toBe('1');
    expect(formatServings(10)).toBe('10');
  });
  it('renders halves with one decimal', () => {
    expect(formatServings(1.5)).toBe('1.5');
    expect(formatServings(2.5)).toBe('2.5');
  });
});
