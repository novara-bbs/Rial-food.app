import { useEffect, useState } from 'react';

/**
 * Animate a numeric value from 0 → target with ease-out cubic.
 * Respects `prefers-reduced-motion` (returns the final value immediately).
 *
 * Implementation note: avoids deps. Uses `requestAnimationFrame` directly
 * so we don't add a 3KB lib for what is, in practice, ~30 LOC.
 */
export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    // Reduced-motion: skip animation.
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setValue(target);
      return;
    }

    let cancelled = false;
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs]);

  return value;
}
