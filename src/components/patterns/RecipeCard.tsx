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
  /** carousel = horizontal swimlane (w-52 h-72), grid = responsive grid cell (h-64), hero = editorial pick (aspect-video) */
  variant?: 'carousel' | 'grid' | 'hero';
  onPress?: () => void;
  onSave?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
  className?: string;
}

const CONTAINER: Record<string, string> = {
  carousel: 'relative shrink-0 w-52 h-72 rounded-sm overflow-hidden group cursor-pointer',
  grid:     'relative h-64 w-full rounded-sm overflow-hidden group cursor-pointer',
  hero:     'relative rounded-sm overflow-hidden aspect-video group cursor-pointer',
};

const TITLE: Record<string, string> = {
  carousel: 'font-headline font-bold text-sm text-tertiary leading-tight tracking-tight uppercase mb-1.5',
  grid:     'font-headline font-bold text-xs text-tertiary leading-tight tracking-tight uppercase mb-1',
  hero:     'text-tertiary text-xl md:text-3xl font-headline font-black leading-tight tracking-tighter uppercase mb-2',
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

  const badgeSz = variant === 'grid' ? 'text-[8px]' : 'text-[9px]';
  const creatorSz = variant === 'grid' ? 'text-[7px]' : 'text-[8px]';
  const infoPad = variant === 'grid' ? 'px-1 py-0.5' : 'px-1.5 py-0.5';
  const infoBottom = variant === 'grid' ? 'bottom-2 left-2 right-2' : 'bottom-3 left-3 right-3';

  const matchLabel =
    variant === 'hero'
      ? `${t.discovery.bestMatch} · ${recipe.matchScore}%`
      : variant === 'carousel'
      ? `${recipe.matchScore}% ${t.discovery.match}`
      : `${recipe.matchScore}%`;

  return (
    <div className={cn(CONTAINER[variant], className)} onClick={onPress}>
      {/* Cover image */}
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

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-background ${
          variant === 'hero' ? 'via-background/30' : 'via-background/40'
        } to-transparent`}
      />

      {/* ── Hero top badge ── */}
      {variant === 'hero' && recipe.matchScore !== undefined && (
        <div className="absolute top-3 left-3">
          <span className="bg-primary text-on-primary text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest">
            {matchLabel}
          </span>
        </div>
      )}

      {/* ── Carousel / Grid top area ── */}
      {variant !== 'hero' && (
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Left: tag + match score */}
          <div className="flex flex-col gap-1">
            {recipe.tag && (
              <span
                className={`bg-surface/80 backdrop-blur-md text-primary ${badgeSz} font-black px-1.5 py-0.5 tracking-widest uppercase rounded-sm`}
              >
                {recipe.tag}
              </span>
            )}
            {recipe.matchScore !== undefined && (
              <span
                className={`bg-primary text-on-primary ${badgeSz} font-black px-1.5 py-0.5 rounded-sm w-fit uppercase tracking-tighter`}
              >
                {matchLabel}
              </span>
            )}
          </div>

          {/* Right: action buttons */}
          <div className="flex gap-1.5">
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="w-7 h-7 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="w-7 h-7 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                aria-label="Save"
              >
                <Bookmark className={cn('w-3.5 h-3.5', isSaved && 'fill-primary text-primary')} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="w-6 h-6 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom info: Hero ── */}
      {variant === 'hero' && (
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className={TITLE.hero}>{recipe.title}</h3>
          <div className="flex items-center gap-4 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
            {recipe.time && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-primary" /> {recipe.time}
              </span>
            )}
            {recipe.cal !== undefined && (
              <span className="flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-primary" /> {recipe.cal} KCAL
              </span>
            )}
            {(recipe.pro ?? 0) >= 30 && (
              <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm text-[9px] font-black">
                {recipe.pro}g PRO
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom info: Carousel + Grid ── */}
      {variant !== 'hero' && (
        <div className={`absolute ${infoBottom}`}>
          <h4 className={TITLE[variant]}>{recipe.title}</h4>
          {creator && (
            <span
              className={`font-label ${creatorSz} text-on-surface-variant/80 tracking-widest uppercase block mb-1`}
            >
              @{creator.name}
            </span>
          )}
          {recipe.forkedFrom && (
            <span className={`font-label ${creatorSz} text-on-surface-variant/80 tracking-widest uppercase flex items-center gap-1 mb-1 min-w-0`}>
              <GitFork className="w-3 h-3 text-primary/60 shrink-0" />
              <span className="truncate">{recipe.forkedFrom.creatorName} · {recipe.forkedFrom.title}</span>
            </span>
          )}
          <div className={`flex items-center gap-1.5 ${variant === 'grid' ? 'flex-wrap' : ''}`}>
            {recipe.time && (
              <div
                className={`flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm ${infoPad} rounded-sm`}
              >
                <Clock className="w-2.5 h-2.5 text-outline" />
                <span className={`${badgeSz} font-headline font-bold text-tertiary`}>
                  {recipe.time}
                </span>
              </div>
            )}
            {recipe.cal !== undefined && (
              <div
                className={`flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm ${infoPad} rounded-sm`}
              >
                <Flame className="w-2.5 h-2.5 text-primary" />
                <span className={`${badgeSz} font-headline font-bold text-tertiary`}>
                  {recipe.cal}
                </span>
              </div>
            )}
            {(recipe.pro ?? 0) >= 30 && (
              <span
                className={`bg-primary/20 text-primary ${
                  variant === 'grid' ? 'text-[7px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'
                } font-black rounded-sm uppercase tracking-tighter`}
              >
                {recipe.pro}g pro
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
