/**
 * Typography primitives — ADR-012.
 *
 * Locks the `<Heading>` + `<Text>` contract so a rename, dropped variant,
 * or drifted class composition fails the build loudly before a refactor
 * ripples across the app. Complements `typography-semantic.test.ts`
 * (which scans for headline+font-bold without font-headline) by asserting
 * the primitive itself emits the canonical classes.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';

import { Heading, Text, type HeadingLevel, type HeadingVariant, type TextVariant } from '@/components/ui/Typography';

const LEVELS: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4'];
const VARIANTS: HeadingVariant[] = ['default', 'editorial', 'overline'];
const TEXT_VARIANTS: TextVariant[] = ['body-lg', 'body', 'body-sm', 'caption', 'label', 'micro'];

describe('Typography primitives — module surface (ADR-012)', () => {
  it('exports Heading and Text', () => {
    expect(Heading).toBeTruthy();
    expect(typeof Heading).toBe('function');
    expect(Text).toBeTruthy();
    expect(typeof Text).toBe('function');
  });
});

describe('Heading — tag + variant matrix (ADR-012)', () => {
  for (const level of LEVELS) {
    for (const variant of VARIANTS) {
      it(`renders <${level}> with variant="${variant}"`, () => {
        const { container } = render(
          <Heading level={level} variant={variant}>Sample</Heading>,
        );
        const el = container.querySelector(level);
        expect(el).not.toBeNull();
        expect(el?.getAttribute('data-heading-level')).toBe(level);
        expect(el?.getAttribute('data-heading-variant')).toBe(variant);
        const cls = el?.getAttribute('class') ?? '';

        if (variant === 'editorial') {
          expect(cls).toContain('font-serif');
        } else if (variant === 'overline') {
          expect(cls).toMatch(/font-(label|headline)/);
          expect(cls).toContain('uppercase');
          expect(cls).toContain('tracking-widest');
        } else {
          expect(cls).toContain('font-headline');
          expect(cls).toContain('uppercase');
          expect(cls).toContain('text-tertiary');
        }
      });
    }
  }

  it('merges custom className without losing canonical classes', () => {
    const { container } = render(
      <Heading level="h2" className="mt-4 text-primary">Progress</Heading>,
    );
    const h2 = container.querySelector('h2');
    const cls = h2?.getAttribute('class') ?? '';
    expect(cls).toContain('font-headline');
    expect(cls).toContain('mt-4');
    expect(cls).toContain('text-primary');
  });
});

describe('Text — tag + variant matrix (ADR-012)', () => {
  for (const variant of TEXT_VARIANTS) {
    it(`renders <p> with variant="${variant}"`, () => {
      const { container } = render(<Text variant={variant}>Sample</Text>);
      const p = container.querySelector('p');
      expect(p).not.toBeNull();
      expect(p?.getAttribute('data-text-variant')).toBe(variant);
      const cls = p?.getAttribute('class') ?? '';
      if (variant === 'label' || variant === 'micro') {
        expect(cls).toContain('font-label');
      } else {
        expect(cls).toContain('font-body');
      }
    });
  }

  it('respects the `as` prop (span)', () => {
    const { container } = render(
      <Text as="span" variant="caption">hi</Text>,
    );
    expect(container.querySelector('span')).not.toBeNull();
    expect(container.querySelector('p')).toBeNull();
  });
});

describe('Editorial font token (--font-serif) — ADR-012', () => {
  it('declares --font-serif in src/index.css @theme block', () => {
    const css = fs.readFileSync(
      path.resolve(process.cwd(), 'src/index.css'),
      'utf8',
    );
    expect(css).toMatch(/--font-serif:\s*"Fraunces"/);
  });

  it('loads Fraunces via the Google Fonts @import', () => {
    const css = fs.readFileSync(
      path.resolve(process.cwd(), 'src/index.css'),
      'utf8',
    );
    expect(css).toMatch(/fonts\.googleapis\.com\/css2[^'"]*family=Fraunces/);
  });
});
