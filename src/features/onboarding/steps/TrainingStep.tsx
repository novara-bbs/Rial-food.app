/**
 * TrainingStep — does the user train regularly? (boolean Yes/No).
 *
 * Owns: `draft.trains`. No validator — the field always has a value
 * (defaults to false; toggling between 'yes'/'no' just dispatches the
 * boolean). Drives the per-day exercise kcal bump in `nutrition.ts`.
 */
import { type Dispatch } from 'react';

import SegmentedTabs from '@/components/SegmentedTabs';
import { useI18n } from '@/i18n';

import OnboardingScaffold from '../components/OnboardingScaffold';
import { setField, type OnboardingAction, type OnboardingDraft } from '../state/types';

type TrainsOption = 'yes' | 'no';

export default function TrainingStep({
  draft,
  dispatch,
  titleId,
}: {
  draft: OnboardingDraft;
  dispatch: Dispatch<OnboardingAction>;
  titleId: string;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.training;

  const options: ReadonlyArray<{ id: TrainsOption; label: string }> = [
    { id: 'yes', label: copy.yes },
    { id: 'no',  label: copy.no  },
  ];

  return (
    <OnboardingScaffold titleId={titleId} title={copy.title} subtitle={copy.subtitle}>
      <SegmentedTabs<TrainsOption>
        options={options}
        value={draft.trains ? 'yes' : 'no'}
        onChange={id => dispatch(setField('trains', id === 'yes'))}
        ariaLabel={copy.title}
      />
    </OnboardingScaffold>
  );
}
