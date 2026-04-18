/**
 * ConstantTile — locks the 6-state contract from ADR-009 V2 addendum (playbook §4.10).
 *
 * The primitive is the single source of truth for biometric tiles across
 * Progress (Body → Summary), future Home secondary rail, and (post-Q6)
 * Settings → Datos. Regressing any of these assertions would break the
 * uniform look the user learns once and recognises everywhere.
 *
 * Static file-read check pattern — matches `bottom-sheet.test.ts` convention.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import ConstantTile, { type ConstantTileState } from '@/components/ConstantTile';

const SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/ConstantTile.tsx'),
  'utf8',
);

describe('ConstantTile — module surface', () => {
  it('exports a default component', () => {
    expect(ConstantTile).toBeTruthy();
    expect(typeof ConstantTile).toBe('function');
  });

  it('exports ConstantTileState type (type-only)', () => {
    // Type-only assertion: if the type is dropped or renamed, this file
    // would fail to typecheck and the build would break before tests run.
    const exhaustive: ConstantTileState[] = [
      'loading',
      'empty-no-template',
      'empty-no-data',
      'value-stable',
      'value-trending-up',
      'value-trending-down',
    ];
    expect(exhaustive).toHaveLength(6);
  });
});

describe('ConstantTile — 6 canonical states (§4.10)', () => {
  for (const state of [
    'loading',
    'empty-no-template',
    'empty-no-data',
    'value-stable',
    'value-trending-up',
    'value-trending-down',
  ] as const) {
    it(`handles state="${state}" branch explicitly`, () => {
      expect(SRC).toContain(`'${state}'`);
    });
  }

  it('emits data-state attribute for introspection', () => {
    expect(SRC).toContain('data-state={state}');
  });
});

describe('ConstantTile — empty-state copy distinction (§4.10)', () => {
  it('defaults noData to "No hay datos"', () => {
    expect(SRC).toContain("noData: 'No hay datos'");
  });

  it('defaults noRange to "Sin rango" (empty-no-template branch)', () => {
    expect(SRC).toContain("noRange: 'Sin rango'");
  });

  it('defaults noTrends to "Sin tendencias" (empty-no-data branch)', () => {
    expect(SRC).toContain("noTrends: 'Sin tendencias'");
  });

  it('defaults stable to "Estable" (value-stable branch)', () => {
    expect(SRC).toContain("stable: 'Estable'");
  });

  it('selects sub copy conditionally between empty-no-template and empty-no-data', () => {
    expect(SRC).toMatch(/empty-no-template.*resolvedCopy\.noRange.*resolvedCopy\.noTrends/s);
  });
});

describe('ConstantTile — anatomy invariants (ADR-009 V2 §4.10)', () => {
  it('uses aspect-[1.2/1] for uniform grid alignment', () => {
    expect(SRC).toContain('aspect-[1.2/1]');
  });

  it('uses rounded-sm (ADR-007 small radius token)', () => {
    expect(SRC).toContain('rounded-sm');
  });

  it('uses SectionCard-compatible surface (bg-surface-container-low)', () => {
    expect(SRC).toContain('bg-surface-container-low');
  });

  it('renders icon 16px (w-4 h-4) per §4.10 top-row spec', () => {
    expect(SRC).toContain("<Icon className=\"w-4 h-4\"");
  });

  it('uses text-micro + tracking-widest for 11px uppercase label', () => {
    expect(SRC).toContain('text-micro uppercase tracking-widest');
  });

  it('uses text-title-sm for hero value (§4.10 24–28 px bold)', () => {
    expect(SRC).toContain('text-title-sm text-tertiary');
  });

  it('shows loading skeleton with animate-pulse', () => {
    expect(SRC).toContain('animate-pulse');
  });
});

describe('ConstantTile — trend semantics', () => {
  it('value-trending-up uses brand-secondary (positive / warm)', () => {
    expect(SRC).toContain("'value-trending-up': 'text-brand-secondary'");
  });

  it('value-trending-down uses primary (matches weight-loss semantic)', () => {
    expect(SRC).toContain("'value-trending-down': 'text-primary'");
  });

  it('value-stable uses on-surface-variant (muted)', () => {
    expect(SRC).toContain("'value-stable': 'text-on-surface-variant'");
  });
});

describe('ConstantTile — interactive surface (ADR-003 HIG compliance)', () => {
  it('renders as <button type="button"> when onClick provided', () => {
    expect(SRC).toContain('<button');
    expect(SRC).toContain('type="button"');
  });

  it('includes focus-visible ring affordance', () => {
    expect(SRC).toContain('focus-visible:ring-1 focus-visible:ring-primary');
  });
});
