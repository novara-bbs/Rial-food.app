import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { cn } from '../../../lib/utils';

export interface HeroGalleryProps {
  photos: string[];
  alt: string;
  onTap?: (index: number) => void;
  className?: string;
}

/**
 * Hero carousel for RecipeDetail. Scroll-snap horizontal with dot indicator
 * and `current/total` counter. CSS-only, no deps. Single-photo case skips
 * the carousel machinery entirely to keep bundle + paint costs unchanged
 * for the ~80% of recipes that still have one image.
 *
 * On tap (if `onTap` provided) the container opens the `MediaLightbox` at
 * the current index.
 */
export default function HeroGallery({ photos, alt, onTap, className }: HeroGalleryProps) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  const total = photos.length;

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth;
    if (slideWidth === 0) return;
    const next = Math.round(el.scrollLeft / slideWidth);
    if (next !== index && next >= 0 && next < total) setIndex(next);
  }, [index, total]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  if (total === 0) return null;

  if (total === 1) {
    return (
      <button
        type="button"
        onClick={onTap ? () => onTap(0) : undefined}
        aria-label={onTap ? t.recipeDetail.openLightbox : undefined}
        className={cn('relative block w-full h-full p-0 m-0 bg-transparent', className)}
      >
        <img
          src={photos[0]}
          alt={alt}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </button>
    );
  }

  return (
    <div
      className={cn('relative w-full h-full', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.recipeDetail.gallery}
    >
      <div
        ref={trackRef}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
      >
        {photos.map((src, i) => (
          <button
            type="button"
            key={`${src}-${i}`}
            onClick={onTap ? () => onTap(i) : undefined}
            aria-label={t.recipeDetail.photoOf
              .replace('{current}', String(i + 1))
              .replace('{total}', String(total))}
            className="relative shrink-0 w-full h-full snap-start p-0 m-0 bg-transparent"
          >
            <img
              src={src}
              alt={`${alt} ${i + 1}/${total}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>

      {/* Counter pill — top-center sits between Back (top-left) and Share/Save (top-right) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-950/60 backdrop-blur-sm text-white text-micro font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm pointer-events-none">
        {index + 1}/{total}
      </div>

      {/* Dots — bottom-right to avoid colliding with centered title/badge in RecipeDetail hero overlay */}
      <div className="absolute bottom-3 right-3 flex gap-1.5">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={t.recipeDetail.photoOf
              .replace('{current}', String(i + 1))
              .replace('{total}', String(total))}
            aria-current={i === index}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80',
            )}
          />
        ))}
      </div>
    </div>
  );
}
