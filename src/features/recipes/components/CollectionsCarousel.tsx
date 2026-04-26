/**
 * CollectionsCarousel — R3 (refactored in [1.5.97]).
 *
 * Compact emoji-prefixed pill rail of curated recipe collections, shown above
 * the recipe grid in Cocina when no filter is active. Single-select; tapping
 * an active chip deselects.
 *
 * Migration history:
 *   - Original: tall icon-above-text tiles (`min-w-[112px]`, Lucide icon stack).
 *   - [1.5.97]: ChipRow `variant="emoji"` `mode="single"` — eliminates
 *     icon-above-text anti-pattern (delivery-app convention: emoji LEFT of
 *     label, single-row scrollable carousel). Editorial heroColor per
 *     collection dropped for canonical chip uniformity (ADR-013).
 *   - [1.5.98]: `wrap` removed → single-row horizontal scroll carousel
 *     (Uber Eats / Glovo convention). Font: Bricolage Grotesque via ChipRow.
 *
 * Counts and predicates preserved end-to-end. Hidden when a collection's
 * predicate matches zero recipes (skip-empty behaviour identical to pre-1.5.97).
 */
import ChipRow from '../../../components/patterns/ChipRow';
import type { ChipOption } from '../../../components/patterns/ChipRow';
import { COLLECTIONS } from '../data/collections';
import { useI18n } from '../../../i18n';

// ─── types ───────────────────────────────────────────────────────────────────

export interface CollectionsCarouselProps {
  /** All scored recipes — used to compute live counts. */
  recipes: any[];
  /** Currently active collection id (`'all'` = no selection). */
  activeCollection: string;
  onSelect: (id: string) => void;
  className?: string;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function CollectionsCarousel({
  recipes,
  activeCollection,
  onSelect,
  className,
}: CollectionsCarouselProps) {
  const { t } = useI18n();

  // Resolve label from t.collections.<key> or fall back to id
  const getLabel = (labelKey: string): string => {
    const parts = labelKey.split('.');
    if (parts.length === 2 && parts[0] === 'collections') {
      return (t as any).collections?.[parts[1]] ?? parts[1];
    }
    return labelKey;
  };

  // Build options list — drop empty collections (predicate matches 0 recipes).
  const options: ChipOption[] = COLLECTIONS.flatMap((col) => {
    const count = recipes.filter(col.predicate).length;
    if (count === 0) return [];
    return [{
      id: col.id,
      label: getLabel(col.labelKey),
      emoji: col.emoji,
      count,
    }];
  });

  if (options.length === 0) return null;

  return (
    <ChipRow
      variant="emoji"
      mode="single"
      active={activeCollection === 'all' ? null : activeCollection}
      onChange={(id) => onSelect(id ?? 'all')}
      options={options}
      ariaLabel={(t as any).collections?.title ?? 'Colecciones'}
      className={className}
    />
  );
}
