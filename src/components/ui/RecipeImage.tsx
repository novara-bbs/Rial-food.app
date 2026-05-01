/**
 * RecipeImage — canonical image primitive for recipe/meal surfaces.
 *
 * Why this exists [1.5.175]:
 *   - Seed recipes use legacy `img:`, user-saved recipes use canonical `image:`.
 *     Callers normalise (`recipe.image ?? recipe.img`) before passing `src`.
 *   - URL can rot (Unsplash 404, broken CDN). Without `onError` the `<img>`
 *     stays empty — no placeholder, no signal.
 *   - This primitive transitions to a fallback (ChefHat icon or emoji) when
 *     the load errors, keeping the surface visually intact.
 *
 * Adopted by: RecipeCard, TodaysMeals planned-meal thumb, and future surfaces.
 */
import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { cn } from '../../lib/utils';

export type RecipeImageVariant = 'hero' | 'card' | 'compact' | 'thumbnail';

interface Props {
  src?: string | null;
  alt: string;
  variant?: RecipeImageVariant;
  className?: string;
  /**
   * Optional emoji used as fallback instead of the ChefHat icon (e.g. '🍽️'
   * for meal-slot context). When omitted the ChefHat lucide icon is used.
   */
  fallbackEmoji?: string;
  /** Optional className applied to the rendered <img> element. */
  imgClassName?: string;
}

const ICON_SIZE: Record<RecipeImageVariant, string> = {
  hero: 'w-16 h-16',
  card: 'w-10 h-10',
  compact: 'w-8 h-8',
  thumbnail: 'w-5 h-5',
};

export default function RecipeImage({
  src,
  alt,
  variant = 'card',
  className,
  fallbackEmoji,
  imgClassName,
}: Props) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(src) && !errored;

  return (
    <div className={cn('relative bg-surface-container-highest overflow-hidden', className)}>
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          className={cn('absolute inset-0 w-full h-full object-cover', imgClassName)}
          onError={() => setErrored(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackEmoji ? (
            <span aria-hidden="true" className="text-2xl select-none">
              {fallbackEmoji}
            </span>
          ) : (
            <ChefHat
              className={cn(ICON_SIZE[variant], 'text-on-surface-variant/40')}
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </div>
  );
}
