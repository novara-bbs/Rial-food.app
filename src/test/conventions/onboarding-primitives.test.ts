/**
 * Onboarding primitives — shape lock for the redesigned flow.
 *
 * Locks the shape of `<OnboardingScaffold>`, `<RadioCardGroup>`,
 * `<NumberStepper>`, `<TogglePillGroup>`, plus consumer sanity on
 * `Onboarding.tsx` so future refactors can't silently drift away from the
 * canonical anatomy.
 *
 * Static file-read pattern keeps the test fast (no DOM render).
 */
import fs from 'node:fs';
import path from 'node:path';

import { describe, it, expect } from 'vitest';

import RadioCardGroup, { type RadioCardOption } from '@/components/ui/RadioCardGroup';
import OnboardingScaffold from '@/features/onboarding/components/OnboardingScaffold';
import NumberStepper from '@/features/onboarding/components/NumberStepper';
import TogglePillGroup from '@/features/onboarding/components/TogglePillGroup';

const ROOT = process.cwd();
const SCAFFOLD_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/features/onboarding/components/OnboardingScaffold.tsx'),
  'utf8',
);
const RADIO_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/components/ui/RadioCardGroup.tsx'),
  'utf8',
);
const STEPPER_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/features/onboarding/components/NumberStepper.tsx'),
  'utf8',
);
const PILLS_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/features/onboarding/components/TogglePillGroup.tsx'),
  'utf8',
);
const ONBOARDING_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/features/onboarding/Onboarding.tsx'),
  'utf8',
);

describe('Onboarding primitives — module surface', () => {
  it('exports the 4 primitives as default components', () => {
    expect(typeof OnboardingScaffold).toBe('function');
    expect(typeof RadioCardGroup).toBe('function');
    expect(typeof NumberStepper).toBe('function');
    expect(typeof TogglePillGroup).toBe('function');
  });

  it('exports the radio option contract by name (type-only)', () => {
    const radioOption: RadioCardOption<'a' | 'b'> = { id: 'a', label: 'A' };
    expect(radioOption.id).toBe('a');
  });
});

describe('OnboardingScaffold — anatomy', () => {
  it('uses the Heading primitive (no raw <h1..h4>)', () => {
    expect(SCAFFOLD_SRC).toContain("from '@/components/ui/Typography'");
    expect(SCAFFOLD_SRC).not.toMatch(/<h[1-6]\b/);
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

describe('RadioCardGroup — a11y + anatomy', () => {
  it('outer wrapper has role="radiogroup" + ariaLabel passthrough', () => {
    expect(RADIO_SRC).toContain('role="radiogroup"');
    expect(RADIO_SRC).toContain('aria-label={ariaLabel}');
  });

  it('each card renders as role="radio" with aria-checked={selected}', () => {
    expect(RADIO_SRC).toContain('role="radio"');
    expect(RADIO_SRC).toContain('aria-checked={selected}');
  });

  it('tap area is HIG-sized via p-4', () => {
    expect(RADIO_SRC).toContain('p-4 rounded-sm border');
  });

  it('uses theme tokens only (no hex, no dark:)', () => {
    expect(RADIO_SRC).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(RADIO_SRC).not.toContain('dark:');
  });
});

describe('NumberStepper — a11y + tap target', () => {
  it('uses Button primitive for +/− (no raw branded buttons)', () => {
    expect(STEPPER_SRC).toContain("from '@/components/ui/button'");
  });

  it('center input declares inputMode for numeric keypads', () => {
    expect(STEPPER_SRC).toContain('inputMode={precision > 0');
  });

  it('threads aria-invalid + aria-describedby for error rendering', () => {
    expect(STEPPER_SRC).toContain('aria-invalid={invalid');
    expect(STEPPER_SRC).toContain('aria-describedby={describedBy}');
  });

  it('uses theme tokens only (no hex, no dark:)', () => {
    expect(STEPPER_SRC).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(STEPPER_SRC).not.toContain('dark:');
  });
});

describe('TogglePillGroup — a11y + multi-select semantics', () => {
  it('outer wrapper carries role="group"', () => {
    expect(PILLS_SRC).toContain('role="group"');
  });

  it('each pill carries aria-pressed for toggle state', () => {
    expect(PILLS_SRC).toContain('aria-pressed={isOn}');
  });

  it('pills meet HIG tap target via min-h-11', () => {
    expect(PILLS_SRC).toContain('min-h-11');
  });

  it('uses theme tokens only (no hex, no dark:)', () => {
    expect(PILLS_SRC).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(PILLS_SRC).not.toContain('dark:');
  });
});

describe('Onboarding.tsx — consumer sanity', () => {
  it('imports the canonical primitives from the feature module', () => {
    expect(ONBOARDING_SRC).toContain("from './components/OnboardingHeader'");
    expect(ONBOARDING_SRC).toContain("from './components/OnboardingFooter'");
  });

  it('renders all 9 steps via a switch on stepId', () => {
    expect(ONBOARDING_SRC).toContain('WelcomeStep');
    expect(ONBOARDING_SRC).toContain('GoalStep');
    expect(ONBOARDING_SRC).toContain('IdentityStep');
    expect(ONBOARDING_SRC).toContain('BodyStep');
    expect(ONBOARDING_SRC).toContain('ActivityStep');
    expect(ONBOARDING_SRC).toContain('TrainingStep');
    expect(ONBOARDING_SRC).toContain('PlanRevealStep');
    expect(ONBOARDING_SRC).toContain('DietStep');
    expect(ONBOARDING_SRC).toContain('DoneStep');
  });

  it('declares aria-modal + aria-labelledby on the dialog wrapper', () => {
    expect(ONBOARDING_SRC).toContain('role="dialog"');
    expect(ONBOARDING_SRC).toContain('aria-modal="true"');
    expect(ONBOARDING_SRC).toContain('aria-labelledby={TITLE_ID}');
  });

  it('persists draft via clearDraft / saveDraft from state/persist', () => {
    expect(ONBOARDING_SRC).toContain('clearDraft');
    expect(ONBOARDING_SRC).toContain('saveDraft');
  });
});
