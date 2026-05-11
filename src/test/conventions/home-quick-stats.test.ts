/**
 * Home Quick Stats shape — Phase 1 Home rework.
 *
 * Locks the contract from `.claude/plans/razona-el-header-de-generic-cocke.md` §3.
 *
 * Changes vs. original:
 *   - Hydration chip removed [1.5.174] — the Hydration SectionCard below the fold
 *     already surfaces consumed/target; duplicate chip was redundant in advanced mode.
 *   - Inline `<button>` with CHIP_BASE replaced by StatusChip primitive [1.5.174].
 *   - QuickStatTarget narrowed to 3 targets: 'progress' | 'activity' | 'insights'.
 *   - Sprint E [1.5.219]: `mode: 'simple' | 'advanced'` prop migrated to
 *     `tier: DetailTier` driven by `UserPreferences`. The "simple returns null"
 *     guard is preserved but now checked via `tier === 'simple'`.
 *
 * Invariants preserved:
 *   - Simple tier returns null.
 *   - Wrapper clears PageShell px-6 gutter (-mx-6 px-6) + snap-scroll.
 *   - Theme tokens only (no hex, no dark: prefix — ADR-005).
 *   - i18n keys exist on both locales (quickHydration key kept in locale for future use).
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
  it('skips the row entirely in simple tier (lonely-chip guard)', () => {
    // Sprint E [1.5.219]: prop renamed from `mode` to `tier`. Guard kept.
    expect(COMPONENT_SRC).toMatch(/if \(tier === 'simple'\) return null;/);
  });

  it('uses the new tier: DetailTier prop (Sprint E [1.5.219])', () => {
    expect(COMPONENT_SRC).toMatch(/tier:\s*DetailTier/);
    expect(COMPONENT_SRC).not.toContain("'detailed'");
    // Strip comment lines before checking — the migration JSDoc mentions the
    // legacy prop shape on purpose. Only the actual code body must not reintroduce it.
    const codeOnly = COMPONENT_SRC.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
    expect(codeOnly).not.toMatch(/mode:\s*'simple'\s*\|\s*'advanced'/);
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

  it('uses StatusChip primitive (not inline button with CHIP_BASE)', () => {
    expect(COMPONENT_SRC).toContain('StatusChip');
    expect(COMPONENT_SRC).not.toContain('CHIP_BASE');
    expect(COMPONENT_SRC).not.toContain("rounded-full border border-outline-variant bg-surface");
  });

  it('exposes onNavigate with 3 canonical targets (hydration removed — dedup with SectionCard)', () => {
    expect(COMPONENT_SRC).toMatch(/QuickStatTarget\s*=\s*'progress'\s*\|\s*'activity'\s*\|\s*'insights'/);
    expect(COMPONENT_SRC).toContain("onNavigate('progress')");
    expect(COMPONENT_SRC).toContain("onNavigate('activity')");
    expect(COMPONENT_SRC).toContain("onNavigate('insights')");
    expect(COMPONENT_SRC).not.toContain("onNavigate('hydration')");
  });

  it('returns null when advanced mode has no data (all optional chips gated)', () => {
    expect(COMPONENT_SRC).toMatch(/if \(!hasWeight && !hasActivity && !hasInsights\) return null;/);
  });

  it('uses theme tokens only (no hardcoded hex, no dark: prefix)', () => {
    expect(COMPONENT_SRC).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(COMPONENT_SRC).not.toContain('dark:');
  });

  it('reads chip labels via t.home.quick* i18n keys (no hardcoded strings)', () => {
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
