import React from 'react';
import { Heading } from '../ui/Typography';
import { Clock, Flame, Share2, Bookmark, Trash2, GitFork } from 'lucide-react';
import { useI18n } from '../../i18n';
import { CREATORS_MAP } from '../../features/social/data/seed-creators';
import { cn } from '../../lib/utils';
import RecipeImage, { type RecipeImageVariant } from '../ui/RecipeImage';
import type { FoodTag } from '../../types/taxonomy';

export interface RecipeCardRecipe {
  id: string | number;
  title: string;
  img?: string;
  image?: string;
  photos?: string[];
  tag?: FoodTag;
  matchScore?: number;
  time?: string;
  cal?: number;
  pro?: number;
  publishedBy?: string;
  forkedFrom?: { recipeId: string | number; creatorId: string; creatorName: string; title: string };
}

export interface RecipeCardProps {
  recipe: RecipeCardRecipe;
  /**
   * carousel = horizontal swimlane (w-52 h-72)
   * grid = responsive grid cell (h-72)
   * hero = editorial pick (image aspect-video + info)
   * compact = related/more-like-this (w-40 h-56)
   * horizontal = landscape row (image left 80×80 + info right) for dense Home carousels — Sprint 52 [1.5.183]
   */
  variant?: 'carousel' | 'grid' | 'hero' | 'compact' | 'horizontal';
  onPress?: () => void;
  onSave?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
  className?: string;
}

const CONTAINER: Record<string, string> = {
  carousel:   'relative shrink-0 w-52 h-64 group cursor-pointer flex-col',
  grid:       'relative h-64 w-full group cursor-pointer flex-col',
  hero:       'relative w-full group cursor-pointer flex-col',
  compact:    'relative shrink-0 w-40 h-56 group cursor-pointer flex-col',
  horizontal: 'relative w-full h-20 group cursor-pointer flex-row gap-3 items-stretch',
};

const IMAGE_ZONE: Record<string, string> = {
  carousel:   'relative aspect-[4/3] w-full overflow-hidden rounded-sm',
  grid:       'relative aspect-[4/3] w-full overflow-hidden rounded-sm',
  hero:       'relative aspect-video w-full overflow-hidden rounded-sm',
  compact:    'relative aspect-square w-full overflow-hidden rounded-sm',
  horizontal: 'relative w-20 h-20 shrink-0 overflow-hidden rounded-sm',
};

const INFO_BLOCK: Record<string, string> = {
  carousel:   'flex flex-col pt-2 h-[100px]',
  grid:       'flex flex-col pt-2 h-[100px]',
  hero:       'flex flex-col pt-3 h-36',
  compact:    'flex flex-col pt-2 h-16',
  horizontal: 'flex-1 flex flex-col justify-center px-1 min-w-0',
};

const TITLE: Record<string, string> = {
  carousel:   'font-headline font-bold text-body-sm text-tertiary leading-tight tracking-tight line-clamp-2 normal-case',
  grid:       'font-headline font-bold text-body-sm text-tertiary leading-tight tracking-tight line-clamp-2 normal-case',
  hero:       'font-headline font-bold text-tertiary text-title md:text-headline leading-tight tracking-tighter line-clamp-2 normal-case',
  compact:    'font-headline font-bold text-body-sm text-tertiary leading-tight tracking-tight line-clamp-2 normal-case',
  horizontal: 'font-headline font-bold text-body-sm text-tertiary leading-tight tracking-tight line-clamp-2 normal-case',
};

