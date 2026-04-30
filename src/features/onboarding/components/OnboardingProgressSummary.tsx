/**
 * OnboardingProgressSummary — compact read-only chip row showing choices
 * the user has made in previous steps. Inspired by INDYA onboarding (IMG_1202).
 *
 * Rendered below the progress bar in OnboardingHeader. Only chips for
 * completed steps are shown. Hidden on 'welcome' and 'goal' (no prior
 * choices to display). Horizontally scrollable on narrow screens.
 *
 * No interactive state — chips are informational only.
 */
import { Text } from '@/components/ui/Typography';

export interface ProgressSummaryData {
  /** i18n-localized label for the chosen goal. */
  goal?: string;
  /** i18n-localized label for the chosen sex. */
  sex?: string;
  /** Formatted body string like "75 kg · 175 cm". */
  body?: string;
  /** i18n-localized label for the chosen activity. */
  activity?: string;
}

interface OnboardingProgressSummaryProps {
  data: ProgressSummaryData;
}

export default function OnboardingProgressSummary({
  data,
}: OnboardingProgressSummaryProps) {
  const chips = [data.goal, data.sex, data.body, data.activity].filter(Boolean);
  if (chips.length === 0) return null;

  return (
    <div
      className="flex gap-1.5 overflow-x-auto px-4 pb-2 hide-scrollbar"
      aria-hidden="true" // Decorative — screen readers already track step progress via aria-live
    >
      {chips.map(chip => (
        <span
          key={chip}
          className={[
            'shrink-0 inline-flex items-center h-6 px-2.5 rounded-full',
            'bg-primary/10 text-primary',
          ].join(' ')}
        >
          <Text variant="caption" as="span" className="font-medium leading-none">
            {chip}
          </Text>
        </span>
      ))}
    </div>
  );
}
