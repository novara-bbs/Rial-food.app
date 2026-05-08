/**
 * RecipeCommunityStats — community stats row + "more from this creator"
 * sidebar. Both blocks render conditionally based on data availability.
 * Reduces RecipeDetail.tsx by ~55 LoC.
 */
import { Flame, MessageSquare, Bookmark } from 'lucide-react';
import { Heading } from '@/components/ui/Typography';
import type { Recipe } from '../../../../types';
import type { Translations } from '../../../../i18n';

interface CommunityPostLite {
  id: number;
  recipe?: { id?: string | number };
  likes?: number;
  comments?: number;
  saves?: number;
}

export interface RecipeCommunityStatsProps {
  data: Recipe;
  communityPosts: CommunityPostLite[];
  savedPosts: number[] | undefined;
  savedRecipes: Recipe[];
  navToRecipe: (r: Recipe) => void;
  t: Translations;
}

export default function RecipeCommunityStats({
  data,
  communityPosts,
  savedPosts,
  savedRecipes,
  navToRecipe,
  t,
}: RecipeCommunityStatsProps) {
  const relatedPosts = communityPosts.filter((p) => p.recipe && String(p.recipe.id) === String(data.id));
  const totalSaves = savedPosts?.filter?.((id: number) => relatedPosts.some((p) => p.id === id)).length || 0;
  const totalLikes = relatedPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const showStats = relatedPosts.length > 0 || data.publishedToFeed;

  const creatorRecipes = data.publishedBy && data.publishedBy !== 'self'
    ? savedRecipes.filter((r) => r.publishedBy === data.publishedBy && r.id !== data.id).slice(0, 3)
    : [];

  return (
    <>
      {showStats && (
        <div className="mt-6 flex items-center gap-4 p-3 bg-surface-container-highest/30 rounded-sm border border-outline-variant/10">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Flame className="w-4 h-4" />
            <span className="font-label text-micro font-bold">{totalLikes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <MessageSquare className="w-4 h-4" />
            <span className="font-label text-micro font-bold">{relatedPosts.reduce((sum, p) => sum + (p.comments || 0), 0)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Bookmark className="w-4 h-4" />
            <span className="font-label text-micro font-bold">{relatedPosts.reduce((sum, p) => sum + (p.saves || 0), 0) + totalSaves}</span>
          </div>
          <span className="font-label text-micro tracking-widest text-on-surface-variant uppercase ml-auto">{t.community?.title || 'Community'}</span>
        </div>
      )}

      {creatorRecipes.length > 0 && (
        <div className="mt-6">
          <Heading level="h4" variant="overline" className="mb-3">
            {t.postDetail?.moreFromCreator || 'More from this creator'}
          </Heading>
          <div className="space-y-2">
            {creatorRecipes.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => navToRecipe(r)}
                className="w-full flex items-center gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/50 transition-colors text-left"
              >
                {r.image && (
                  <img src={r.image} alt={r.title} className="w-12 h-12 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-semibold text-body-sm text-tertiary normal-case truncate">{r.title}</p>
                  <span className="font-label text-micro text-on-surface-variant tracking-widest uppercase">
                    {r.macros?.calories || 0} kcal · {r.macros?.protein || 0}g pro
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
