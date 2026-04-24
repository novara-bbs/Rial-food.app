/**
 * Typography primitives — ADR-012.
 *
 * Single source of truth for headline and body rendering. Call-sites compose
 * `<Heading>` and `<Text>` instead of hand-rolling `font-headline text-xl
 * font-bold uppercase tracking-tight text-tertiary` — so changing the canonical
 * look of an H2 (or switching the editorial font) is a 1-line edit here.
 *
 * @see docs/DESIGN-SYSTEM.md § Typography primitives
 * @see docs/adr/ADR-012-typography-and-layout-primitives.md
 */
import { type ReactNode, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
type HeadingVariant = 'default' | 'editorial' | 'overline';

/**
 * Canonical heading matrix. Mirrors the real call-sites in `src/`:
 *   h1 = screen hero (rare; onboarding, auth)
 *   h2 = screen headline (matches PageHeader today: 24px, tracking-tighter)
 *   h3 = card heading (matches SectionCard-ish: prominent in-card)
 *   h4 = sub-section (small, inline)
 * Editorial variant keeps the size, swaps the face + case + tracking.
 * Overline variant collapses to a small-caps label regardless of level —
 * the `level` prop only controls the HTML tag for a11y hierarchy.
 */
const HEADING_STYLES: Record<HeadingLevel, Record<HeadingVariant, string>> = {
  h1: {
    default:
      'font-headline text-headline font-bold uppercase tracking-tighter text-tertiary',
    editorial:
      'font-serif text-headline font-semibold tracking-tight text-tertiary',
    overline:
      'font-headline text-body font-bold uppercase tracking-widest text-tertiary',
  },
  h2: {
    default:
      'font-headline text-title font-bold uppercase tracking-tighter text-tertiary',
    editorial:
      'font-serif text-title font-semibold tracking-tight text-tertiary',
    overline:
      'font-headline text-body font-bold uppercase tracking-widest text-tertiary',
  },
  h3: {
    default:
      'font-headline text-title-sm font-bold uppercase tracking-tight text-tertiary',
    editorial:
      'font-serif text-title-sm font-semibold tracking-tight text-tertiary',
    overline:
      'font-headline text-body font-bold uppercase tracking-widest text-tertiary',
  },
  h4: {
    default:
      'font-headline text-body-lg font-bold uppercase tracking-wide text-tertiary',
    editorial:
      'font-serif text-body-lg font-semibold tracking-tight text-tertiary',
    overline:
      'font-headline text-body font-bold uppercase tracking-widest text-tertiary',
  },
};

interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
  /** Semantic HTML tag. Drives a11y hierarchy. */
  level: HeadingLevel;
  /** Visual treatment. `default` = brand headline; `editorial` = serif hero; `overline` = small-caps sub-header. */
  variant?: HeadingVariant;
  className?: string;
  children: ReactNode;
}

export function Heading({
  level,
  variant = 'default',
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = level;
  return (
    <Tag
      data-heading-level={level}
      data-heading-variant={variant}
      className={cn(HEADING_STYLES[level][variant], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type TextVariant =
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'label'
  | 'micro';

const TEXT_STYLES: Record<TextVariant, string> = {
  'body-lg': 'font-body text-body-lg text-on-surface',
  body: 'font-body text-body text-on-surface',
  'body-sm': 'font-body text-body-sm text-on-surface-variant',
  caption: 'font-body text-caption text-on-surface-variant',
  label: 'font-label text-label uppercase tracking-widest text-on-surface-variant',
  micro: 'font-label text-micro uppercase tracking-widest text-on-surface-variant',
};

type TextTag = 'p' | 'span' | 'div' | 'small' | 'figcaption';

interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  variant?: TextVariant;
  /** HTML tag to render. Defaults to `p`. Use `span` for inline. */
  as?: TextTag;
  className?: string;
  children: ReactNode;
}

export function Text({
  variant = 'body',
  as = 'p',
  className,
  children,
  ...rest
}: TextProps) {
  const Tag = as;
  return (
    <Tag
      data-text-variant={variant}
      className={cn(TEXT_STYLES[variant], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export type { HeadingLevel, HeadingVariant, TextVariant, TextTag };
