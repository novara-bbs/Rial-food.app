/**
 * StickyCookCTA — R2.2 (R2 plan v2).
 *
 * A fixed "Cocinar ahora" pill that floats above the bottom navigation bar
 * on verified-recipe detail pages. Hides automatically when the primary
 * recipe actions (Log / Plan buttons) scroll into the viewport, so it never
 * competes visually with them.
 *
 * Usage:
 *   <StickyCookCTA
 *     label={t.recipes.cookNow}
 *     onClick={startCooking}
 *     targetRef={actionsRef}   // ref on the Log/Plan button row
 *   />
 *
 * The IntersectionObserver is intentionally threshold=0 so the CTA
 * disappears the moment even a single pixel of the actions row is visible.
 */
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StickyCookCTAProps {
  label: string;
  onClick: () => void;
  /**
   * Ref to the element that, when visible, hides this button.
   * Typically pointed at the RecipeDetail quick-actions row.
   */
  targetRef: RefObject<HTMLElement | null>;
  className?: string;
}

export default function StickyCookCTA({
  label,
  onClick,
  targetRef,
  className = '',
}: StickyCookCTAProps) {
  const [hidden, setHidden] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!targetRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0 },
    );
    observerRef.current.observe(targetRef.current);

    return () => observerRef.current?.disconnect();
  }, [targetRef]);

  if (hidden) return null;

  return (
    <Button
      onClick={onClick}
      aria-label={label}
      className={[
        // Positioning — sits above the 56px bottom nav, 16px from right edge.
        'fixed bottom-[72px] right-4 z-50',
        // Shape
        'gap-2 px-5 py-3 rounded-full shadow-elev-2',
        // Interaction
        'active:scale-95 transition-all duration-150',
        // Safe-area support for iOS home-indicator
        'pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ChefHat className="w-4 h-4" />
      {label}
    </Button>
  );
}
