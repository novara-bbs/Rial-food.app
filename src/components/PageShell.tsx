import { cn } from '@/lib/utils';

const widths = { narrow: 'max-w-2xl', default: 'max-w-4xl', wide: 'max-w-5xl', full: '' } as const;
const gaps = { sm: 'space-y-4', md: 'space-y-6', lg: 'space-y-8' } as const;

interface PageShellProps {
  children: React.ReactNode;
  /** Max width: 'narrow' (max-w-2xl), 'default' (max-w-4xl), 'wide' (max-w-5xl), 'full' (no max-width) */
  maxWidth?: keyof typeof widths;
  /** Vertical spacing between children: 'sm' (space-y-4), 'md' (space-y-6), 'lg' (space-y-8) */
  spacing?: keyof typeof gaps;
  /** Disable horizontal padding (px-6) */
  noPadding?: boolean;
  /** Additional className */
  className?: string;
}

export default function PageShell({
  children,
  maxWidth = 'default',
  spacing = 'lg',
  noPadding,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        !noPadding && 'px-6',
        widths[maxWidth],
        widths[maxWidth] && 'mx-auto',
        gaps[spacing],
        className,
      )}
    >
      {children}
    </div>
  );
}
