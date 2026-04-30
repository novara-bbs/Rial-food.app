/**
 * DoneStep — celebratory exit screen.
 *
 * Read-only. PlanRevealStep already showed the kcal target, macros, and
 * the breakdown — repeating those numbers here would feel redundant
 * (owner feedback). DoneStep now focuses on the *moment of completion*:
 * a hero icon, the personalized congratulations, and the dietary
 * restrictions snapshot (the only piece of context not shown earlier).
 *
 * The footer CTA (`done.cta`) closes the modal and fires
 * `onComplete(deriveOutput(draft))`.
 */
import { PartyPopper } from 'lucide-react';

import { Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

import OnboardingScaffold from '../components/OnboardingScaffold';
import type { OnboardingDraft } from '../state/types';
import { interpolateName, resolveDietLabel } from '../utils/copy';

export default function DoneStep({
  draft,
  titleId,
}: {
  draft: OnboardingDraft;
  titleId: string;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.done;

  const title = interpolateName(copy.titleNamed, copy.title, draft.name);

  const restrictionsLabel =
    draft.restrictions.length === 0
      ? copy.summaryNoRestrictions
      : draft.restrictions
          .map(id => resolveDietLabel(id, t.onboarding.diet.options))
          .join(' · ');

  return (
    <OnboardingScaffold
      titleId={titleId}
      variant="centered"
      title={title}
      subtitle={copy.subtitle}
      heroSlot={
        <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <PartyPopper className="size-12" aria-hidden="true" />
        </div>
      }
    >
      {/* Single-line restrictions snapshot — the only piece of context the
          plan-reveal step didn't already cover. Keeps Done visually distinct
          from PlanRevealStep so the user doesn't feel they've seen the same
          card twice. */}
      <div className="w-full flex flex-col items-center gap-1">
        <Text variant="caption" className="text-on-surface-variant">
          {copy.summaryRestrictions}
        </Text>
        <Text variant="body" className="text-on-surface text-center">
          {restrictionsLabel}
        </Text>
      </div>
    </OnboardingScaffold>
  );
}
