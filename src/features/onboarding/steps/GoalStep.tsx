/**
 * GoalStep — single-select goal (muscle / cut / maintain / health / family).
 *
 * Owns: `draft.goal`. Validator: `goalRequired` if unset (footer hint
 * surfaces it on first CTA tap). Renders `RadioCardGroup` with a Lucide
 * icon per option; the goal IDs come from `state/taxonomies` (GOAL_IDS).
 */
import { Dumbbell, Flame, Heart, Scale, Users } from 'lucide-react';
import { type Dispatch } from 'react';

import RadioCardGroup, { type RadioCardOption } from '@/components/ui/RadioCardGroup';
import { useI18n } from '@/i18n';

import OnboardingScaffold from '../components/OnboardingScaffold';
import { setField, type OnboardingAction, type OnboardingDraft } from '../state/types';

import type { Goal } from '../../food/utils/nutrition';

export default function GoalStep({
  draft,
  dispatch,
  titleId,
}: {
  draft: OnboardingDraft;
  dispatch: Dispatch<OnboardingAction>;
  titleId: string;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.goal;

  const options: RadioCardOption<Goal>[] = [
    { id: 'muscle',   label: copy.options.muscle,   icon: Dumbbell, iconClassName: 'text-on-surface-variant' },
    { id: 'cut',      label: copy.options.cut,      icon: Flame,    iconClassName: 'text-on-surface-variant' },
    { id: 'maintain', label: copy.options.maintain, icon: Scale,    iconClassName: 'text-on-surface-variant' },
    { id: 'health',   label: copy.options.health,   icon: Heart,    iconClassName: 'text-on-surface-variant' },
    { id: 'family',   label: copy.options.family,   icon: Users,    iconClassName: 'text-on-surface-variant' },
  ];

  return (
    <OnboardingScaffold titleId={titleId} title={copy.title} subtitle={copy.subtitle}>
      <RadioCardGroup<Goal>
        options={options}
        value={draft.goal === '' ? '' : (draft.goal as Goal)}
        onChange={id => dispatch(setField('goal', id))}
        ariaLabel={copy.title}
      />
    </OnboardingScaffold>
  );
}
