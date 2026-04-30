/**
 * ActivityStep — daily activity level (sedentary / light / active / veryActive).
 *
 * Owns: `draft.activity`. Validator: `activityRequired` if unset. Renders
 * `<ActivitySlider>` (4-position drag selector with dynamic label, INDYA
 * pattern). The level IDs come from `state/taxonomies` (ACTIVITY_LEVELS).
 */
import { type Dispatch } from 'react';

import { useI18n } from '@/i18n';

import ActivitySlider from '../components/ActivitySlider';
import OnboardingScaffold from '../components/OnboardingScaffold';
import { setField, type OnboardingAction, type OnboardingDraft } from '../state/types';

import type { ActivityLevel } from '../../food/utils/nutrition';

export default function ActivityStep({
  draft,
  dispatch,
  titleId,
}: {
  draft: OnboardingDraft;
  dispatch: Dispatch<OnboardingAction>;
  titleId: string;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.activity;

  return (
    <OnboardingScaffold titleId={titleId} title={copy.title} subtitle={copy.subtitle}>
      <ActivitySlider
        value={draft.activity === '' ? '' : (draft.activity as ActivityLevel)}
        onChange={level => dispatch(setField('activity', level))}
        ariaLabel={copy.title}
      />
    </OnboardingScaffold>
  );
}
