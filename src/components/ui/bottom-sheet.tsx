import * as React from 'react';
import { ChevronLeftIcon, XIcon } from 'lucide-react';
import { Dialog as SheetPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';
import { useI18n } from '../../i18n';

export type BottomSheetSize = 'compact' | 'focus';
export type BottomSheetHeaderLayout = 'title-centered' | 'cancel-action' | 'back-title-action';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible sheet title. Rendered visibly in the sticky header AND announced by screen readers via radix DialogTitle. */
  title: string;
  /** Optional subtitle under the title. Falls back to sr-only radix DialogDescription when absent. */
  description?: string;
  /** Optional node rendered in the header right slot (e.g. cog, share, save action, star). */
  actionSlot?: React.ReactNode;
  /** Custom left-header slot. Overrides the default close-X / Cancel-text / back-chevron from `headerLayout`. */
  leftSlot?: React.ReactNode;
  /** Optional node sticky-pinned at the bottom of the sheet (e.g. primary CTA). */
  footer?: React.ReactNode;
  /** Hide the close (X) button when `onOpenChange` is the only close path. Default false. Only relevant when `headerLayout === 'title-centered'`. */
  hideCloseButton?: boolean;
  /** Hide the handle pill (keyboard-first focus sheets, or navigation-stack focus sheets like IMG_1016). Default false. */
  hideHandle?: boolean;
  /** Sheet size variant (ADR-009 v2). `compact` (88vh, default) for pickers / toggle groups; `focus` (92vh) for forms / searches / keyboard-first input / detail-edit. */
  size?: BottomSheetSize;
  /** Header layout variant (ADR-009 v2). Default `title-centered` (close-X + title + action). */
  headerLayout?: BottomSheetHeaderLayout;
  /** Label for the default Cancel text button when `headerLayout === 'cancel-action'`. Falls back to `t.common.cancel`. */
  cancelLabel?: string;
  /** Accessible label for the default back chevron when `headerLayout === 'back-title-action'`. Falls back to `t.common.back`. */
  backLabel?: string;
  /** Called when the default back chevron is pressed (`headerLayout === 'back-title-action'`). Defaults to `onOpenChange(false)`. */
  onBack?: () => void;
  /** Extra class on the scrollable content wrapper (not on the sheet frame). */
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * Bottom sheet primitive — ADR-009 anatomy (V2).
 *
 * Two size variants:
 * - `compact` (default, 88vh) — pickers, toggle groups, short lists, confirm-action.
 * - `focus` (92vh) — forms, searches with long lists, keyboard-first input, detail-edit.
 *
 * Three header layouts (ADR-009 v2):
 * - `title-centered` (default) — close-X left + title center + `actionSlot` right (IMG_0984, 0995).
 * - `cancel-action` — "Cancel" text button left + title center + `actionSlot` right (IMG_1004, 1005, 0988).
 * - `back-title-action` — back chevron left + title center + `actionSlot` right (IMG_1015, 1016, 1019).
 *
 * Defaults preserved from V1:
 * - rounded-t-3xl top corners.
 * - Handle pill centered at top (unless `hideHandle`).
 * - Overlay bg-black/25 (not 50%) — preserves context behind.
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
  leftSlot,
  footer,
  hideCloseButton = false,
  hideHandle = false,
  size = 'compact',
  headerLayout = 'title-centered',
  cancelLabel,
  backLabel,
  onBack,
  contentClassName,
  children,
}: BottomSheetProps) {
  const { t } = useI18n();

  const resolvedCancel = cancelLabel ?? t.common.cancel;
  const resolvedBack = backLabel ?? t.common.back;

  const handleBack = React.useCallback(() => {
    if (onBack) onBack();
    else onOpenChange(false);
  }, [onBack, onOpenChange]);

  // Resolve the left-header content based on `headerLayout` unless the consumer passes `leftSlot`.
  const leftContent = leftSlot ?? (() => {
    if (headerLayout === 'cancel-action') {
      return (
        <SheetPrimitive.Close
          className="min-h-11 px-2 -ml-2 flex items-center rounded-md text-primary font-label text-body-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
        >
          {resolvedCancel}
        </SheetPrimitive.Close>
      );
    }
    if (headerLayout === 'back-title-action') {
      return (
        <button
          type="button"
          aria-label={resolvedBack}
          onClick={handleBack}
          className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
      );
    }
    if (!hideCloseButton) {
      return (
        <SheetPrimitive.Close
          aria-label={t.common.close}
          className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </SheetPrimitive.Close>
      );
    }
    return <span aria-hidden="true" className="w-11 h-11 -ml-2" />;
  })();

  const sizeClass = size === 'focus' ? 'max-h-[92vh]' : 'max-h-[88vh]';

  return (
    <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay
          data-slot="bottom-sheet-overlay"
          className="fixed inset-0 z-50 bg-black/25 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        />
        <SheetPrimitive.Content
          data-slot="bottom-sheet-content"
          data-size={size}
          data-header-layout={headerLayout}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex flex-col',
            'bg-surface rounded-t-3xl shadow-elev-3',
            sizeClass,
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-300',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-500',
          )}
        >
          {!hideHandle ? (
            <div
              aria-hidden="true"
              className="mx-auto mt-2 h-1 w-8 shrink-0 rounded-full bg-outline-variant/60"
            />
          ) : null}

          <div
            data-slot="bottom-sheet-header"
            className={cn(
              'flex items-center gap-3 px-4 py-3 shrink-0',
              hideHandle ? 'pt-4' : '',
            )}
          >
            <div className="shrink-0 flex items-center">{leftContent}</div>

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

            <div className="min-w-11 h-11 -mr-2 flex items-center justify-end shrink-0">
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
