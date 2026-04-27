import React from 'react';
import { Clock, Flame, ChefHat, Share2, Bookmark, Trash2, GitFork } from 'lucide-react';
import { useI18n } from '../../i18n';
import { CREATORS_MAP } from '../../features/social/data/seed-creators';
import { cn } from '../../lib/utils';

export interface RecipeCardRecipe {
  id: string | number;
  title: string;
  img?: string;
  image?: string;
  photos?: string[];
  tag?: string;
  matchScore?: number;
  time?: string;
  cal?: number;
  pro?: number;
  publishedBy?: string;
  forkedFrom?: { recipeId: string | number; creatorId: string; creatorName: string; title: string };
}

export interface RecipeCardProps {
  recipe: RecipeCardRecipe;
  /** carousel = horizontal swimlane (w-52 h-72), grid = responsive grid cell (h-72), hero = editorial pick (image aspect-video + info), compact = related/more-like-this (w-40 h-56) */
  variant?: 'carousel' | 'grid' | 'hero' | 'compact';
  onPress?: () => void;
  onSave?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
  className?: string;
}

const CONTAINER: Record<string, string> = {
  carousel: 'relative shrink-0 w-52 h-64 rounded-sm overflow-hidden group cursor-pointer bg-surface',
  grid:     'relative h-64 w-full rounded-sm overflow-hidden group cursor-pointer bg-surface',
  hero:     'relative w-full rounded-sm overflow-hidden group cursor-pointer bg-surface',
  compact:  'relative shrink-0 w-40 h-56 rounded-sm overflow-hidden group cursor-pointer bg-surface',
};

const IMAGE_ZONE: Record<string, string> = {
  carousel: 'relative aspect-[4/3] w-full overflow-hidden',
  grid:     'relative aspect-[4/3] w-full overflow-hidden',
  hero:     'relative aspect-video w-full overflow-hidden',
  compact:  'relative aspect-square w-full overflow-hidden',
};

const INFO_BLOCK: Record<string, string> = {
  carousel: 'flex flex-col p-3 h-[100px]',
  grid:     'flex flex-col p-3 h-[100px]',
  hero:     'flex flex-col p-4 h-28',
  compact:  'flex flex-col p-2.5 h-16',
};

const TITLE: Record<string, string> = {
  carousel: 'font-headline font-bold text-sm text-tertiary leading-tight tracking-tight uppercase line-clamp-2',
  grid:     'font-headline font-bold text-sm text-tertiary leading-tight tracking-tight uppercase line-clamp-2',
  hero:     'font-headline font-bold text-tertiary text-2xl md:text-3xl leading-tight tracking-tighter uppercase line-clamp-2',
  compact:  'font-headline font-bold text-xs text-tertiary leading-tight tracking-tight uppercase line-clamp-2',
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

  const showActions = variant !== 'compact';
  const showAuthor = variant !== 'compact';
  const showMacros = variant !== 'compact';

  const matchLabel =
    variant === 'hero'
      ? `${t.discovery.bestMatch} · ${recipe.matchScore}%`
      : variant === 'carousel'
      ? `${recipe.matchScore}% ${t.discovery.match}`
      : `${recipe.matchScore}%`;

  return (
    <button
      type="button"
      className={cn(CONTAINER[variant], 'text-left flex flex-col', className)}
      onClick={onPress}
      aria-label={recipe.title}
    >
      {/* ── IMAGE ZONE ── */}
      <div className={IMAGE_ZONE[variant]}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
            <ChefHat
              className={
                variant === 'hero'
                  ? 'w-16 h-16 text-on-surface-variant/20'
                  : 'w-10 h-10 text-on-surface-variant/50'
              }
            />
          </div>
        )}

        {/* Multi-photo dots — top center */}
        {recipe.photos && recipe.photos.length >= 2 && variant !== 'compact' && (
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
          {recipe.tag && variant !== 'compact' && (
            <span className="badge-card bg-surface/95 backdrop-blur-md text-primary uppercase tracking-wide">
              {recipe.tag}
            </span>
          )}
          {recipe.matchScore !== undefined && variant !== 'compact' && (
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
        <h4 className={TITLE[variant]}>{recipe.title}</h4>

        {showAuthor && creator && (
          <span className="font-label text-micro text-on-surface-variant tracking-widest uppercase mt-1 truncate">
            @{creator.name}
          </span>
        )}

        {showAuthor && recipe.forkedFrom && (
          <span className="font-label text-micro text-on-surface-variant tracking-widest uppercase mt-1 flex items-center gap-1 min-w-0">
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
