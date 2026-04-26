/**
 * Home Quick Stats shape — Phase 1 Home rework.
 *
 * Locks the contract from `.claude/plans/razona-el-header-de-generic-cocke.md` §3:
 *   - Chip-row wrapper uses horizontal-scroll primitives that clear the
 *     `PageShell px-6` gutter (so 4 chips on a 320 px viewport don't overflow).
 *   - Each chip is a `min-h-11` button (HIG touch target).
 *   - Simple mode returns null — the lonely-chip case is skipped by design.
 *   - Advanced mode conditionally omits chips when upstream data is missing
 *     (weightDelta undefined, activity.minutes === 0, insightCount === 0).
 *   - Theme tokens only (no hardcoded hex, no `dark:` prefix per ADR-005).
 *   - i18n keys exist on both locales.
 *
 * Static file-read pattern — mirrors `home-hero.test.ts`.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const COMPONENT_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/features/home/components/HomeQuickStats.tsx'),
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

describe('HomeQuickStats — Phase 1 chip-row anatomy', () => {
  it('skips the row entirely in simple mode (lonely-chip guard)', () => {
    expect(COMPONENT_SRC).toMatch(/if \(mode === 'simple'\) return null;/);
  });

  it('uses the canonical simple | advanced mode prop (no detailed drift)', () => {
    expect(COMPONENT_SRC).toMatch(/mode:\s*'simple'\s*\|\s*'advanced'/);
    expect(COMPONENT_SRC).not.toContain("'detailed'");
  });

  it('wrapper clears PageShell px-6 gutter with -mx-6 px-6 and enables snap-scroll', () => {
    expect(COMPONENT_SRC).toContain('-mx-6');
    expect(COMPONENT_SRC).toContain('px-6');
    expect(COMPONENT_SRC).toContain('overflow-x-auto');
    expect(COMPONENT_SRC).toContain('snap-x');
  });

  it('tags the wrapper with data-testid for integration tests', () => {
    expect(COMPONENT_SRC).toContain('data-testid="home-quick-stats"');
  });

  it('each chip uses a min-h-11 HIG-compliant touch target', () => {
    expect(COMPONENT_SRC).toMatch(/min-h-11[^'"`]*px-3[^'"`]*rounded-full/);
  });

  it('exposes onNavigate with the 4 canonical targets', () => {
    expect(COMPONENT_SRC).toMatch(/QuickStatTarget\s*=\s*'hydration'\s*\|\s*'progress'\s*\|\s*'activity'\s*\|\s*'insights'/);
    expect(COMPONENT_SRC).toContain("onNavigate('hydration')");
    expect(COMPONENT_SRC).toContain("onNavigate('progress')");
    expect(COMPONENT_SRC).toContain("onNavigate('activity')");
    expect(COMPONENT_SRC).toContain("onNavigate('insights')");
  });

  it('returns null when advanced mode has no data (all optional chips gated)', () => {
    // `if (chips.length === 0) return null;` is the empty-advanced guard.
    expect(COMPONENT_SRC).toMatch(/if \(chips\.length === 0\) return null;/);
  });

  it('uses theme tokens only (no hardcoded hex, no dark: prefix)', () => {
    expect(COMPONENT_SRC).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(COMPONENT_SRC).not.toContain('dark:');
  });

  it('reads chip labels via t.home.quick* i18n keys (no hardcoded strings)', () => {
    expect(COMPONENT_SRC).toContain('t.home.quickHydration');
    expect(COMPONENT_SRC).toContain('t.home.quickWeight');
    expect(COMPONENT_SRC).toContain('t.home.quickActivity');
    expect(COMPONENT_SRC).toContain('t.home.quickInsights');
    expect(COMPONENT_SRC).toContain('t.home.quickTraining');
  });
});

describe('i18n — HomeQuickStats keys symmetric across locales', () => {
  const keys = [
    'quickHydration',
    'quickWeight',
    'quickActivity',
    'quickInsights',
    'quickRest',
    'quickTraining',
  ];

  it.each(keys)('ES defines home.%s', (key) => {
    expect(ES_SRC).toMatch(new RegExp(`${key}: '[^']+'`));
  });

  it.each(keys)('EN defines home.%s', (key) => {
    expect(EN_SRC).toMatch(new RegExp(`${key}: '[^']+'`));
  });
});
