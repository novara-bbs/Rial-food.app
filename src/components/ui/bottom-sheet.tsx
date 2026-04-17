import * as React from 'react';
import { XIcon } from 'lucide-react';
import { Dialog as SheetPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';
import { useI18n } from '../../i18n';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible sheet title. Rendered visibly in the sticky header AND announced by screen readers via radix DialogTitle. */
  title: string;
  /** Optional subtitle under the title. Falls back to sr-only radix DialogDescription when absent. */
  description?: string;
  /** Optional node rendered in the header right slot (e.g. cog, share, save action). */
  actionSlot?: React.ReactNode;
  /** Optional node sticky-pinned at the bottom of the sheet (e.g. primary CTA). */
  footer?: React.ReactNode;
  /** Hide the close (X) button when `onOpenChange` is the only close path. Default false. */
  hideCloseButton?: boolean;
  /** Extra class on the scrollable content wrapper (not on the sheet frame). */
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * Bottom sheet primitive — ADR-009 anatomy.
 *
 * Defaults:
 * - max-h-[88vh] so status bar + dynamic island remain visible behind.
 * - rounded-t-3xl top corners.
 * - Handle pill centered at top.
 * - Overlay bg-black/25 (not 50%) — preserves context behind.
 * - Sticky header with close X + centered title + action slot.
 * - Scrollable content inside the sheet; sheet itself does not grow.
 * - Stacking supported natively via radix (a sheet over a sheet over a sheet).
 *
 * Use `<BottomSheet>` for all new sheets. The legacy `<Sheet side="bottom">`
 * from `@/components/ui/sheet` remains for backwards compatibility.
 */
export default function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  actionSlot,
  footer,
  hideCloseButton = false,
  contentClassName,
  children,
}: BottomSheetProps) {
  const { t } = useI18n();

  return (
    <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay
          data-slot="bottom-sheet-overlay"
          className="fixed inset-0 z-50 bg-black/25 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        />
        <SheetPrimitive.Content
          data-slot="bottom-sheet-content"
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex flex-col',
            'bg-surface rounded-t-3xl shadow-elev-3',
            'max-h-[88vh]',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-300',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-500',
          )}
        >
          <div
            aria-hidden="true"
            className="mx-auto mt-2 h-1 w-8 shrink-0 rounded-full bg-outline-variant/60"
          />

          <div className="flex items-center gap-3 px-4 py-3 shrink-0">
            {!hideCloseButton ? (
              <SheetPrimitive.Close
                aria-label={t.common.close}
                className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </SheetPrimitive.Close>
            ) : (
              <span aria-hidden="true" className="w-11 h-11 -ml-2" />
            )}

            <div className="flex-1 min-w-0 text-center">
              <SheetPrimitive.Title className="font-headline text-title-sm font-bold tracking-tight text-tertiary truncate">
                {title}
              </SheetPrimitive.Title>
              {description ? (
                <SheetPrimitive.Description className="font-label text-micro text-on-surface-variant tracking-widest uppercase truncate">
                  {description}
                </SheetPrimitive.Description>
              ) : (
                <SheetPrimitive.Description className="sr-only">{title}</SheetPrimitive.Description>
              )}
            </div>

            <div className="w-11 h-11 -mr-2 flex items-center justify-end shrink-0">
              {actionSlot}
            </div>
          </div>

          <div
            data-slot="bottom-sheet-body"
            className={cn('overflow-y-auto flex-1 px-4 pb-4', contentClassName)}
          >
            {children}
          </div>

          {footer ? (
            <div
              data-slot="bottom-sheet-footer"
              className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 border-t border-outline-variant/10"
            >
              {footer}
            </div>
          ) : null}
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
