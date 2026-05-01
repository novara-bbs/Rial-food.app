/**
 * Chip primitive shape lock — Lote 1+2 [post-2026-05-01].
 *
 * Locks the canonical chip language across the 5 primitives:
 *   - StatusChip      (Home Streak/RealScore/DayStatus/QuickStats)
 *   - ChipRow         (Cocina/Discovery filters, FilterSheet sections)
 *   - ActiveFilterStrip (applied-filter chips)
 *   - TabNav          (source/view tabs)
 *   - SortControl     (ordering trigger)
 *
 * Convention (ADR-013 + chip rework 2026-05-01):
 *   - height       : min-h-[22px] — compact density
 *   - padding-x    : px-2 / px-2.5 (compact, no inflation)
 *   - radius       : rounded-full (chips), rounded-sm (rounded-square triggers like FilterButton)
 *   - text-size    : text-pico (8px) — body font, NOT headline
 *   - text-weight  : font-medium (500), NOT semibold/bold
 *   - text-casing  : normal-case + tracking-normal (NOT uppercase tracking-widest)
 *   - font-family  : default body (Satoshi) — NO `font-headline` / `font-label`
 *
 * Drift to band-label (uppercase tracking-widest font-bold) or token drift
 * (text-caption / text-micro on chip-shaped surfaces) breaks this lock.
 *
 * Static file-read pattern — mirrors `home-quick-stats.test.ts`.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.resolve(ROOT, rel), 'utf8');

const STATUS_CHIP = read('src/components/ui/StatusChip.tsx');
const CHIP_ROW = read('src/components/patterns/ChipRow.tsx');
const ACTIVE_STRIP = read('src/components/patterns/ActiveFilterStrip.tsx');
const TAB_NAV = read('src/components/patterns/TabNav.tsx');
const SORT_CONTROL = read('src/components/patterns/SortControl.tsx');

describe('Chip primitive — typography lock (post-2026-05-01)', () => {
  it('StatusChip uses text-pico + font-medium + normal-case (22px chip)', () => {
    expect(STATUS_CHIP).toMatch(/min-h-\[22px\]/);
    expect(STATUS_CHIP).toMatch(/text-pico/);
    expect(STATUS_CHIP).toMatch(/font-medium/);
    expect(STATUS_CHIP).toMatch(/normal-case/);
    expect(STATUS_CHIP).toMatch(/tracking-normal/);
    expect(STATUS_CHIP).not.toMatch(/font-headline|font-semibold|font-bold/);
    expect(STATUS_CHIP).not.toMatch(/uppercase|tracking-widest|tracking-wider/);
  });

  it('ChipRow pill uses text-pico + font-medium + min-h-[22px]', () => {
    // Match only the pill className (not the deprecated icon variant)
    const pillBlock = CHIP_ROW.match(/'shrink-0[^']*rounded-full[^']*'/)?.[0] ?? '';
    expect(pillBlock).toContain('min-h-[22px]');
    expect(pillBlock).toContain('text-pico');
    expect(pillBlock).toContain('font-medium');
    expect(pillBlock).toContain('normal-case');
    expect(pillBlock).toContain('tracking-normal');
    expect(pillBlock).not.toContain('font-headline');
    expect(pillBlock).not.toContain('font-semibold');
  });

  it('ActiveFilterStrip chip uses text-pico + font-medium + min-h-[22px]', () => {
    expect(ACTIVE_STRIP).toMatch(/min-h-\[22px\]/);
    expect(ACTIVE_STRIP).toMatch(/text-pico/);
    expect(ACTIVE_STRIP).toMatch(/font-medium/);
    expect(ACTIVE_STRIP).not.toMatch(/font-headline/);
  });

  it('TabNav tab uses text-pico + font-medium + normal-case', () => {
    expect(TAB_NAV).toMatch(/text-pico/);
    expect(TAB_NAV).toMatch(/font-medium/);
    expect(TAB_NAV).toMatch(/normal-case/);
    expect(TAB_NAV).not.toMatch(/font-headline|font-semibold/);
  });

  it('SortControl label uses text-pico + font-medium', () => {
    expect(SORT_CONTROL).toMatch(/text-pico/);
    expect(SORT_CONTROL).toMatch(/font-medium/);
    expect(SORT_CONTROL).not.toMatch(/font-headline|font-semibold/);
  });
});

describe('Chip token — text-pico defined', () => {
  it('--text-pico is registered in design-system tokens', () => {
    const indexCss = read('src/index.css');
    expect(indexCss).toMatch(/--text-pico:\s*0\.5rem/);
  });
});
