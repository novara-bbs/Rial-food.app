import { type Dispatch } from 'react';

import { useI18n } from '@/i18n';

import NumberStepper from '../components/NumberStepper';
import OnboardingScaffold from '../components/OnboardingScaffold';
import { setField, type OnboardingAction, type OnboardingDraft } from '../state/types';
import {
  AGE_MAX,
  AGE_MIN,
  HEIGHT_MAX,
  HEIGHT_MIN,
  WEIGHT_MAX,
  WEIGHT_MIN,
} from '../state/validators';

export default function BodyStep({
  draft,
  dispatch,
  errors,
  titleId,
}: {
  draft: OnboardingDraft;
  dispatch: Dispatch<OnboardingAction>;
  errors: Record<string, string>;
  titleId: string;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.body;
  const errs = t.onboarding.errors;
  const subtitle = draft.name
    ? copy.subtitleNamed.replace('{name}', draft.name)
    : copy.subtitle;

  return (
    <OnboardingScaffold titleId={titleId} title={copy.title} subtitle={subtitle}>
      <div className="space-y-4">
        <NumberStepper
          label={copy.weight}
          value={draft.weight}
          onChange={v => dispatch(setField('weight', v))}
          min={WEIGHT_MIN}
          max={WEIGHT_MAX}
          step={0.5}
          precision={1}
          unit={copy.units.kg}
          invalid={!!errors.weight}
          errorMessage={errors.weight ? errs.weightOutOfRange : undefined}
        />
        <NumberStepper
          label={copy.height}
          value={draft.height}
          onChange={v => dispatch(setField('height', v))}
          min={HEIGHT_MIN}
          max={HEIGHT_MAX}
          step={1}
          unit={copy.units.cm}
          invalid={!!errors.height}
          errorMessage={errors.height ? errs.heightOutOfRange : undefined}
        />
        <NumberStepper
          label={copy.age}
          value={draft.age}
          onChange={v => dispatch(setField('age', v))}
          min={AGE_MIN}
          max={AGE_MAX}
          step={1}
          unit={copy.units.years}
          invalid={!!errors.age}
          errorMessage={errors.age ? errs.ageOutOfRange : undefined}
        />
      </div>
    </OnboardingScaffold>
  );
}
