import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useI18n } from '../../../i18n';
import { cn } from '../../../lib/utils';

export interface MediaLightboxProps {
  photos: string[];
  startIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alt: string;
}

/**
 * Fullscreen photo viewer. Swipe horizontally or use arrow keys.
 * Pinch-zoom and drag-to-dismiss intentionally deferred — Fase 1 ships
 * the minimum that unblocks "I want to see the photo bigger".
 */
export default function MediaLightbox({
  photos,
  startIndex,
  open,
  onOpenChange,
  alt,
}: MediaLightboxProps) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const el = trackRef.current;
    if (!el) return;
    // Defer one frame so the dialog layout has settled before scroll.
    const id = window.requestAnimationFrame(() => {
      el.scrollTo({ left: startIndex * el.clientWidth, behavior: 'instant' as ScrollBehavior });
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, startIndex]);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth;
    if (slideWidth === 0) return;
    const next = Math.round(el.scrollLeft / slideWidth);
    if (next !== index && next >= 0 && next < photos.length) setIndex(next);
  }, [index, photos.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (photos.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-[100vw] sm:max-w-[100vw] w-screen h-[100dvh] p-0 bg-neutral-950 border-0 rounded-none translate-x-0 translate-y-0 top-0 left-0"
      >
        <div
          ref={trackRef}
          className="w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-none flex"
          aria-label={t.recipeDetail.gallery}
        >
          {photos.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="shrink-0 w-full h-full snap-start flex items-center justify-center"
            >
              <img
                src={src}
                alt={`${alt} ${i + 1}/${photos.length}`}
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>

        {/* Counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-950/70 text-white text-micro font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
          {index + 1}/{photos.length}
        </div>

        {/* Dots (tappable navigation) */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40',
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
