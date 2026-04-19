/**
 * FamilyCard anatomy — Food Families P2.
 *
 * Static-file-read lock (mirrors `bottom-sheet.test.ts` + `constant-tile.test.ts`)
 * of the primary-view shape: collapsed header is a HIG-compliant button with
 * `aria-expanded` + `aria-controls` wiring to the expanded panel, which is a
 * `role="region"` labelled by the toggle button. Token purity rules
 * (no `text-[Npx]`, no `dark:` prefix, no `shadow-{sm,md,lg}`) are enforced
 * here so FamilyCard never slips back into design-drift even when Tailwind
 * classes get shuffled.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const FAMILY_CARD = resolve(__dirname, '..', '..', 'features', 'food', 'components', 'FamilyCard.tsx');
const VARIANT_ROW = resolve(__dirname, '..', '..', 'features', 'food', 'components', 'VariantRow.tsx');

const familyCardSrc = readFileSync(FAMILY_CARD, 'utf8');
const variantRowSrc = readFileSync(VARIANT_ROW, 'utf8');

describe('FamilyCard.tsx', () => {
  it('has a default export', () => {
    expect(familyCardSrc).toMatch(/export default function FamilyCard/);
  });

  it('collapsed header is a <button> with aria-expanded + aria-controls', () => {
    expect(familyCardSrc).toMatch(/<button[^>]*\s+aria-expanded=\{expanded\}/);
    expect(familyCardSrc).toMatch(/aria-controls=\{panelId\}/);
    expect(familyCardSrc).toMatch(/id=\{buttonId\}/);
  });

  it('header meets HIG minimum tap height (min-h-11)', () => {
    // `min-h-11` maps to 44px — the iOS HIG / Material minimum. Anything
    // smaller would regress the tap target; anything bigger is also fine.
    expect(familyCardSrc).toMatch(/\bmin-h-11\b/);
  });

  it('expanded panel is role=region labelled by the toggle button', () => {
    expect(familyCardSrc).toMatch(/role="region"/);
    expect(familyCardSrc).toMatch(/aria-labelledby=\{buttonId\}/);
    expect(familyCardSrc).toMatch(/id=\{panelId\}/);
  });

  it('renders a "Primary" badge on the canonical variant panel', () => {
    expect(familyCardSrc).toMatch(/t\.foodDictionary\.primaryLabel/);
  });

  it('shows a variants counter badge only when non-canonical variants exist', () => {
    expect(familyCardSrc).toMatch(/variantCount > 0/);
    expect(familyCardSrc).toMatch(/variantsCountOne/);
    expect(familyCardSrc).toMatch(/variantsCount/);
  });

  it('renders non-canonical variants via <VariantRow>', () => {
    expect(familyCardSrc).toMatch(/import VariantRow/);
    expect(familyCardSrc).toMatch(/<VariantRow/);
  });

  it('uses token classes (no text-[Npx], no shadow-{sm,md,lg}, no dark:)', () => {
    expect(familyCardSrc).not.toMatch(/text-\[\d+px\]/);
    expect(familyCardSrc).not.toMatch(/\bshadow-(sm|md|lg)\b/);
    expect(familyCardSrc).not.toMatch(/\bdark:/);
  });

  it('uses focus-visible ring canonical (no bare focus-ring drift)', () => {
    expect(familyCardSrc).toMatch(/focus-visible:ring-2/);
    expect(familyCardSrc).toMatch(/focus-visible:ring-primary\/60/);
  });
});

describe('VariantRow.tsx', () => {
  it('has a default export', () => {
    expect(variantRowSrc).toMatch(/export default function VariantRow/);
  });

  it('is a <button> with aria-pressed reflecting selected state', () => {
    expect(variantRowSrc).toMatch(/<button/);
    expect(variantRowSrc).toMatch(/aria-pressed=\{Boolean\(selected\)\}/);
  });

  it('embeds the signed macro delta via <MacroDelta>', () => {
    expect(variantRowSrc).toMatch(/import MacroDelta/);
    expect(variantRowSrc).toMatch(/<MacroDelta/);
  });

  it('uses token classes (no text-[Npx], no shadow-{sm,md,lg}, no dark:)', () => {
    expect(variantRowSrc).not.toMatch(/text-\[\d+px\]/);
    expect(variantRowSrc).not.toMatch(/\bshadow-(sm|md|lg)\b/);
    expect(variantRowSrc).not.toMatch(/\bdark:/);
  });
});
