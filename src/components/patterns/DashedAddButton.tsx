import type { ComponentType, MouseEventHandler, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * DashedAddButton — canonical "add another item" CTA.
 *
 * Pattern extracted from CreateRecipe (add ingredient / paste list / add step)
 * + Planner (add meal). Renders a full-width dashed-border button with an
 * inline icon (default: Plus) and uppercase label.
 *
 * Why a primitive instead of inline classes:
 *   - The dashed border + hover-to-primary affordance is a recurring UX
 *     metaphor for "create a new entry inline", not a one-off treatment.
 *   - Centralizes the typography token (text-micro / font-label) so a future
 *     Bricolage tweak is a 1-line edit.
 *   - Keeps `<DashedAddButton>` testable and lint-clean (no inline drift).
 *
 * Density:
 *   - "comfortable" → p-4 (default, primary inline-create CTAs)
 *   - "compact"     → p-3 (secondary, "add step" type slots)
 *
 * Width:
 *   - "full"   → w-full (default)
 *   - "auto"   → shrinks to content (use inside a flex row alongside other CTAs)
 */
export type DashedAddButtonDensity = 'comfortable' | 'compact';
export type DashedAddButtonWidth = 'full' | 'auto';

export interface DashedAddButtonProps {
  label: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  /** Icon component. Defaults to lucide `Plus`. Pass `null` to render no icon. */
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }> | null;
  /** Set when `label` is hidden visually (icon-only) so AT users still get a name. */
  ariaLabel?: string;
  density?: DashedAddButtonDensity;
  width?: DashedAddButtonWidth;
  /** Hide the label visually on small viewports — keeps the icon visible. */
  hideLabelOnMobile?: boolean;
  disabled?: boolean;
  className?: string;
}

const DENSITY_CLASS: Record<DashedAddButtonDensity, string> = {
  comfortable: 'p-4',
  compact: 'p-3',
};

const WIDTH_CLASS: Record<DashedAddButtonWidth, string> = {
  full: 'w-full',
  auto: 'shrink-0',
};

export default function DashedAddButton({
  label,
  onClick,
  icon: Icon = Plus,
  ariaLabel,
  density = 'comfortable',
  width = 'full',
  hideLabelOnMobile = false,
  disabled = false,
  className,
}: DashedAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-dashed-add-button
      data-density={density}
      data-width={width}
      className={cn(
        'border-2 border-dashed border-outline-variant/30 rounded-sm',
        'flex items-center justify-center gap-2',
        'text-on-surface-variant hover:text-primary hover:border-primary/50',
        'transition-colors',
        'font-label text-micro font-bold tracking-widest uppercase',
        'disabled:opacity-50 disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant/30 disabled:cursor-not-allowed',
        DENSITY_CLASS[density],
        WIDTH_CLASS[width],
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
      {hideLabelOnMobile ? (
        <span className="hidden sm:inline">{label}</span>
      ) : (
        label
      )}
    </button>
  );
}
