/**
 * SmartInsightCard — Sprint C contextual banner above the energy gauge.
 *
 * Renders a single, short, actionable line. The owner brief asks for messages
 * like *"Vas en línea con tu objetivo. Con el entreno de las 18:30 podrás aún
 * cenar sobre 600 kcal."* — composed at the call site from kcal-remaining +
 * training-day + macro-gap signals.
 *
 * Design contract (Sprint G — PDF reference):
 *   - One row, leading **dot indicator** (no icon container), text on the right.
 *   - Soft tinted surface — `tone="positive" | "neutral" | "warning"`.
 *   - Optional trailing action button (e.g. "Ver detalle"), kept text-only.
 *
 * No state. The compose-the-message logic lives at the call site so the same
 * component can serve the energy chip, the macros chip, etc.
 */
import { cn } from '@/lib/utils';

export type SmartInsightTone = 'positive' | 'neutral' | 'warning';

const TONE_MAP: Record<SmartInsightTone, { wrapper: string; dotColor: string }> = {
  positive: {
    wrapper: 'bg-primary/8 border-primary/15',
    dotColor: 'bg-primary',
  },
  neutral: {
    wrapper: 'bg-surface-container-low border-outline-variant/20',
    dotColor: 'bg-on-surface-variant',
  },
  warning: {
    wrapper: 'bg-error/8 border-error/15',
    dotColor: 'bg-error',
  },
};

export interface SmartInsightCardProps {
  message: string;
  tone?: SmartInsightTone;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  /** Optional accessible label override; defaults to the message content. */
  ariaLabel?: string;
}

export default function SmartInsightCard({
  message,
  tone = 'positive',
  action,
  className,
  ariaLabel,
}: SmartInsightCardProps) {
  const { wrapper, dotColor } = TONE_MAP[tone];

  return (
    <section
      role="status"
      aria-label={ariaLabel ?? message}
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-sm border shadow-elev-1',
        wrapper,
        className,
      )}
      data-testid="smart-insight-card"
      data-tone={tone}
    >
      {/* Leading dot — small tinted indicator (PDF reference). No icon container. */}
      <span
        className={cn('w-2 h-2 rounded-full shrink-0 mt-2', dotColor)}
        aria-hidden="true"
      />
      <p className="font-body text-body-sm text-on-surface leading-relaxed flex-1 min-w-0">
        {message}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="font-body text-micro font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm px-1 shrink-0"
          data-testid="smart-insight-action"
        >
          {action.label}
        </button>
      )}
    </section>
  );
}
