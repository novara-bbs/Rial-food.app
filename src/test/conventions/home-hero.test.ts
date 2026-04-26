/**
 * Home hero shape — PR 8 Bevel Home ring-grid.
 *
 * Locks the dual-shape contract from `docs/market/home-patterns-benchmark.md`
 * §6.1. The `featureFlags.homeRingGrid` flag gates the new semi-ring 270° hero
 * (Option A hybrid) without removing the legacy equation-hero. This test
 * asserts BOTH shapes exist so the rollback path from §6.3 stays viable.
 *
 * Scope:
 *   1. Flag shape — `homeRingGrid` is a boolean, defaults to `false`.
 *   2. Arc math — pure helpers produce deterministic SVG paths for the 270°
 *      semi-ring track + progress arcs. Regressions here would silently break
 *      the ring geometry.
 *   3. Flag-on shape — `NutritionHero.tsx` routes to `NutritionHeroRing` when
 *      the flag is true; `NutritionHeroRing.tsx` renders the semi-ring + 3-col
 *      macros + running-sum caption.
 *   4. Flag-off shape — the legacy equation-hero (`Restante` + math dl list)
 *      remains the default render, unchanged by PR 8.
 *   5. Home.tsx — `ProgressPreviewCard` is flag-gated so flag-off preserves
 *      the current Home surface exactly.
 *   6. i18n — `home.ringAriaLabel` exists in both locales for a11y.
 *
 * Static file-read pattern — mirrors `bottom-sheet.test.ts` and
 * `constant-tile.test.ts`. Keep it out of the DOM-render path.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { featureFlags } from '@/lib/featureFlags';
import {
  describeSemiRingArc,
  describeSemiRingTrack,
} from '@/features/home/components/NutritionHeroRing';

const ROOT = process.cwd();
const FEATURE_FLAGS_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/lib/featureFlags.ts'),
  'utf8',
);
const HERO_LEGACY_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/features/home/components/NutritionHero.tsx'),
  'utf8',
);
const HERO_RING_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/features/home/components/NutritionHeroRing.tsx'),
  'utf8',
);
const HOME_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/features/home/screens/Home.tsx'),
  'utf8',
);
// Post-Phase 2.4: locales split by domain. Home keys live in the `home` domain.
const ES_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/i18n/locales/es/home.ts'),
  'utf8',
);
const EN_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/i18n/locales/en/home.ts'),
  'utf8',
);

describe('featureFlags — PR 8 shape', () => {
  it('exports a homeRingGrid boolean flag', () => {
    expect(typeof featureFlags.homeRingGrid).toBe('boolean');
  });

  it('defaults homeRingGrid to false (rollback-safe baseline)', () => {
    // Default resolved from `import.meta.env.VITE_FEATURE_HOME_RING_GRID`,
    // which is unset in test/CI. Flipping this default should be a deliberate
    // change that also updates `home-patterns-benchmark.md` §6.3.
    expect(featureFlags.homeRingGrid).toBe(false);
  });

  it('declares the flag via a frozen object (prevents runtime mutation)', () => {
    expect(FEATURE_FLAGS_SRC).toMatch(/Object\.freeze\(/);
  });

  it('reads the env variable name VITE_FEATURE_HOME_RING_GRID', () => {
    expect(FEATURE_FLAGS_SRC).toContain('VITE_FEATURE_HOME_RING_GRID');
  });
});

describe('describeSemiRingArc — 270° arc geometry', () => {
  it('returns null when progress is 0 (nothing to draw)', () => {
    expect(describeSemiRingArc(90, 90, 72, 0)).toBeNull();
    expect(describeSemiRingArc(90, 90, 72, -0.1)).toBeNull();
  });

  it('caps progress at 1 (no overflow arcs)', () => {
    const full = describeSemiRingArc(90, 90, 72, 1);
    const over = describeSemiRingArc(90, 90, 72, 2.5);
    expect(full).toBe(over);
  });

  it('uses SVG A (elliptical arc) command with equal rx and ry', () => {
    const path = describeSemiRingArc(90, 90, 72, 0.5)!;
    expect(path).toMatch(/A 72 72 0/);
  });

  it('sets large-arc-flag=1 when sweep >180° (e.g. 60% progress → 162° fine, 70% → 189° uses 1)', () => {
    const small = describeSemiRingArc(90, 90, 72, 0.5)!; // 135° sweep
    const large = describeSemiRingArc(90, 90, 72, 0.9)!; // 243° sweep
    // Path format: "M x y A 72 72 0 <large> <sweep> x y"
    const smallFlag = small.split(' ')[7];
    const largeFlag = large.split(' ')[7];
    expect(smallFlag).toBe('0');
    expect(largeFlag).toBe('1');
  });

  it('sweeps clockwise (sweep-flag=1)', () => {
    const path = describeSemiRingArc(90, 90, 72, 0.5)!;
    const sweepFlag = path.split(' ')[8];
    expect(sweepFlag).toBe('1');
  });

  it('starts arc at the bottom-left position (θ=225° from 12 o\'clock)', () => {
    // cx=90, cy=90, r=72 → start (90 - 72·√2/2, 90 + 72·√2/2) ≈ (39.08, 140.91)
    const path = describeSemiRingArc(90, 90, 72, 0.3)!;
    const startX = parseFloat(path.split(' ')[1]);
    const startY = parseFloat(path.split(' ')[2]);
    expect(startX).toBeCloseTo(39.088, 1);
    expect(startY).toBeCloseTo(140.912, 1);
  });
});

describe('describeSemiRingTrack — full 270° backdrop', () => {
  it('returns a closed arc path with large-arc-flag=1', () => {
    const path = describeSemiRingTrack(90, 90, 72);
    expect(path).toMatch(/^M /);
    expect(path).toMatch(/A 72 72 0 1 1/);
  });

  it('ends at the bottom-right position (θ=135° from 12 o\'clock)', () => {
    // End (90 + 72·√2/2, 90 + 72·√2/2) ≈ (140.91, 140.91)
    const path = describeSemiRingTrack(90, 90, 72);
    const tokens = path.split(' ');
    const endX = parseFloat(tokens[tokens.length - 2]);
    const endY = parseFloat(tokens[tokens.length - 1]);
    expect(endX).toBeCloseTo(140.912, 1);
    expect(endY).toBeCloseTo(140.912, 1);
  });
});

describe('NutritionHero — flag routing (legacy shape preserved)', () => {
  it('imports the featureFlags module', () => {
    expect(HERO_LEGACY_SRC).toContain("from '../../../lib/featureFlags'");
  });

  it('imports NutritionHeroRing as the flag-on branch', () => {
    expect(HERO_LEGACY_SRC).toContain("import NutritionHeroRing from './NutritionHeroRing'");
  });

  it('routes to NutritionHeroRing when featureFlags.homeRingGrid is true', () => {
    expect(HERO_LEGACY_SRC).toMatch(/if \(featureFlags\.homeRingGrid\)/);
    expect(HERO_LEGACY_SRC).toMatch(/<NutritionHeroRing[\s\S]*?dailyMacros=\{dailyMacros\}/);
  });

  it('keeps the legacy equation-hero caption (flag-off must render unchanged)', () => {
    // Flag-off sentinel: the math dl row with "− {t.home.food}" + "+ {t.home.exercise}".
    expect(HERO_LEGACY_SRC).toContain('− {t.home.food}');
    expect(HERO_LEGACY_SRC).toContain('+ {t.home.exercise}');
  });

  it('calls useI18n() before the early return (rules-of-hooks)', () => {
    // The hook call must appear before the `if (featureFlags.homeRingGrid)` return.
    const hookIdx = HERO_LEGACY_SRC.indexOf('const { t } = useI18n()');
    const flagIdx = HERO_LEGACY_SRC.indexOf('if (featureFlags.homeRingGrid)');
    expect(hookIdx).toBeGreaterThan(0);
    expect(flagIdx).toBeGreaterThan(hookIdx);
  });
});

describe('NutritionHeroRing — Option A shape anatomy', () => {
  it('renders a semi-ring track + progress path via handwritten SVG (no recharts import)', () => {
    expect(HERO_RING_SRC).not.toContain("from 'recharts'");
    expect(HERO_RING_SRC).toContain('data-testid="hero-ring-svg"');
    expect(HERO_RING_SRC).toContain('data-testid="hero-ring-progress"');
  });

  it('mounts the number hero inside the ring (remaining kcal as primary metric)', () => {
    expect(HERO_RING_SRC).toMatch(/text-display text-primary[\s\S]*?\{remaining\}/);
  });

  it('renders 3-col macros row below hero (§4.4 vertical-budget decision)', () => {
    expect(HERO_RING_SRC).toMatch(/grid-cols-3/);
    expect(HERO_RING_SRC).toContain("key: 'carbs'");
    expect(HERO_RING_SRC).toContain("key: 'protein'");
    expect(HERO_RING_SRC).toContain("key: 'fats'");
  });

  it('keeps running-sum caption for the MFP education pattern', () => {
    expect(HERO_RING_SRC).toContain('{t.home.target}');
    expect(HERO_RING_SRC).toContain('− {t.home.food}');
    expect(HERO_RING_SRC).toContain('+ {t.home.exercise}');
  });

  it('emits aria-label using the ringAriaLabel i18n key (a11y contract)', () => {
    expect(HERO_RING_SRC).toContain('t.home.ringAriaLabel.replace');
    expect(HERO_RING_SRC).toContain('aria-label={ringAria}');
  });

  it('uses theme tokens for colors (no hardcoded hex or dark: prefix)', () => {
    expect(HERO_RING_SRC).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(HERO_RING_SRC).not.toContain('dark:');
  });
});

describe('NutritionHero(Ring) — mode-adaptive hero (simple vs advanced)', () => {
  it('legacy hero renders a simple-mode daily-goal caption branch', () => {
    // Simple mode surfaces the target with `t.home.dayGoal` + body-sm caption.
    expect(HERO_LEGACY_SRC).toContain("mode === 'simple'");
    expect(HERO_LEGACY_SRC).toContain('t.home.dayGoal.replace');
    expect(HERO_LEGACY_SRC).toContain('data-testid="hero-daily-goal-caption"');
  });

  it('legacy hero renders an advanced-mode 3-col equal-weight block', () => {
    expect(HERO_LEGACY_SRC).toContain('data-testid="hero-kcal-3col"');
    expect(HERO_LEGACY_SRC).toContain('{t.home.consumed}');
    expect(HERO_LEGACY_SRC).toContain('{t.home.remaining}');
    expect(HERO_LEGACY_SRC).toContain('{t.home.target}');
    // Running-sum preserved in advanced branch (MFP pattern §3.4).
    expect(HERO_LEGACY_SRC).toContain('data-testid="hero-running-sum"');
  });

  it('ring hero branches its caption by mode (simple dayGoal vs advanced running-sum)', () => {
    expect(HERO_RING_SRC).toContain("mode === 'simple'");
    expect(HERO_RING_SRC).toContain('data-testid="hero-ring-daily-goal-caption"');
    expect(HERO_RING_SRC).toContain('data-testid="hero-ring-running-sum"');
    expect(HERO_RING_SRC).toContain('t.home.dayGoal.replace');
  });

  it('mode prop uses canonical `simple | advanced` (no `detailed` drift)', () => {
    expect(HERO_LEGACY_SRC).toMatch(/mode\??:\s*'simple'\s*\|\s*'advanced'/);
    expect(HERO_RING_SRC).toMatch(/mode\??:\s*'simple'\s*\|\s*'advanced'/);
    // The deprecated `'detailed'` literal must not appear in either file.
    expect(HERO_LEGACY_SRC).not.toContain("'detailed'");
    expect(HERO_RING_SRC).not.toContain("'detailed'");
  });
});

describe('Home.tsx — flag-gated ProgressPreviewCard', () => {
  it('imports featureFlags module', () => {
    expect(HOME_SRC).toContain("from '../../../lib/featureFlags'");
  });

  it('wraps ProgressPreviewCard in a !featureFlags.homeRingGrid guard', () => {
    expect(HOME_SRC).toMatch(/!featureFlags\.homeRingGrid[\s\S]*?<ProgressPreviewCard/);
  });

  it('still passes weightHistory + unitSystem + targetWeight props (no signature drift)', () => {
    expect(HOME_SRC).toContain('weightHistory={weightHistory as any[]}');
    expect(HOME_SRC).toContain("unitSystem={userProfile?.unitSystem ?? 'metric'}");
    expect(HOME_SRC).toContain('targetWeight={userProfile?.targetWeight}');
  });
});

describe('i18n — ringAriaLabel key is symmetric across locales', () => {
  it('ES has home.ringAriaLabel with {remaining} placeholder', () => {
    expect(ES_SRC).toMatch(/ringAriaLabel: '[^']*\{remaining\}[^']*'/);
  });

  it('EN has home.ringAriaLabel with {remaining} placeholder', () => {
    expect(EN_SRC).toMatch(/ringAriaLabel: '[^']*\{remaining\}[^']*'/);
  });
});
