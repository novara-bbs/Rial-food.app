/**
 * Onboarding primitives — PR 9 (playbook §4.11).
 *
 * Locks the shape of `<OnboardingScaffold>` + `<RadioCardGroup>` + `<SelectList>`
 * so future refactors of the onboarding flow or new step-types (HealthKit
 * grant, Apple Sign-In, permissions — Q6+) can't silently drift away from
 * the canonical anatomy derived from Bevel IMG_0951–0972.
 *
 * Scope:
 *   1. Module surface — all 3 primitives are default exports + their option
 *      types are re-exported by name.
 *   2. Anatomy invariants (via static file read, same pattern as
 *      `constant-tile.test.ts` and `home-hero.test.ts`):
 *      - OnboardingScaffold renders an `<h3>` title + variant branch + hero
 *        + subtitle + footerNote slot semantics.
 *      - RadioCardGroup has `role="radiogroup"` + `role="radio"` +
 *        `aria-checked` + HIG-sized tap target (`p-4`).
 *      - SelectList has `ChevronRight` trailing + `min-h-14` tap area + is
 *        NOT a radiogroup (to stay distinct from RadioCardGroup).
 *   3. Token purity — no hex codes, no `dark:` prefix in any primitive.
 *   4. Consumer sanity — `Onboarding.tsx` imports the 3 primitives so the
 *      migration from hand-rolled markup actually took effect.
 *
 * Static file-read pattern keeps the test fast (no DOM render).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import OnboardingScaffold from '@/components/OnboardingScaffold';
import RadioCardGroup, { type RadioCardOption } from '@/components/RadioCardGroup';
import SelectList, { type SelectListItem } from '@/components/SelectList';

const ROOT = process.cwd();
const SCAFFOLD_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/components/OnboardingScaffold.tsx'),
  'utf8',
);
const RADIO_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/components/RadioCardGroup.tsx'),
  'utf8',
);
const SELECT_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/components/SelectList.tsx'),
  'utf8',
);
const ONBOARDING_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/features/profile/components/Onboarding.tsx'),
  'utf8',
);

describe('Onboarding primitives — module surface', () => {
  it('exports the 3 primitives as default components', () => {
    expect(OnboardingScaffold).toBeTruthy();
    expect(typeof OnboardingScaffold).toBe('function');
    expect(RadioCardGroup).toBeTruthy();
    expect(typeof RadioCardGroup).toBe('function');
    expect(SelectList).toBeTruthy();
    expect(typeof SelectList).toBe('function');
  });

  it('exports the option type contracts by name (type-only)', () => {
    // If these types are renamed or dropped, tsc breaks before tests run.
    const radioOption: RadioCardOption<'a' | 'b'> = { id: 'a', label: 'A' };
    const selectItem: SelectListItem<'a' | 'b'> = { id: 'b', label: 'B' };
    expect(radioOption.id).toBe('a');
    expect(selectItem.id).toBe('b');
  });
});

describe('OnboardingScaffold — anatomy (§4.11)', () => {
  it('renders the title as <h3> (matches legacy step-title level)', () => {
    expect(SCAFFOLD_SRC).toMatch(/<h3[\s\S]*?>[\s\S]*?\{title\}[\s\S]*?<\/h3>/);
  });

  it('branches on variant prop (default vs centered)', () => {
    expect(SCAFFOLD_SRC).toContain("variant?: 'default' | 'centered'");
    expect(SCAFFOLD_SRC).toContain("variant === 'centered'");
  });

  it('emits data-variant attribute for introspection', () => {
    expect(SCAFFOLD_SRC).toContain('data-variant={variant}');
  });

  it('renders optional subtitle + heroSlot slots', () => {
    expect(SCAFFOLD_SRC).toContain('{heroSlot && ');
    expect(SCAFFOLD_SRC).toContain('{subtitle && ');
  });

  it('uses theme tokens only (no hex, no dark:)', () => {
    expect(SCAFFOLD_SRC).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(SCAFFOLD_SRC).not.toContain('dark:');
  });
});

describe('RadioCardGroup — a11y + anatomy (§4.11)', () => {
  it('outer wrapper has role="radiogroup" + ariaLabel passthrough', () => {
    expect(RADIO_SRC).toContain('role="radiogroup"');
    expect(RADIO_SRC).toContain('aria-label={ariaLabel}');
  });

  it('each card renders as role="radio" with aria-checked={selected}', () => {
    expect(RADIO_SRC).toContain('role="radio"');
    expect(RADIO_SRC).toContain('aria-checked={selected}');
  });

  it('cards are <button type="button"> (no <div onClick> anti-pattern)', () => {
    expect(RADIO_SRC).toMatch(/<button[\s\S]*?type="button"[\s\S]*?key=\{option\.id\}/);
  });

  it('tap area is HIG-sized via p-4 (>= 44px total with icon + label)', () => {
    expect(RADIO_SRC).toContain('p-4 rounded-sm border');
  });

  it('emits data-selected attribute for introspection', () => {
    expect(RADIO_SRC).toContain('data-selected={selected}');
  });

  it('active state uses theme tokens (border-primary + bg-primary/10)', () => {
    expect(RADIO_SRC).toContain('border-primary bg-primary/10');
  });

  it('uses theme tokens only (no hex, no dark:)', () => {
    expect(RADIO_SRC).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(RADIO_SRC).not.toContain('dark:');
  });
});

describe('SelectList — anatomy (§4.11, IMG_0958 pattern)', () => {
  it('renders <ul> with optional aria-label', () => {
    expect(SELECT_SRC).toMatch(/<ul[\s\S]*?aria-label=\{ariaLabel\}/);
  });

  it('each item is a <button type="button"> inside an <li>', () => {
    expect(SELECT_SRC).toContain('<li key={item.id}>');
    expect(SELECT_SRC).toMatch(/<button[\s\S]*?type="button"/);
  });

  it('trailing ChevronRight is always rendered (nav affordance)', () => {
    expect(SELECT_SRC).toContain('<ChevronRight');
    expect(SELECT_SRC).toContain("from 'lucide-react'");
  });

  it('card tap area >= HIG via min-h-14', () => {
    expect(SELECT_SRC).toContain('min-h-14');
  });

  it('is NOT a radiogroup (stays distinct from RadioCardGroup)', () => {
    expect(SELECT_SRC).not.toContain('role="radiogroup"');
    expect(SELECT_SRC).not.toContain('role="radio"');
    expect(SELECT_SRC).not.toContain('aria-checked');
  });

  it('uses theme tokens only (no hex, no dark:)', () => {
    expect(SELECT_SRC).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(SELECT_SRC).not.toContain('dark:');
  });
});

describe('Onboarding.tsx — consumer sanity', () => {
  it('imports OnboardingScaffold', () => {
    expect(ONBOARDING_SRC).toContain("from '../../../components/OnboardingScaffold'");
  });

  it('imports RadioCardGroup', () => {
    expect(ONBOARDING_SRC).toContain("from '../../../components/RadioCardGroup'");
  });

  it('mounts <OnboardingScaffold> for each of the 6 steps', () => {
    const matches = ONBOARDING_SRC.match(/<OnboardingScaffold/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(6);
  });

  it('mounts <RadioCardGroup> at least once (step 1 goals)', () => {
    expect(ONBOARDING_SRC).toContain('<RadioCardGroup');
  });

  it('uses variant="centered" on the ready step', () => {
    expect(ONBOARDING_SRC).toContain('variant="centered"');
  });
});
