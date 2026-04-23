import { useState } from 'react';
import { Check } from 'lucide-react';

export interface CheckoffIngredient {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
}

interface Props {
  ingredients: CheckoffIngredient[];
  /** When true, renders a compact row suitable for embedding inside CookMode step cards. */
  compact?: boolean;
  /** Called after every toggle with the current list of checked ids. */
  onCheckedChange?: (checkedIds: string[]) => void;
}

/**
 * Ingredient list with tap-to-check toggle.
 * Checked items get strikethrough + muted opacity.
 * State is transient (session-only) — no persistence.
 * Used in both MiseEnPlaceScreen (full list) and CookMode per-step sub-list.
 */
export default function IngredientCheckoff({ ingredients, compact = false, onCheckedChange }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onCheckedChange?.([...next]);
      return next;
    });
  };

  if (ingredients.length === 0) return null;

  return (
    <ul className={`space-y-0 ${compact ? '' : 'divide-y divide-outline-variant/10'}`} role="list">
      {ingredients.map(ing => {
        const isChecked = checked.has(ing.id);
        return (
          <li key={ing.id}>
            <button
              type="button"
              onClick={() => toggle(ing.id)}
              className={`w-full flex items-center gap-3 text-left transition-opacity ${
                compact ? 'py-1.5 px-0' : 'py-2.5 px-1'
              } ${isChecked ? 'opacity-40' : 'opacity-100'}`}
              aria-pressed={isChecked}
            >
              {/* Checkbox circle */}
              <span
                className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isChecked
                    ? 'bg-primary border-primary'
                    : 'border-on-surface-variant/40 bg-transparent'
                }`}
                aria-hidden="true"
              >
                {isChecked && <Check className="w-3 h-3 text-on-primary" strokeWidth={3} />}
              </span>

              {/* Name */}
              <span
                className={`flex-1 text-sm font-body transition-all ${
                  isChecked ? 'line-through text-on-surface-variant' : 'text-on-surface'
                }`}
              >
                {ing.name}
              </span>

              {/* Amount + unit */}
              {ing.amount !== undefined && ing.amount > 0 && (
                <span className="shrink-0 text-xs font-mono text-on-surface-variant/60">
                  {ing.amount}{ing.unit ? ` ${ing.unit}` : ''}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
