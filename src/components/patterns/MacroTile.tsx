import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * MacroTile — single macronutrient cell.
 *
 * Canonical pattern extracted from RecipeDetail / CreateRecipe (totals +
 * per-serving) / RecipeNutritionBar / PortionSelector. Renders a centered
 * value + uppercase label inside a square card.
 *
 * Variants control the visual surface:
 *   - "highest" → bg-surface-container-highest (use inside an already-elevated card)
 *   - "card"    → bg-surface-container + border (use as the macro grid itself)
 *   - "bare"    → no background or border (use inside a card that already has
 *                 a wrapper, with sibling tiles separated by `divide-x`)
 *
 * Sizes follow the token scale (no Tailwind defaults):
 *   - "sm" → text-body  (compact cards, in-line totals)
 *   - "md" → text-body-lg (default; review screens, hero stats)
 *
 * Color is provided by the call-site as a token-based class (`text-primary`,
 * `text-macro-protein`, `text-macro-carbs`, `text-macro-fats`) so the macro
 * palette stays under design-system control.
 */
export type MacroTileSize = 'sm' | 'md';
export type MacroTileSurface = 'highest' | 'card' | 'bare';

export interface MacroTileProps {
  /** Numeric value or pre-formatted string (e.g. `42`, `"42g"`, `"1.2kg"`). */
  value: ReactNode;
  /** Short uppercase label (kcal, pro, carbs, fats). Already localized. */
  label: string;
  /** Token-based color class for the value. Defaults to `text-tertiary`. */
  valueColorClassName?: string;
  size?: MacroTileSize;
  surface?: MacroTileSurface;
  className?: string;
}

const SIZE_CLASS: Record<MacroTileSize, string> = {
  sm: 'text-body',
  md: 'text-body-lg',
};

const SURFACE_CLASS: Record<MacroTileSurface, string> = {
  highest: 'bg-surface-container-highest p-2',
  card: 'bg-surface-container border border-outline-variant/30 p-3',
  bare: 'p-3',
};

export default function MacroTile({
  value,
  label,
  valueColorClassName = 'text-tertiary',
  size = 'md',
  surface = 'highest',
  className,
}: MacroTileProps) {
  return (
    <div
      data-macro-tile
      data-size={size}
      data-surface={surface}
      className={cn('rounded-sm text-center', SURFACE_CLASS[surface], className)}
    >
      <span
        className={cn(
          'block font-headline font-bold',
          SIZE_CLASS[size],
          valueColorClassName,
        )}
      >
        {value}
      </span>
      <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}
