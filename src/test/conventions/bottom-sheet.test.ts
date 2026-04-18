/**
 * BottomSheet anatomy — ADR-009 (V1 + V2).
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

describe('BottomSheet — ADR-009 anatomy (V1)', () => {
  it('exports a default component', () => {
    expect(BottomSheet).toBeTruthy();
    expect(typeof BottomSheet).toBe('function');
  });

  it('caps compact height at 88vh (status bar + dynamic island visible behind)', () => {
    expect(SRC).toMatch(/max-h-\[88vh\]/);
  });

  it('uses rounded-t-3xl top corners', () => {
    expect(SRC).toMatch(/rounded-t-3xl/);
  });

  it('renders a handle pill (visual swipe-to-close affordance) by default', () => {
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

describe('BottomSheet — ADR-009 anatomy (V2 — size variants)', () => {
  it('exposes a `size` prop typed as "compact" | "focus"', () => {
    expect(SRC).toMatch(/BottomSheetSize\s*=\s*'compact'\s*\|\s*'focus'/);
  });

  it('default size is `compact` (non-breaking — existing consumers unaffected)', () => {
    expect(SRC).toMatch(/size\s*=\s*['"]compact['"]/);
  });

  it('caps focus height at 92vh (only ~40 px status-bar band visible for input-heavy sheets)', () => {
    expect(SRC).toMatch(/max-h-\[92vh\]/);
  });

  it('emits `data-size` attribute so consumers / tests can introspect the variant', () => {
    expect(SRC).toMatch(/data-size=\{size\}/);
  });
});

describe('BottomSheet — ADR-009 anatomy (V2 — header layouts)', () => {
  it('exposes a `headerLayout` prop with the 3 canonical Bevel layouts', () => {
    expect(SRC).toMatch(
      /BottomSheetHeaderLayout\s*=\s*'title-centered'\s*\|\s*'cancel-action'\s*\|\s*'back-title-action'/,
    );
  });

  it('default headerLayout is `title-centered` (V1 behavior preserved)', () => {
    expect(SRC).toMatch(/headerLayout\s*=\s*['"]title-centered['"]/);
  });

  it('`cancel-action` layout renders a text button (not an icon) on the left', () => {
    // Bevel IMG_1004 / 1005 / 0988 — left = "Cancelar" text, not X icon.
    expect(SRC).toMatch(/headerLayout === 'cancel-action'/);
    expect(SRC).toMatch(/resolvedCancel/);
  });

  it('`back-title-action` layout renders a back chevron icon on the left', () => {
    // Bevel IMG_1015 / 1016 / 1019 — left = back chevron, not X.
    expect(SRC).toMatch(/headerLayout === 'back-title-action'/);
    expect(SRC).toMatch(/ChevronLeftIcon/);
  });

  it('emits `data-header-layout` attribute so consumers / tests can introspect the layout', () => {
    expect(SRC).toMatch(/data-header-layout=\{headerLayout\}/);
  });

  it('exposes `cancelLabel` / `backLabel` / `onBack` props for i18n + navigation overrides', () => {
    expect(SRC).toMatch(/cancelLabel\?:\s*string/);
    expect(SRC).toMatch(/backLabel\?:\s*string/);
    expect(SRC).toMatch(/onBack\?:\s*\(\)\s*=>\s*void/);
  });
});

describe('BottomSheet — ADR-009 anatomy (V2 — hideHandle)', () => {
  it('exposes a `hideHandle` prop for keyboard-first / navigation-stack focus sheets', () => {
    // Bevel IMG_1011 (keyboard-first) and IMG_1016 (navigation-stack) hide the handle.
    expect(SRC).toMatch(/hideHandle\?:\s*boolean/);
  });

  it('default hideHandle is false (handle is shown — V1 behavior preserved)', () => {
    expect(SRC).toMatch(/hideHandle\s*=\s*false/);
  });

  it('handle pill render is gated by `hideHandle` flag', () => {
    expect(SRC).toMatch(/!hideHandle/);
  });
});

describe('BottomSheet — ADR-009 anatomy (V2 — leftSlot escape hatch)', () => {
  it('exposes a `leftSlot` prop to override the default left-header content', () => {
    // Escape hatch for consumers that need a custom left control (e.g. destructive action like the trash icon in IMG_1015).
    expect(SRC).toMatch(/leftSlot\?:\s*React\.ReactNode/);
  });

  it('leftSlot takes precedence over the headerLayout default', () => {
    // leftSlot ?? (...) — nullish coalescing so a consumer-provided node overrides the header-layout default.
    expect(SRC).toMatch(/leftSlot\s*\?\?/);
  });
});

describe('BottomSheet — ADR-009 anatomy (V2 — actionSlot fits text buttons)', () => {
  it('actionSlot wrapper uses `min-w-11` (not `w-11`) so text buttons like "Guardar"/"Siguiente" are not clipped', () => {
    // ADR-009 V2 cancel-action layout pairs a Cancel text button (left) with a
    // primary text button (right, via actionSlot). A fixed `w-11` wrapper clips
    // anything wider than 44px. `min-w-11` preserves the HIG-compliant minimum
    // touch target while letting text buttons size to their content.
    expect(SRC).toMatch(/min-w-11 h-11[^"'`]*-mr-2[^"'`]*justify-end[^"'`]*shrink-0/);
  });
});
