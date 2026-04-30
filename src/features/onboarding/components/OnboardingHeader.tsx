/**
 * OnboardingHeader — back, step counter, chunked progress bar, summary chips.
 *
 * Layout (top to bottom):
 *   [back ghost] [step counter centered] [right spacer]
 *   [8-chunk progress bar]
 *   [summary chips — optional, hidden on welcome/goal]
 *
 * On welcome (`stepIndex === 0`) the back slot becomes an invisible spacer
 * so the layout doesn't shift on the first transition.
 *
 * `aria-live="polite"` on the step counter announces each step change to
 * screen readers without interrupting. The summary chips are `aria-hidden`
 * since they are decorative (screen readers already track step progress via
 * the step counter).
 */
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

import OnboardingProgressSummary, { type ProgressSummaryData } from './OnboardingProgressSummary';

interface OnboardingHeaderProps {
  /** Zero-based index in `STEP_ORDER`. 0 = welcome (no progress chunks fill yet). */
  stepIndex: number;
  /** Total number of "question" steps shown in the progress bar. */
  progressTotal: number;
  /** True when there is a previous step to go back to. */
  canGoBack: boolean;
  onBack: () => void;
  /** Optional summary chips shown below the progress bar. */
  summary?: ProgressSummaryData;
}

export default function OnboardingHeader({
  stepIndex,
  progressTotal,
  canGoBack,
  onBack,
  summary,
}: OnboardingHeaderProps) {
  const { t } = useI18n();
  // Welcome doesn't count as a question; the progress bar starts at goal.
  const filled = Math.max(0, stepIndex); // 0 on welcome, 1 on goal, …
  const showCounter = stepIndex >= 1 && stepIndex <= progressTotal;
  const counterText = showCounter
    ? t.onboarding.shell.stepCounter
        .replace('{current}', String(stepIndex))
        .replace('{total}', String(progressTotal))
    : '';

  return (
    <header className="pt-safe border-b border-outline-variant/15 bg-surface">
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        {canGoBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            aria-label={t.onboarding.shell.back}
          >
            <ArrowLeft />
          </Button>
        ) : (
          /* Spacer: same width as the icon button so the counter stays centered. */
          <span className="size-9" aria-hidden="true" />
        )}

        <Text
          variant="micro"
          as="span"
          aria-live="polite"
          className="font-mono"
        >
          {counterText}
        </Text>

        {/* Right-side spacer mirrors the back-button width. */}
        <span className="size-9" aria-hidden="true" />
      </div>

      <div
        className="flex gap-1 px-4 pb-3"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={progressTotal}
        aria-valuenow={Math.min(filled, progressTotal)}
      >
        {Array.from({ length: progressTotal }).map((_, i) => {
          const active = i < filled;
          return (
            <span
              key={i}
              className={[
                'h-1 flex-1 rounded-full transition-colors duration-300',
                active ? 'bg-primary' : 'bg-outline-variant/25',
              ].join(' ')}
            />
          );
        })}
      </div>

      {/* Summary chips — shown when the user has made at least one choice */}
      {summary && <OnboardingProgressSummary data={summary} />}
    </header>
  );
}
