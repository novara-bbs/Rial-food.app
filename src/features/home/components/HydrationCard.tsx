/**
 * HydrationCard — Sprint K.
 *
 * Extracts the inline hydration SectionCard from Home.tsx into a standalone
 * primitive. Replaces the previous layout (single + icon + raw text label) with:
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │  AGUA                                    [Editar]    │
 *   │  ─────────────────────────────────────────────────── │
 *   │  [glass] [glass] [glass] … (target cups)             │
 *   │  filled = consumed / empty = remaining               │
 *   │  "X / N vasos"               [−]  [+]               │
 *   │  (editing):                                          │
 *   │  ─────────────────────────────────────────────────── │
 *   │  Objetivo Diario  [range slider]       N vasos       │
 *   └──────────────────────────────────────────────────────┘
 *
 * The `data-anchor="hydration"` attribute is preserved for the NutritionDetail
 * scroll-spy (`useScrollSpy` → Hidratación tab).
 *
 * Glass SVG is inlined (zero bytes extra — no image, no font import).
 */
import { useState } from 'react';
import SectionCard from '../../../components/SectionCard';
import { Heading } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';

interface HydrationCardProps {
  consumed: number;
  target: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Called when user changes the daily target via the range slider. */
  onTargetChange?: (newTarget: number) => void;
  /** Read-only view for past days. */
  disabled?: boolean;
  className?: string;
}

/** Inline SVG glass icon: filled or outline. */
function GlassIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 16 24"
      className={`w-3 h-5 transition-colors ${filled ? 'text-brand-secondary' : 'text-outline-variant'}`}
      aria-hidden="true"
    >
      <path
        d="M3 2 L13 2 L11 22 L5 22 Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HydrationCard({
  consumed,
  target,
  onIncrement,
  onDecrement,
  onTargetChange,
  disabled = false,
  className,
}: HydrationCardProps) {
  const { t } = useI18n();
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  const safeConsumed = Math.max(0, Math.min(consumed, target));
  const safeTarget = Math.max(1, target);

  const cupsAria = (t.home.hydration.cupsAria as string)
    .replace('{consumed}', String(safeConsumed))
    .replace('{target}', String(safeTarget));

  return (
    <SectionCard
      padding="md"
      spacing="md"
      className={className}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2"
        data-testid="hydration-card"
        data-anchor="hydration"
      >
        <Heading level="h3" variant="overline">
          {t.home.water}
        </Heading>
        {!disabled && onTargetChange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingTarget((e) => !e)}
            className="normal-case tracking-normal font-body text-micro shrink-0 h-auto py-1 px-2"
            data-testid="hydration-edit-target"
          >
            {isEditingTarget ? t.home.close : t.home.edit}
          </Button>
        )}
      </div>

      {/* Glass row */}
      <div
        role="meter"
        aria-valuenow={safeConsumed}
        aria-valuemin={0}
        aria-valuemax={safeTarget}
        aria-valuetext={cupsAria}
        aria-label={t.home.water as string}
        className="flex flex-wrap gap-1.5 py-1"
        data-testid="hydration-glasses"
      >
        {Array.from({ length: safeTarget }, (_, i) => (
          <GlassIcon key={i} filled={i < safeConsumed} />
        ))}
      </div>

      {/* Count + controls */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-headline font-bold text-body-sm text-tertiary tabular-nums" data-testid="hydration-count">
          {safeConsumed} / {safeTarget}{' '}
          <span className="text-micro font-normal text-on-surface-variant normal-case tracking-normal">
            {t.home.cups}
          </span>
        </span>
        {!disabled && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onDecrement}
              disabled={safeConsumed <= 0}
              aria-label={t.home.hydration.removeCup as string}
              data-testid="hydration-decrement"
            >
              <span className="text-body-sm font-bold leading-none" aria-hidden="true">−</span>
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onIncrement}
              disabled={safeConsumed >= safeTarget}
              aria-label={t.home.hydration.addCup as string}
              data-testid="hydration-increment"
            >
              <span className="text-body-sm font-bold leading-none" aria-hidden="true">+</span>
            </Button>
          </div>
        )}
      </div>

      {/* Inline target editor */}
      {isEditingTarget && !disabled && onTargetChange && (
        <div className="pt-3 border-t border-outline-variant/20 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
              {t.home.dailyTarget} ({t.home.cups})
            </span>
            <span className="font-headline font-bold text-body-sm text-brand-secondary tabular-nums">
              {safeTarget}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={safeTarget}
            onChange={(e) => onTargetChange(parseInt(e.target.value))}
            aria-label={`${t.home.dailyTarget} (${t.home.cups})`}
            className="w-full accent-secondary"
          />
        </div>
      )}
    </SectionCard>
  );
}
