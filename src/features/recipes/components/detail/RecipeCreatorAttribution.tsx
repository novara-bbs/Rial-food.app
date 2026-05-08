/**
 * RecipeCreatorAttribution — three sibling banners that historically lived
 * inline in RecipeDetail:
 *   - Creator card (when published by a creator)
 *   - "Your Recipe" badge with edit/delete (when published by self)
 *   - "Forked from" link (when forked from another recipe)
 *
 * Each block is self-contained; the parent only forwards the recipe + the
 * minimum callbacks. Reduces RecipeDetail.tsx by ~80 LoC.
 */
import { ChefHat, Pencil, Trash2, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/patterns/FollowButton';
import { CREATORS_MAP } from '../../../social/data/seed-creators';
import type { Recipe } from '../../../../types';
import type { Translations } from '../../../../i18n';

export interface RecipeCreatorAttributionProps {
  data: Recipe;
  followedCreators: string[];
  setFollowedCreators: (updater: (prev: string[]) => string[]) => void;
  setSelectedCreatorId: (id: string) => void;
  navigateTo: (route: string) => void;
  navToRecipe: (r: Recipe) => void;
  savedRecipes: Recipe[];
  setRecipeToEdit: (r: Recipe) => void;
  setShowDeleteConfirm: (open: boolean) => void;
  t: Translations;
}

export default function RecipeCreatorAttribution({
  data,
  followedCreators,
  setFollowedCreators,
  setSelectedCreatorId,
  navigateTo,
  navToRecipe,
  savedRecipes,
  setRecipeToEdit,
  setShowDeleteConfirm,
  t,
}: RecipeCreatorAttributionProps) {
  return (
    <>
      {/* ══ Creator attribution ══ */}
      {data.publishedBy && data.publishedBy !== 'self' && (() => {
        const creator = CREATORS_MAP[data.publishedBy];
        if (!creator) return null;
        const isFollowingCreator = followedCreators.includes(creator.id);
        const toggleFollowCreator = () => {
          setFollowedCreators((prev) =>
            prev.includes(creator.id) ? prev.filter((c) => c !== creator.id) : [...prev, creator.id],
          );
        };
        return (
          <div className="px-6 max-w-4xl mx-auto mt-4">
            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-3 rounded-sm border border-outline-variant/20">
              <button type="button" onClick={() => { setSelectedCreatorId(data.publishedBy!); navigateTo('creator-profile'); }} className="flex items-center gap-3 flex-1 min-w-0">
                <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full object-cover border border-outline-variant/20" referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                <div className="min-w-0">
                  <span className="font-headline font-semibold text-micro text-tertiary uppercase hover:text-primary transition-colors block truncate">@{creator.name}</span>
                  <span className="font-label text-micro text-on-surface-variant tracking-widest uppercase block">{t.recipeDetail.createdBy}</span>
                </div>
              </button>
              <FollowButton
                isFollowing={isFollowingCreator}
                onToggle={toggleFollowCreator}
                size="sm"
              />
            </div>
          </div>
        );
      })()}

      {/* ══ Your Recipe badge + edit/delete ══ */}
      {data.publishedBy === 'self' && (
        <div className="px-6 max-w-4xl mx-auto mt-4">
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-sm px-4 py-3">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-primary" />
              <span className="font-headline font-semibold text-micro uppercase tracking-wider">{t.recipeDetail.yourRecipe || 'Tu Receta'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => { setRecipeToEdit(data); navigateTo('edit-recipe'); }}
                aria-label={t.recipeDetail.edit || 'Editar'}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="destructive"
                size="icon-sm"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label={t.recipeDetail.delete || 'Eliminar'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Forked from attribution ══ */}
      {data.forkedFrom && (
        <div className="px-6 max-w-4xl mx-auto mt-3">
          <button
            type="button"
            onClick={() => {
              const original = savedRecipes.find((r) => String(r.id) === String(data.forkedFrom?.recipeId));
              if (original) navToRecipe(original);
            }}
            className="flex items-center gap-2 w-full min-h-11 bg-surface-container-low rounded-sm border border-outline-variant/20 px-4 py-2.5 hover:border-primary/30 transition-colors text-left"
          >
            <GitFork className="w-4 h-4 text-on-surface-variant shrink-0" />
            <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
              {t.recipeDetail.basedOn || 'Basada en'}
            </span>
            <span className="text-micro font-headline font-bold text-primary uppercase tracking-widest truncate">
              @{data.forkedFrom.creatorName} · {data.forkedFrom.title}
            </span>
            <ChefHat className="w-3.5 h-3.5 text-on-surface-variant/50 ml-auto shrink-0" />
          </button>
        </div>
      )}
    </>
  );
}
