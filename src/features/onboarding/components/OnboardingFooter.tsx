/**
 * OnboardingFooter — sticky bottom CTA + skip + inline hint.
 *
 * Renders:
 *  - primary CTA full-width, label driven by the parent (`Empezar` /
 *    `Continuar` / `Crear mi plan` / `Vamos`).
 *  - optional skip secondary (`ghost`) only when the step allows it.
 *  - optional inline hint shown when the validator returns the first error
 *    (so the user knows why the CTA is disabled).
 */
import { useId } from 'react';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/Typography';

interface OnboardingFooterProps {
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  /** When provided, renders a skip ghost button below the primary. */
  skipLabel?: string;
  onSkip?: () => void;
  /** First validator error rendered as inline hint above the CTA. */
  hint?: string;
}

export default function OnboardingFooter({
  primaryLabel,
  primaryDisabled = false,
  onPrimary,
  skipLabel,
  onSkip,
  hint,
}: OnboardingFooterProps) {
  const hintId = useId();

  return (
    <footer className="sticky bottom-0 border-t border-outline-variant/15 bg-surface px-4 pt-3 pb-safe-nav space-y-2">
      {hint && (
        <Text variant="caption" id={hintId} className="text-error text-center">
          {hint}
        </Text>
      )}
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={onPrimary}
        disabled={primaryDisabled}
        aria-disabled={primaryDisabled || undefined}
        aria-describedby={hint ? hintId : undefined}
      >
        {primaryLabel}
      </Button>
      {skipLabel && onSkip && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onSkip}
        >
          {skipLabel}
        </Button>
      )}
    </footer>
  );
}
