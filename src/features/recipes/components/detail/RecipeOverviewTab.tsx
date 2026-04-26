/**
 * RecipeDetail "Overview" tab — description + match score + smart swapper +
 * quick actions (log meal / add to plan) + Mark as Cooked + Versionar (Pro
 * fork) + day-selector sheet + inline community notes.
 *
 * Extracted from RecipeDetail.tsx (Phase 3.1, ADR-015). Many props because
 * this tab is the primary action surface of the screen — it owns most CTAs.
 * The cookie-cutter alternative would be N small components passed via slots,
 * but this single tab is the natural cohesion unit (a user reads it
 * top-to-bottom).
 */
import { Activity, MessageSquare, ChefHat, GitFork, Crown, UtensilsCrossed } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';
import RecipeSubstitutionPicker from '../RecipeSubstitutionPicker';
import RecipeDaySelectorSheet from '../RecipeDaySelectorSheet';
import { defaultSlotFor } from '../../utils/meal-slot';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecipeData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SwapSuggestion = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CommunityPostRow = any;

interface RecipeOverviewTabProps {
  data: RecipeData;
  matchScore: number;
  swapSuggestions: SwapSuggestion[];
  applySwap: (fromId: string, toIngredient: { id: string }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProfile: any;
  isPro: boolean;
  cookedCount: number;
  servings: number;
  /** Live ref pointed at the quick-actions row (for sticky CTA visibility). */
  quickActionsRef: React.RefObject<HTMLDivElement | null>;
  /** Returns the recipe with swaps + extras + scaling applied. */
  getModifiedRecipe: () => RecipeData;
  onLogMealNow?: (recipe: RecipeData, servings: number) => void;
  onAddToPlan?: (recipe: RecipeData, dayIndex: number, slot?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  handleMarkAsCooked: (recipe: RecipeData) => void;
  showDaySelector: boolean;
  setShowDaySelector: (open: boolean) => void;
  setShowDuplicateConfirm: (open: boolean) => void;
  navigateTo: (screen: string, data?: Record<string, unknown>) => void;
  communityPosts: CommunityPostRow[];
  /** Default 'overview' — only override if the parent uses a different tab id. */
  tabValue?: string;
}

export default function RecipeOverviewTab({
  data, matchScore, swapSuggestions, applySwap,
  userProfile, isPro, cookedCount, servings, quickActionsRef,
  getModifiedRecipe, onLogMealNow, onAddToPlan, handleMarkAsCooked,
  showDaySelector, setShowDaySelector, setShowDuplicateConfirm,
  navigateTo, communityPosts, tabValue = 'overview',
}: RecipeOverviewTabProps) {
  const { t } = useI18n();

  // Pull the first 3 comments from posts that reference this recipe.
  const recipeComments = communityPosts
    .filter((p: CommunityPostRow) => p.recipe && String(p.recipe.id) === String(data.id) && p.commentsList?.length > 0)
    .flatMap((p: CommunityPostRow) => p.commentsList)
    .slice(0, 3);

  const hasPreferences = !!(
    Object.keys(userProfile?.foodPreferences ?? {}).length ||
    userProfile?.intolerances?.length
  );

  return (
    <TabsContent value={tabValue} className="space-y-6 pt-4">
      <p className="text-sm text-on-surface-variant leading-relaxed">{data.description}</p>

      {/* Match score */}
      <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
          <Activity className="w-20 h-20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <p className="font-headline text-body-sm font-bold text-tertiary uppercase">{t.recipeDetail.matchScore}</p>
            </div>
            <span className="text-primary font-headline text-title font-bold">{matchScore}%</span>
          </div>
          <p className="text-on-surface-variant text-xs leading-relaxed">
            {t.recipeDetail.matchDescription.replace('{percent}', String(matchScore)).replace('{goal}', t.recipeDetail.goalMaxPerformance)}
          </p>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-primary h-full rounded-full" style={{ width: `${matchScore}%` }} />
          </div>
        </div>
      </div>

      {/* Smart swapper — powered by user preferences */}
      <RecipeSubstitutionPicker
        swapSuggestions={swapSuggestions}
        onApplySwap={applySwap}
        hasPreferences={hasPreferences}
      />

      {/* Quick actions — primary */}
      <div ref={quickActionsRef} className="flex flex-col sm:flex-row gap-3">
        <Button variant="brand" className="flex-1" onClick={() => onLogMealNow && onLogMealNow(getModifiedRecipe(), servings)}>
          <UtensilsCrossed className="w-4 h-4 mr-2" /> {t.recipeDetail.logMeal}
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setShowDaySelector(true)}>
          {t.recipeDetail.addToPlan}
        </Button>
      </div>

      {/* Mark as Cooked — universal, NYT Cooking pattern (R2.3) */}
      <button
        type="button"
        onClick={() => handleMarkAsCooked(getModifiedRecipe())}
        className="w-full flex items-center justify-between min-h-11 px-4 py-3 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/30 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <ChefHat className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="font-headline font-semibold text-micro text-tertiary uppercase tracking-widest">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(t.recipes as any).markAsCooked ?? 'Marcar como cocinada'}
          </span>
        </div>
        {cookedCount > 0 && (
          <span className="font-label text-micro uppercase tracking-widest text-primary">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {((t.recipes as any).cookedNTimes ?? 'Cocinada {n} veces').replace('{n}', String(cookedCount))}
          </span>
        )}
      </button>

      {/* Versionar — secondary action, Pro-only */}
      {data.publishedBy !== 'self' && (
        <div className="border-t border-outline-variant/10 pt-3">
          <button
            type="button"
            onClick={() => {
              if (!isPro) { navigateTo('rial-plus'); return; }
              setShowDuplicateConfirm(true);
            }}
            className="w-full flex items-center justify-between min-h-11 px-4 py-3 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <GitFork className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              <div className="text-left">
                <span className="font-headline font-semibold text-micro text-tertiary uppercase tracking-widest block">
                  {t.recipeDetail.createVersion || 'Crear mi versión'}
                </span>
                <span className="font-label text-micro text-on-surface-variant tracking-widest uppercase">
                  {t.recipeDetail.versionDesc || 'Duplicar y personalizar esta receta'}
                </span>
              </div>
            </div>
            {!isPro && <Crown className="w-4 h-4 text-brand-secondary" />}
          </button>
        </div>
      )}

      {showDaySelector && (
        <RecipeDaySelectorSheet
          defaultSlot={defaultSlotFor(data)}
          onSelect={(idx, slot) => { onAddToPlan?.(getModifiedRecipe(), idx, slot); setShowDaySelector(false); }}
          onClose={() => setShowDaySelector(false)}
        />
      )}

      {/* Community notes — from posts that reference this recipe */}
      {recipeComments.length > 0 && (
        <section className="border-t border-outline-variant/20 pt-4">
          <Heading level="h4" className="mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> {t.recipeDetail.notes} ({recipeComments.length})
          </Heading>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {recipeComments.map((comment: any) => (
            <div key={comment.id} className="bg-surface-container-low p-3 rounded-sm border border-outline-variant/10 mb-2">
              <div className="flex items-center gap-2 mb-1">
                {comment.authorImg ? (
                  <img src={comment.authorImg} alt={comment.author} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-micro font-bold text-tertiary">
                    {comment.author?.charAt(0)}
                  </div>
                )}
                <span className="font-headline font-semibold text-micro uppercase text-tertiary">{comment.author}</span>
              </div>
              <p className="text-caption text-on-surface-variant leading-relaxed">"{comment.text}"</p>
            </div>
          ))}
        </section>
      )}
    </TabsContent>
  );
}
