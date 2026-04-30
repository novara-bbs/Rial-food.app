import { PartyPopper } from 'lucide-react';

import SectionCard from '@/components/SectionCard';
import { Heading, Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

import OnboardingScaffold from '../components/OnboardingScaffold';
import { previewBreakdown } from '../derive/derive-targets';
import type { OnboardingDraft } from '../state/types';

export default function DoneStep({
  draft,
  titleId,
}: {
  draft: OnboardingDraft;
  titleId: string;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.done;
  const breakdown = previewBreakdown(draft);

  const title = draft.name
    ? copy.titleNamed.replace('{name}', draft.name)
    : copy.title;

  const restrictionsLabel =
    draft.restrictions.length > 0
      ? draft.restrictions
          .map(id => {
            const k = id as keyof typeof t.onboarding.diet.options;
            return t.onboarding.diet.options[k] ?? id;
          })
          .join(' · ')
      : copy.summaryNoRestrictions;

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
      <SectionCard padding="md" spacing="sm" className="w-full text-left">
        <Heading level="h4" variant="overline">
          {copy.summaryTitle}
        </Heading>
        <ul className="space-y-2">
          <li className="flex items-baseline justify-between gap-3">
            <Text variant="body-sm" as="span">
              {copy.summaryKcal}
            </Text>
            <Text
              as="span"
              variant="body"
              className="font-mono font-bold tabular-nums text-tertiary"
            >
              {breakdown?.total ?? '—'}
            </Text>
          </li>
          <li className="flex items-baseline justify-between gap-3">
            <Text variant="body-sm" as="span">
              {copy.summaryProtein}
            </Text>
            <Text
              as="span"
              variant="body"
              className="font-mono font-bold tabular-nums text-tertiary"
            >
              {breakdown?.pro ?? '—'} g
            </Text>
          </li>
          <li className="flex items-baseline justify-between gap-3">
            <Text variant="body-sm" as="span">
              {copy.summaryRestrictions}
            </Text>
            <Text
              as="span"
              variant="body-sm"
              className="text-on-surface text-right max-w-[60%]"
            >
              {restrictionsLabel}
            </Text>
          </li>
        </ul>
      </SectionCard>
    </OnboardingScaffold>
  );
}
