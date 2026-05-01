/**
 * Chip primitive shape lock — chip rework v3 [1.5.188, 2026-05-01].
 *
 * Locks the canonical chip language across the 5 primitives:
 *   - StatusChip      (Home Streak/RealScore/DayStatus/QuickStats)
 *   - ChipRow         (Cocina/Discovery filters, FilterSheet sections)
 *   - ActiveFilterStrip (applied-filter chips)
 *   - TabNav          (source/view tabs)
 *   - SortControl     (ordering trigger)
 *
 * Convention (Apple HIG / Material M3 / Whoop alignment):
 *   - height       : min-h-7 (28px) — compact-chip target
 *   - padding-y    : py-1 (4px) — explicit vertical breathing
 *   - padding-x    : px-3 (12px) — horizontal holgura
 *   - text-size    : text-micro (10px) — readable, AAA-safe
 *   - text-weight  : font-medium (500), NOT semibold/bold
 *   - text-casing  : normal-case + tracking-normal (NOT uppercase tracking-widest)
 *   - font-family  : default body (Satoshi) — NO `font-headline` / `font-label`
 *
 * Drift to band-label (uppercase tracking-widest font-bold) or token drift
 * (text-caption / text-pico on chip-shaped surfaces) breaks this lock.
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
  it('StatusChip uses text-micro + font-medium + 28px chip with py-1', () => {
    expect(STATUS_CHIP).toMatch(/min-h-7/);
    expect(STATUS_CHIP).toMatch(/py-1/);
    expect(STATUS_CHIP).toMatch(/text-micro/);
    expect(STATUS_CHIP).toMatch(/font-medium/);
    expect(STATUS_CHIP).toMatch(/normal-case/);
    expect(STATUS_CHIP).toMatch(/tracking-normal/);
    expect(STATUS_CHIP).not.toMatch(/font-headline|font-semibold|font-bold/);
    expect(STATUS_CHIP).not.toMatch(/uppercase|tracking-widest|tracking-wider/);
  });

  it('ChipRow pill uses text-micro + font-medium + min-h-7 + py-1', () => {
    const pillBlock = CHIP_ROW.match(/'shrink-0[^']*rounded-full[^']*'/)?.[0] ?? '';
    expect(pillBlock).toContain('min-h-7');
    expect(pillBlock).toContain('py-1');
    expect(pillBlock).toContain('text-micro');
    expect(pillBlock).toContain('font-medium');
    expect(pillBlock).toContain('normal-case');
    expect(pillBlock).toContain('tracking-normal');
    expect(pillBlock).not.toContain('font-headline');
    expect(pillBlock).not.toContain('font-semibold');
  });

  it('ActiveFilterStrip chip uses text-micro + font-medium + min-h-7 + py-1', () => {
    expect(ACTIVE_STRIP).toMatch(/min-h-7/);
    expect(ACTIVE_STRIP).toMatch(/py-1/);
    expect(ACTIVE_STRIP).toMatch(/text-micro/);
    expect(ACTIVE_STRIP).toMatch(/font-medium/);
    expect(ACTIVE_STRIP).not.toMatch(/font-headline/);
  });

  it('TabNav tab uses text-micro + font-medium + normal-case', () => {
    expect(TAB_NAV).toMatch(/text-micro/);
    expect(TAB_NAV).toMatch(/font-medium/);
    expect(TAB_NAV).toMatch(/normal-case/);
    expect(TAB_NAV).not.toMatch(/font-headline|font-semibold/);
  });

  it('SortControl label uses text-micro + font-medium', () => {
    expect(SORT_CONTROL).toMatch(/text-micro/);
    expect(SORT_CONTROL).toMatch(/font-medium/);
    expect(SORT_CONTROL).not.toMatch(/font-headline|font-semibold/);
  });
});

describe('Chip token — text-micro reaffirmed', () => {
  it('--text-micro is 10px (0.625rem) in design-system tokens', () => {
    const indexCss = read('src/index.css');
    expect(indexCss).toMatch(/--text-micro:\s*0\.625rem/);
  });
});
