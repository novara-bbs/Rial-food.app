/**
 * ActivityStep — daily activity level + does the user train regularly?
 *
 * Owns: `draft.activity` (validated; `activityRequired` if unset) and
 * `draft.trains` (always defaults to false; no validator). Both questions
 * fit on the same screen — back-to-back binary-ish questions on separate
 * pages felt redundant, so they were merged in [1.5.173].
 *
 * Renders `<ActivitySlider>` (4-position drag selector with dynamic label,
 * INDYA pattern) followed by a Sí/No `<SegmentedTabs>` for trains. The
 * level IDs come from `state/taxonomies` (ACTIVITY_LEVELS).
 */
import { type Dispatch } from 'react';

import SegmentedTabs from '@/components/SegmentedTabs';
import { Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

import ActivitySlider from '../components/ActivitySlider';
import OnboardingScaffold from '../components/OnboardingScaffold';
import { setField, type OnboardingAction, type OnboardingDraft } from '../state/types';

import type { ActivityLevel } from '../../food/utils/nutrition';

type TrainsOption = 'yes' | 'no';

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
  const trainingCopy = t.onboarding.training;

  const trainsOptions: ReadonlyArray<{ id: TrainsOption; label: string }> = [
    { id: 'yes', label: trainingCopy.yes },
    { id: 'no',  label: trainingCopy.no  },
  ];

  return (
    <OnboardingScaffold titleId={titleId} title={copy.title} subtitle={copy.subtitle}>
      <ActivitySlider
        value={draft.activity === '' ? '' : (draft.activity as ActivityLevel)}
        onChange={level => dispatch(setField('activity', level))}
        ariaLabel={copy.title}
      />

      {/* Training Y/N — visually separated from the slider with a thin rule
          so it reads as a distinct sub-question rather than a slider option. */}
      <div className="pt-4 mt-1 border-t border-outline-variant/20 space-y-3">
        <div className="space-y-0.5">
          <Text variant="body-sm" className="font-semibold text-on-surface">
            {trainingCopy.title}
          </Text>
          <Text variant="caption" className="text-on-surface-variant">
            {trainingCopy.subtitle}
          </Text>
        </div>
        <SegmentedTabs<TrainsOption>
          options={trainsOptions}
          value={draft.trains ? 'yes' : 'no'}
          onChange={id => dispatch(setField('trains', id === 'yes'))}
          ariaLabel={trainingCopy.title}
        />
      </div>
    </OnboardingScaffold>
  );
}
