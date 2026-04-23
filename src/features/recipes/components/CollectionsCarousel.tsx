/**
 * CollectionsCarousel — R3.
 *
 * Horizontal scrolling row of collection cards shown above the recipe grid
 * when no filter is active. Each card taps into a curated collection.
 *
 * Pattern: NYT Cooking folder strip + KS collection cards (IMG_1144, IMG_1162).
 */
import { BadgeCheck, Zap, Dumbbell, Leaf, Minus, Package, ChefHat } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { COLLECTIONS } from '../data/collections';
import { useI18n } from '../../../i18n';

// ─── icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  BadgeCheck,
  Zap,
  Dumbbell,
  Leaf,
  Minus,
  Package,
  ChefHat,
};

// ─── types ───────────────────────────────────────────────────────────────────

export interface CollectionsCarouselProps {
  /** All scored recipes — used to compute live counts. */
  recipes: any[];
  /** Currently active collection id. */
  activeCollection: string;
  onSelect: (id: string) => void;
  className?: string;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function CollectionsCarousel({
  recipes,
  activeCollection,
  onSelect,
  className = '',
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

  return (
    <div className={`-mx-6 px-6 overflow-x-auto scrollbar-none ${className}`}>
      <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
        {COLLECTIONS.map((col) => {
          const count = recipes.filter(col.predicate).length;
          if (count === 0) return null; // hide empty collections
          const Icon = ICON_MAP[col.icon] ?? ChefHat;
          const isActive = activeCollection === col.id;

          return (
            <button
              key={col.id}
              type="button"
              onClick={() => onSelect(isActive ? 'all' : col.id)}
              className={[
                'flex flex-col items-start gap-2 p-3 rounded-sm min-w-[112px] transition-all',
                isActive
                  ? `${col.heroColor} text-on-primary shadow-elev-1`
                  : 'bg-surface-container-low border border-outline-variant/20 text-on-surface hover:border-primary/40',
              ].join(' ')}
              aria-pressed={isActive}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-on-primary' : 'text-primary'}`} aria-hidden="true" />
              <div className="text-left">
                <p className={`font-headline font-bold text-xs uppercase tracking-widest leading-tight ${isActive ? 'text-on-primary' : 'text-tertiary'}`}>
                  {getLabel(col.labelKey)}
                </p>
                <p className={`font-label text-micro mt-0.5 ${isActive ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                  {count} {(t as any).collections?.recipes ?? 'recetas'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
