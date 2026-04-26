/**
 * RecipeDetail servings counter + family-member multiselect.
 *
 * Extracted from RecipeDetail.tsx (Phase 3.1, ADR-015). Pure presentation.
 * `setServings` is the only state setter exposed; family selection state
 * lives in the parent because it feeds the scale calculation upstream.
 */
import { Minus, Plus, Users } from 'lucide-react';
import { useI18n } from '@/i18n';
import type { FamilyMember } from '../../../../types/user';

interface RecipeServingsControlsProps {
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;
  familyMembers: FamilyMember[];
  selectedFamily: string[];
  toggleFamilyMember: (id: string) => void;
  setSelectedFamily: React.Dispatch<React.SetStateAction<string[]>>;
  totalDiners: number;
}

export default function RecipeServingsControls({
  servings, setServings,
  familyMembers, selectedFamily, toggleFamilyMember, setSelectedFamily,
  totalDiners,
}: RecipeServingsControlsProps) {
  const { t } = useI18n();

  return (
    <>
      <div className="flex items-center justify-between mt-4 bg-surface-container-highest/50 p-3 rounded-sm border border-outline-variant/10">
        <span className="font-headline font-semibold text-micro uppercase text-tertiary tracking-tight">
          {t.recipeDetail.servings}
        </span>
        <div className="flex items-center gap-3">
          {/* HIG 44×44 tap targets — visual circle kept at 28px via inner span */}
          <button
            type="button"
            onClick={() => setServings(Math.max(1, servings - 1))}
            aria-label={t.common.decreaseServings}
            disabled={servings <= 1}
            className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-40 disabled:hover:text-on-surface-variant transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center">
              <Minus className="w-3.5 h-3.5" />
            </span>
          </button>
          <span className="font-headline font-bold text-body-lg text-tertiary w-6 text-center tabular-nums">
            {servings}
          </span>
          <button
            type="button"
            onClick={() => setServings(servings + 1)}
            aria-label={t.common.increaseServings}
            className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>

      {familyMembers.length > 0 && (
        <div className="mt-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="font-label text-micro font-semibold tracking-widest uppercase text-tertiary">
              {t.recipeDetail.family}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`min-h-11 px-2.5 py-1 rounded-sm font-label text-micro font-semibold tracking-widest uppercase border transition-all ${
                selectedFamily.length === 0
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'
              }`}
              onClick={() => setSelectedFamily([])}
            >
              {t.recipeDetail.onlyMe}
            </button>
            {familyMembers.map((member) => (
              <button
                type="button"
                key={member.id}
                className={`min-h-11 px-2.5 py-1 rounded-sm font-label text-micro font-semibold tracking-widest uppercase border transition-all ${
                  selectedFamily.includes(member.id)
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'
                }`}
                onClick={() => toggleFamilyMember(member.id)}
              >
                + {member.name}
              </button>
            ))}
          </div>
          <p className="mt-2 font-label text-micro text-on-surface-variant uppercase tracking-wider">
            {t.recipeDetail.scalingFor} {totalDiners}{' '}
            {totalDiners === 1 ? t.recipeDetail.person : t.recipeDetail.people}
          </p>
        </div>
      )}
    </>
  );
}
