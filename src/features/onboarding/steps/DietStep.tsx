import { type Dispatch } from 'react';

import { useI18n } from '@/i18n';

import OnboardingScaffold from '../components/OnboardingScaffold';
import TogglePillGroup from '../components/TogglePillGroup';
import type { OnboardingAction, OnboardingDraft } from '../state/types';

const DIET_IDS = [
  'vegetarian',
  'vegan',
  'glutenFree',
  'lactoseFree',
  'keto',
  'paleo',
  'mediterranean',
] as const;

type DietId = (typeof DIET_IDS)[number];

export default function DietStep({
  draft,
  dispatch,
  titleId,
}: {
  draft: OnboardingDraft;
  dispatch: Dispatch<OnboardingAction>;
  titleId: string;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.diet;

  const options = DIET_IDS.map(id => ({
    id,
    label: copy.options[id as DietId],
  }));

  return (
    <OnboardingScaffold titleId={titleId} title={copy.title} subtitle={copy.subtitle}>
      <TogglePillGroup
        options={options}
        selected={draft.restrictions}
        onToggle={id => dispatch({ type: 'TOGGLE_RESTRICTION', id })}
        ariaLabel={copy.title}
      />
    </OnboardingScaffold>
  );
}
