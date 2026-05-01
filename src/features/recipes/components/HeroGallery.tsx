import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, PlayCircle } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { cn } from '../../../lib/utils';
import { openExternalVideo } from '../../../lib/platform';

export type HeroMediaItem =
  | { kind: 'photo'; src: string }
  | {
      kind: 'video';
      videoUrl: string;
      /** Embed URL when the platform supports inline playback (YouTube only today). */
      embedUrl: string | null;
      /** Poster shown before the user taps play; falls back to recipe image upstream. */
      poster: string | undefined;
      /** Display label, e.g. "YouTube" / "TikTok". Used in the play overlay copy. */
      platformLabel: string;
    };

export interface HeroGalleryProps {
  items: HeroMediaItem[];
  alt: string;
  /** Tap on a photo slide → open MediaLightbox at the matching photo index (photos-only). */
  onPhotoTap?: (photoIndex: number) => void;
  className?: string;
}

/**
 * Hero media carousel for RecipeDetail.
 *
 * - Single item → renders full-width with no carousel chrome.
 * - 2+ items   → NYT Cooking-style horizontal scroll-snap with each slide at
 *   ~88% width so the next slide peeks from the right edge as a visual hint
 *   that the carousel is swipeable.
 *
 * Items can be photos or videos. Video slides render a poster + play overlay
 * and, on tap, either swap to an inline iframe (YouTube — `embedUrl`) or
 * call `openExternalVideo()` (TikTok / Instagram / Vimeo / other).
 *
 * Tap on a photo slide invokes `onPhotoTap(photoIndex)` so the parent can
 * open `MediaLightbox` at the right photo (the lightbox is photo-only —
 * video tap never opens it).
 *
 * Active slide tracking uses `IntersectionObserver` rather than
 * `scrollLeft / clientWidth` math so it stays accurate when the slide width
 * is less than the container width (peek mode).
 */
export default function HeroGallery({ items, alt, onPhotoTap, className }: HeroGalleryProps) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  const total = items.length;

  useEffect(() => {
    const el = trackRef.current;
    if (!el || total < 2) return;
    // JSDOM (test env) doesn't implement IntersectionObserver — bail out.
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick whichever observed slide is most visible — peek mode means
        // two slides can be partially in view at the same time.
        let bestIdx = -1;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            const dataIdx = (entry.target as HTMLElement).dataset.slideIdx;
            if (dataIdx !== undefined) bestIdx = Number(dataIdx);
          }
        });
        if (bestIdx >= 0 && bestRatio > 0.5) setIndex(bestIdx);
      },
      { root: el, threshold: [0.5, 0.7, 0.9] },
    );
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [total]);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }, []);

  // Map carousel-index → photo-index so onPhotoTap opens the lightbox at the
  // correct photo even when video slides are interleaved.
  const photoIndexOf = useCallback(
    (carouselIdx: number): number => {
      let photoIdx = 0;
      for (let i = 0; i < carouselIdx; i++) {
        if (items[i] && items[i].kind === 'photo') photoIdx++;
      }
      return photoIdx;
    },
    [items],
  );

  const handleVideoTap = useCallback((item: Extract<HeroMediaItem, { kind: 'video' }>) => {
    if (item.embedUrl) {
      setPlayingVideoUrl(item.videoUrl);
    } else {
      void openExternalVideo(item.videoUrl);
    }
  }, []);

  if (total === 0) return null;

  const renderSlide = (item: HeroMediaItem, i: number, full: boolean) => {
    const slideClass = full
      ? 'relative block w-full h-full p-0 m-0 bg-transparent'
      : 'relative shrink-0 basis-[88%] h-full snap-start rounded-sm overflow-hidden p-0 m-0 bg-transparent';

    if (item.kind === 'photo') {
      return (
        <button
          type="button"
          key={`photo-${i}-${item.src}`}
          data-slide-idx={i}
          onClick={onPhotoTap ? () => onPhotoTap(photoIndexOf(i)) : undefined}
          aria-label={
            total > 1
              ? t.recipeDetail.photoOf
                  .replace('{current}', String(i + 1))
                  .replace('{total}', String(total))
              : onPhotoTap
                ? t.recipeDetail.openLightbox
                : undefined
          }
          className={slideClass}
        >
          <img
            src={item.src}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            alt={total > 1 ? `${alt} ${i + 1}/${total}` : alt}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      );
    }

    const isPlaying = playingVideoUrl === item.videoUrl && !!item.embedUrl;
    const watchLabel = t.recipeDetail.watchOn.replace('{platform}', item.platformLabel);

    if (isPlaying && item.embedUrl) {
      return (
        <div
          key={`video-${i}-${item.videoUrl}`}
          data-slide-idx={i}
          className={slideClass}
        >
          <iframe
            src={item.embedUrl}
            title={`${item.platformLabel} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allowFullScreen
            className="absolute inset-0 w-full h-full bg-black"
          />
        </div>
      );
    }

    return (
      <button
        type="button"
        key={`video-${i}-${item.videoUrl}`}
        data-slide-idx={i}
        onClick={() => handleVideoTap(item)}
        aria-label={watchLabel}
        className={slideClass}
      >
        {item.poster ? (
          <img
            src={item.poster}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-surface-container-highest" />
        )}
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-2">
          <PlayCircle className="w-14 h-14 text-white drop-shadow" aria-hidden="true" />
          <span className="font-headline font-bold text-micro uppercase tracking-widest text-white drop-shadow inline-flex items-center gap-1">
            {watchLabel}
            {!item.embedUrl && <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />}
          </span>
        </div>
      </button>
    );
  };

  if (total === 1) {
    return (
      <div className={cn('relative w-full h-full', className)}>
        {renderSlide(items[0], 0, true)}
      </div>
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
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-pl-4 pl-4 pr-4 gap-3"
      >
        {items.map((item, i) => renderSlide(item, i, false))}
      </div>

      {/* Counter pill — top-center sits between Back (top-left) and Share/Save (top-right) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-950/60 backdrop-blur-sm text-white text-micro font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm pointer-events-none">
        {index + 1}/{total}
      </div>

      {/* Dots — bottom-right */}
      <div className="absolute bottom-3 right-6 flex gap-1.5">
        {items.map((_, i) => (
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
