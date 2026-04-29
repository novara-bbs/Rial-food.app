/**
 * Theme palettes — PR 3 Bevel adoption.
 *
 * Locks the 4 × 2 theme matrix (VOLT · OCEAN · EMBER · NEUTRAL × dark · light)
 * and the pure helpers in ThemeContext. If any class selector is renamed or
 * removed, this guardrail fails before it silently breaks runtime theming.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  PALETTES,
  COLOR_MODES,
  resolveMode,
  themeClassName,
} from '../../contexts/ThemeContext';

const css = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');

const EXPECTED_CLASSES = [
  'theme-volt-dark',
  'theme-volt-light',
  'theme-ocean-dark',
  'theme-ocean-light',
  'theme-ember-dark',
  'theme-ember-light',
  'theme-neutral-dark',
  'theme-neutral-light',
];

describe('Theme palettes — CSS matrix (8 classes)', () => {
  for (const cls of EXPECTED_CLASSES) {
    it(`declares .${cls} in src/index.css`, () => {
      const re = new RegExp(`\\.${cls}\\b`);
      expect(re.test(css), `Missing .${cls} selector`).toBe(true);
    });
  }

  it('keeps :root as initial-paint fallback for volt-dark', () => {
    expect(/:root[^{]*,[^{]*\.theme-volt-dark\s*\{/.test(css)).toBe(true);
  });
});

describe('Theme palettes — exported enums', () => {
  it('lists the 4 canonical palettes', () => {
    expect(PALETTES).toEqual(['volt', 'ocean', 'ember', 'neutral']);
  });

  it('lists the 3 color modes with auto first', () => {
    expect(COLOR_MODES).toEqual(['auto', 'light', 'dark']);
  });
});

describe('Theme palettes — resolveMode', () => {
  it('passes through explicit light/dark regardless of system', () => {
    expect(resolveMode('light', 'dark')).toBe('light');
    expect(resolveMode('dark', 'light')).toBe('dark');
  });

  it('follows system when mode is auto', () => {
    expect(resolveMode('auto', 'dark')).toBe('dark');
    expect(resolveMode('auto', 'light')).toBe('light');
  });
});

describe('Theme palettes — themeClassName', () => {
  it('produces the 8 expected class names', () => {
    const produced = new Set<string>();
    for (const p of PALETTES) {
      produced.add(themeClassName(p, 'dark'));
      produced.add(themeClassName(p, 'light'));
    }
    expect([...produced].sort()).toEqual([...EXPECTED_CLASSES].sort());
  });
});

/**
 * NEUTRAL brand + accessibility locks (ADR-011).
 *
 * Only brand identity and AAA-contrast anchors are locked here.
 * Surface-ladder tokens (--background, --surface, --surface-container-*)
 * are intentionally NOT locked — they are cosmetic tone choices that can be
 * tuned in src/index.css without touching this file.
 */
describe('Theme palettes — NEUTRAL brand tokens (ADR-011)', () => {
  it('NEUTRAL LIGHT keeps primary near-black #09090b (monochrome brand identity)', () => {
    expect(/\.theme-neutral-light\s*\{[^}]*--primary:\s*#09090b/.test(css)).toBe(true);
  });

  it('NEUTRAL LIGHT keeps Emerald 600 #059669 as brand-secondary (not primary)', () => {
    expect(/\.theme-neutral-light\s*\{[^}]*--brand-secondary:\s*#059669/.test(css)).toBe(true);
  });

  it('NEUTRAL LIGHT chart-text is warm Stone 500 #78716c (temperature-match, AAA)', () => {
    expect(/\.theme-neutral-light\s*\{[^}]*--chart-text:\s*#78716c/.test(css)).toBe(true);
  });
});
