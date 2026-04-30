import { Activity, ActivitySquare, Briefcase, Mountain } from 'lucide-react';
import { type Dispatch } from 'react';

import RadioCardGroup, { type RadioCardOption } from '@/components/ui/RadioCardGroup';
import { useI18n } from '@/i18n';

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

  const options: RadioCardOption<ActivityLevel>[] = [
    { id: 'sedentary',  label: copy.options.sedentary.label,  desc: copy.options.sedentary.desc,  icon: Briefcase },
    { id: 'light',      label: copy.options.light.label,      desc: copy.options.light.desc,      icon: Activity },
    { id: 'active',     label: copy.options.active.label,     desc: copy.options.active.desc,     icon: ActivitySquare },
    { id: 'veryActive', label: copy.options.veryActive.label, desc: copy.options.veryActive.desc, icon: Mountain },
  ];

  return (
    <OnboardingScaffold titleId={titleId} title={copy.title} subtitle={copy.subtitle}>
      <RadioCardGroup<ActivityLevel>
        options={options}
        value={draft.activity === '' ? '' : (draft.activity as ActivityLevel)}
        onChange={id => dispatch(setField('activity', id))}
        ariaLabel={copy.title}
      />
    </OnboardingScaffold>
  );
}
