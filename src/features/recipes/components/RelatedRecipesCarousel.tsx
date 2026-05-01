/**
 * RelatedRecipesCarousel — R3.
 *
 * Horizontal carousel shown at the bottom of RecipeDetail with up to 5 recipes
 * that are related to the current one. Closes the discovery loop without
 * taking the user back to the grid.
 *
 * Matching algorithm (ordered by score):
 *  +3  same verified status (null vs non-null)
 *  +2  any overlapping tag / suitableFor slot
 *  +1  per 10% calorie overlap within ±20% of current recipe kcal
 *  -99 same id (excluded)
 *
 * Pattern: KS "You might also like" + NYT "More to try" (IMG_1162).
 */
import { useI18n } from '../../../i18n';
import RecipeCard from '../../../components/patterns/RecipeCard';
import { Heading } from '@/components/ui/Typography';
import type { Recipe } from '../../../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function scoreMatch(current: Recipe, candidate: Recipe): number {
  if (candidate.id === current.id) return -99;
  let score = 0;

  // Verified tier alignment
  const curVerified = current.verified != null;
  const candVerified = candidate.verified != null;
  if (curVerified === candVerified) score += 3;

  // Tag / suitableFor overlap
  const curTags: string[] = [
    ...(current.suitableFor ?? []),
    ...(current.tags ?? []),
    current.tag ? [current.tag] : [],
  ].flat().map((s: string) => s.toLowerCase());
  const candTags: string[] = [
    ...(candidate.suitableFor ?? []),
    ...(candidate.tags ?? []),
    candidate.tag ? [candidate.tag] : [],
  ].flat().map((s: string) => s.toLowerCase());
  const overlap = curTags.filter((t) => candTags.includes(t)).length;
  score += Math.min(overlap, 3) * 2;

  // Calorie proximity (±20%)
  const curKcal: number = current.macros?.calories ?? 0;
  const candKcal: number = candidate.macros?.calories ?? 0;
  if (curKcal > 0 && candKcal > 0) {
    const ratio = Math.abs(curKcal - candKcal) / curKcal;
    if (ratio <= 0.2) score += Math.round((1 - ratio / 0.2) * 1);
  }

  return score;
}

function formatTime(recipe: Recipe): string {
  const prep = parseInt(String(recipe.prepTime)) || 0;
  const cook = parseInt(String(recipe.cookTime)) || 0;
  const total = prep + cook;
  if (total === 0) return '';
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

// ─── types ───────────────────────────────────────────────────────────────────

export interface RelatedRecipesCarouselProps {
  currentRecipe: Recipe;
  allRecipes: Recipe[];
  onNavigate: (recipe: Recipe) => void;
  className?: string;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function RelatedRecipesCarousel({
  currentRecipe,
  allRecipes,
  onNavigate,
  className = '',
}: RelatedRecipesCarouselProps) {
  const { t } = useI18n();

  const related = allRecipes
    .map((r) => ({ recipe: r, score: scoreMatch(currentRecipe, r) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ recipe }) => recipe);

  if (related.length === 0) return null;

  const heading = t.recipes.relatedRecipes;

  return (
    <div className={`mt-6 ${className}`}>
      <Heading level="h3" className="font-headline font-bold text-body-sm uppercase tracking-widest text-tertiary px-6 mb-3">
        {heading}
      </Heading>
      <div className="flex gap-3 overflow-x-auto scrollbar-none px-6 pb-2">
        {related.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={{
              id: recipe.id,
              title: recipe.title,
              img: recipe.image ?? recipe.img,
              time: formatTime(recipe),
            }}
            variant="compact"
            onPress={() => onNavigate(recipe)}
          />
        ))}
      </div>
    </div>
  );
}
