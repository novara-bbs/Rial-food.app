/**
 * Design tokens — ADR-002 + ADR-007.
 *
 * Parses `src/index.css` and asserts that the canonical token families exist
 * in the `@theme` block. Fails if a token is renamed or removed without
 * updating the design-system spec + callers.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');

/** Returns true if the `--name:` declaration exists anywhere in src/index.css. */
function hasToken(name: string): boolean {
  const re = new RegExp(`--${name.replace(/[-]/g, '\\-')}\\s*:`, 'm');
  return re.test(css);
}

describe('Design tokens — typography scale (ADR-002)', () => {
  const required = [
    'text-micro',
    'text-caption',
    'text-label',
    'text-body-sm',
    'text-body',
    'text-body-lg',
    'text-title-sm',
    'text-title',
    'text-headline',
    'text-display',
  ];

  for (const token of required) {
    it(`declares --${token}`, () => {
      expect(hasToken(token), `Missing --${token} in src/index.css @theme block`).toBe(true);
    });
  }
});

describe('Design tokens — shadow scale (ADR-002)', () => {
  const required = ['shadow-elev-0', 'shadow-elev-1', 'shadow-elev-2', 'shadow-elev-3'];
  for (const token of required) {
    it(`declares --${token}`, () => {
      expect(hasToken(token), `Missing --${token}`).toBe(true);
    });
  }
});

describe('Design tokens — radius scale (ADR-007)', () => {
  const required = ['radius', 'radius-xs', 'radius-sm', 'radius-md', 'radius-lg', 'radius-xl', 'radius-2xl'];
  for (const token of required) {
    it(`declares --${token}`, () => {
      expect(hasToken(token), `Missing --${token}`).toBe(true);
    });
  }
});

describe('Design tokens — font families', () => {
  it('declares the three font tokens', () => {
    expect(hasToken('font-headline')).toBe(true);
    expect(hasToken('font-body')).toBe(true);
    expect(hasToken('font-label')).toBe(true);
  });

  it('loads JetBrains Mono via @import (bug regression guard)', () => {
    expect(css.includes('JetBrains+Mono') || css.includes('JetBrains%20Mono')).toBe(true);
  });

  it('wires --font-label to JetBrains Mono', () => {
    expect(/--font-label:\s*"JetBrains Mono"/.test(css)).toBe(true);
  });
});
