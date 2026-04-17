/**
 * BottomSheet anatomy — ADR-009.
 *
 * Locks the Bevel-style bottom-sheet defaults declared in ADR-009 so that a
 * future refactor cannot silently drop handle-pill, max-height, top radius,
 * or overlay opacity. This is a static file check (no DOM render) — reads
 * `src/components/ui/bottom-sheet.tsx` and asserts the expected token strings
 * are present.
 *
 * If this test fails, either (a) a default was changed intentionally and the
 * ADR needs an amendment + this test updated, or (b) the defaults regressed
 * and need to be restored.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import BottomSheet from '@/components/ui/bottom-sheet';

const SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/ui/bottom-sheet.tsx'),
  'utf8',
);

describe('BottomSheet — ADR-009 anatomy', () => {
  it('exports a default component', () => {
    expect(BottomSheet).toBeTruthy();
    expect(typeof BottomSheet).toBe('function');
  });

  it('caps height at 88vh (status bar + dynamic island visible behind)', () => {
    expect(SRC).toMatch(/max-h-\[88vh\]/);
  });

  it('uses rounded-t-3xl top corners', () => {
    expect(SRC).toMatch(/rounded-t-3xl/);
  });

  it('renders a handle pill (visual swipe-to-close affordance)', () => {
    // Pill = w-8 h-1 rounded-full bg-outline-variant/60
    expect(SRC).toMatch(/h-1 w-8[^"'`]*rounded-full[^"'`]*bg-outline-variant\/60/);
  });

  it('uses overlay opacity 25% (not 50% — keeps context visible)', () => {
    expect(SRC).toMatch(/bg-black\/25/);
    expect(SRC).not.toMatch(/bg-black\/50/);
  });

  it('renders a sticky header with close button at HIG 44×44', () => {
    // Close button slot is w-11 h-11 (44×44)
    expect(SRC).toMatch(/w-11 h-11/);
    // Close button is a radix Close
    expect(SRC).toMatch(/SheetPrimitive\.Close/);
  });

  it('scrollable body is separate from sheet frame (content grows, sheet does not)', () => {
    expect(SRC).toMatch(/data-slot="bottom-sheet-body"/);
    expect(SRC).toMatch(/overflow-y-auto/);
  });

  it('portal + overlay + content from radix Dialog (same primitive as shadcn Sheet, stacking supported)', () => {
    expect(SRC).toMatch(/SheetPrimitive\.Portal/);
    expect(SRC).toMatch(/SheetPrimitive\.Overlay/);
    expect(SRC).toMatch(/SheetPrimitive\.Content/);
  });

  it('provides radix DialogTitle + DialogDescription for a11y (not just visual)', () => {
    expect(SRC).toMatch(/SheetPrimitive\.Title/);
    expect(SRC).toMatch(/SheetPrimitive\.Description/);
  });

  it('footer slot applies safe-area-inset padding for iOS', () => {
    expect(SRC).toMatch(/env\(safe-area-inset-bottom\)/);
  });
});
