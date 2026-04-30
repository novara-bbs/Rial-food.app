/**
 * DietStep — optional multi-select of dietary restrictions.
 *
 * Owns: `draft.restrictions` (string[]). No validator — the step is skippable
 * (footer shows the "Skip" button on this step). Renders `TogglePillGroup`
 * with `DIET_IDS` from `state/taxonomies` mapped to localized labels.
 */
import { type Dispatch } from 'react';

import { useI18n } from '@/i18n';

import OnboardingScaffold from '../components/OnboardingScaffold';
import TogglePillGroup from '../components/TogglePillGroup';
import { DIET_IDS } from '../state/taxonomies';
import type { OnboardingAction, OnboardingDraft } from '../state/types';

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
    label: copy.options[id],
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