export default function RecipeCard({
  recipe,
  variant = 'carousel',
  onPress,
  onSave,
  onDelete,
  onShare,
  isSaved = false,
  className,
}: RecipeCardProps) {
  const { t } = useI18n();

  const imageUrl = recipe.img || recipe.image;
  const creator =
    recipe.publishedBy && recipe.publishedBy !== 'self'
      ? CREATORS_MAP[recipe.publishedBy]
      : null;

  const showActions = variant !== 'compact' && variant !== 'horizontal';
  const showAuthor = variant !== 'compact' && variant !== 'horizontal';
  const showMacros = variant !== 'compact' && variant !== 'horizontal';
  const imgVariant: RecipeImageVariant = variant === 'horizontal' ? 'compact' : (variant as RecipeImageVariant);

  const matchLabel =
    variant === 'hero'
      ? `${t.discovery.bestMatch} · ${recipe.matchScore}%`
      : variant === 'carousel'
      ? `${recipe.matchScore}% ${t.discovery.match}`
      : `${recipe.matchScore}%`;

  return (
    <button
      type="button"
      className={cn(CONTAINER[variant], 'text-left flex', className)}
      onClick={onPress}
      aria-label={recipe.title}
    >
      {/* ── IMAGE ZONE ── */}
      <div className={IMAGE_ZONE[variant]}>
        <RecipeImage
          src={imageUrl}
          alt={recipe.title}
          variant={imgVariant}
          className="absolute inset-0"
          imgClassName="group-hover:scale-105 transition-transform duration-700"
        />

        {/* Multi-photo dots — top center */}
        {recipe.photos && recipe.photos.length >= 2 && variant !== 'compact' && variant !== 'horizontal' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
            {recipe.photos.slice(0, 6).map((_, i) => (
              <span
                key={i}
                className={cn('h-1 rounded-full bg-white/80', i === 0 ? 'w-3' : 'w-1')}
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {/* Top-left badges column — TimeBadge + Tag + Match */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {recipe.time && (
            <span className="badge-card bg-surface/95 backdrop-blur-md text-tertiary gap-1">
              <Clock className="w-2.5 h-2.5 text-primary" />
              {recipe.time}
            </span>
          )}
          {recipe.tag && variant !== 'compact' && variant !== 'horizontal' && (
            <span className="badge-card bg-surface/95 backdrop-blur-md text-primary uppercase tracking-wide">
              {t.recipeTags[recipe.tag] ?? recipe.tag}
            </span>
          )}
          {recipe.matchScore !== undefined && variant !== 'compact' && variant !== 'horizontal' && (
            <span className="badge-card bg-primary text-on-primary w-fit uppercase tracking-tight">
              {matchLabel}
            </span>
          )}
        </div>

        {/* Top-right action buttons */}
        {showActions && (onShare || onSave || onDelete) && (
          <div className="absolute top-2 right-2 flex gap-1.5">
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="w-9 h-9 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shadow-elev-1"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="w-9 h-9 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shadow-elev-1"
                aria-label="Save"
              >
                <Bookmark className={cn('w-4 h-4', isSaved && 'fill-primary text-primary')} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="w-9 h-9 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-elev-1"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── INFO BLOCK ── */}
      <div className={INFO_BLOCK[variant]}>
        <Heading level="h4" className={TITLE[variant]}>{recipe.title}</Heading>

        {variant === 'horizontal' && (recipe.cal !== undefined || (recipe.pro ?? 0) > 0) && (
          <span className="mt-1 text-micro font-label uppercase tracking-widest text-on-surface-variant truncate">
            {recipe.cal !== undefined && `${recipe.cal} kcal`}
            {recipe.cal !== undefined && (recipe.pro ?? 0) > 0 && ' · '}
            {(recipe.pro ?? 0) > 0 && `${recipe.pro}g pro`}
          </span>
        )}

        {showAuthor && creator && (
          <span className="font-label text-micro text-on-surface-variant mt-0.5 truncate">
            @{creator.name}
          </span>
        )}

        {showAuthor && recipe.forkedFrom && (
          <span className="font-label text-micro text-on-surface-variant mt-0.5 flex items-center gap-1 min-w-0">
            <GitFork className="w-3 h-3 text-primary/60 shrink-0" />
            <span className="truncate">{recipe.forkedFrom.creatorName} · {recipe.forkedFrom.title}</span>
          </span>
        )}

        {/* Spacer pushes macros to bottom */}
        {showMacros && <div className="flex-1" />}

        {showMacros && (
          <div className="flex items-center gap-3 text-micro font-headline font-bold text-on-surface-variant">
            {recipe.cal !== undefined && (
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-primary" />
                {recipe.cal}
              </span>
            )}
            {(recipe.pro ?? 0) >= 30 && (
              <span className="badge-card bg-primary/15 text-primary uppercase tracking-tight">
                {recipe.pro}g pro
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
