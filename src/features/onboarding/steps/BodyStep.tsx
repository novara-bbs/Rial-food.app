import { useEffect, type Dispatch } from 'react';
import { toast } from 'sonner';

import { useI18n } from '@/i18n';

import HealthSyncCard from '../components/HealthSyncCard';
import NumberStepper from '../components/NumberStepper';
import OnboardingScaffold from '../components/OnboardingScaffold';
import { useHealthData } from '../hooks/useHealthData';
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
  showErrors,
  titleId,
}: {
  draft: OnboardingDraft;
  dispatch: Dispatch<OnboardingAction>;
  errors: Record<string, string>;
  /** When false, invalid borders + hints stay hidden (user hasn't tapped CTA yet). */
  showErrors: boolean;
  titleId: string;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.body;
  const errs = t.onboarding.errors;
  const subtitle = draft.name
    ? copy.subtitleNamed.replace('{name}', draft.name)
    : copy.subtitle;

  // ── Health sync ─────────────────────────────────────────────────────────
  const health = useHealthData();

  // When health data arrives, pre-fill the relevant draft fields.
  useEffect(() => {
    if (!health.data) return;
    const { weightKg, heightCm, birthDate, biologicalSex } = health.data;
    if (weightKg !== null) dispatch(setField('weight', weightKg));
    if (heightCm !== null) dispatch(setField('height', heightCm));
    if (birthDate !== null) {
      const age = new Date().getFullYear() - birthDate.getFullYear();
      dispatch(setField('age', Math.max(AGE_MIN, Math.min(age, AGE_MAX))));
    }
    if (biologicalSex !== null) dispatch(setField('sex', biologicalSex));
  }, [health.data, dispatch]);

  // Surface health errors as a toast (non-blocking).
  useEffect(() => {
    if (!health.error) return;
    const service = t.onboarding.body.healthSync.appleLabel;
    toast.error(t.onboarding.body.healthSync.error.replace('{service}', service));
  }, [health.error, t]);

  return (
    <OnboardingScaffold titleId={titleId} title={copy.title} subtitle={subtitle}>
      {/* Health sync card — only rendered when the platform supports it. */}
      {health.available && (
        <HealthSyncCard
          enabled={health.enabled}
          loading={health.loading}
          onEnable={health.enable}
          onDisable={health.disable}
        />
      )}

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
          defaultValue={75}
          invalid={showErrors && !!errors.weight}
          errorMessage={showErrors && errors.weight ? errs.weightOutOfRange : undefined}
        />
        <NumberStepper
          label={copy.height}
          value={draft.height}
          onChange={v => dispatch(setField('height', v))}
          min={HEIGHT_MIN}
          max={HEIGHT_MAX}
          step={1}
          unit={copy.units.cm}
          defaultValue={170}
          invalid={showErrors && !!errors.height}
          errorMessage={showErrors && errors.height ? errs.heightOutOfRange : undefined}
        />
        <NumberStepper
          label={copy.age}
          value={draft.age}
          onChange={v => dispatch(setField('age', v))}
          min={AGE_MIN}
          max={AGE_MAX}
          step={1}
          unit={copy.units.years}
          defaultValue={30}
          invalid={showErrors && !!errors.age}
          errorMessage={showErrors && errors.age ? errs.ageOutOfRange : undefined}
        />
      </div>
    </OnboardingScaffold>
  );
}
