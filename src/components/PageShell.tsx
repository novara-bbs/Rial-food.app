import { cn } from '@/lib/utils';

const widths = { narrow: 'max-w-2xl', default: 'max-w-4xl', wide: 'max-w-5xl', full: '' } as const;
const gaps = { sm: 'space-y-4', md: 'space-y-6', lg: 'space-y-8' } as const;

/**
 * Safe-area inset coverage for the screen wrapper. Defaults to `'none'` so
 * existing screens that already live under `<GlobalHeader>` (which owns the
 * top inset) and `<BottomNav>` (which owns the bottom inset) keep their
 * pixel-perfect layout. Routes without those chrome elements (auth flows,
 * fullscreen overlays) opt in via this prop instead of sprinkling raw
 * `env(safe-area-inset-*)` styles.
 *
 * - `'top'`    → reserve notch / Dynamic Island space above content.
 * - `'bottom'` → reserve home-indicator space below content (when no BottomNav).
 * - `'both'`   → both insets at once (rare; modals usually own their own scaffold).
 * - `'none'`   → default, opt-out (chrome handles insets externally).
 */
const safeAreaClasses = {
  none: '',
  top: 'pt-safe',
  bottom: 'pb-safe',
  both: 'pt-safe pb-safe',
} as const;

interface PageShellProps {
  children: React.ReactNode;
  /** Max width: 'narrow' (max-w-2xl), 'default' (max-w-4xl), 'wide' (max-w-5xl), 'full' (no max-width) */
  maxWidth?: keyof typeof widths;
  /** Vertical spacing between children: 'sm' (space-y-4), 'md' (space-y-6), 'lg' (space-y-8) */
  spacing?: keyof typeof gaps;
  /** Disable horizontal padding (px-6) */
  noPadding?: boolean;
  /**
   * Safe-area inset coverage. Default `'none'` preserves prior behavior —
   * screens with `<GlobalHeader>` + `<BottomNav>` already get insets via
   * the chrome. Set to `'top' | 'bottom' | 'both'` for fullscreen routes.
   */
  safeArea?: keyof typeof safeAreaClasses;
  /** Additional className */
  className?: string;
}

export default function PageShell({
  children,
  maxWidth = 'default',
  spacing = 'lg',
  noPadding,
  safeArea = 'none',
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        !noPadding && 'px-6',
        widths[maxWidth],
        widths[maxWidth] && 'mx-auto',
        gaps[spacing],
        safeAreaClasses[safeArea],
        className,
      )}
    >
      {children}
    </div>
  );
}
