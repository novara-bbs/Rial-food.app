import { type Dispatch } from 'react';

import SegmentedTabs from '@/components/SegmentedTabs';
import { Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';

import OnboardingScaffold from '../components/OnboardingScaffold';
import { setField, type OnboardingAction, type OnboardingDraft } from '../state/types';

import type { Sex } from '../../food/utils/nutrition';

export default function IdentityStep({
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
  const copy = t.onboarding.identity;
  const errs = t.onboarding.errors; // kept — still used for name error

  const sexOptions: ReadonlyArray<{ id: Sex; label: string }> = [
    { id: 'male',   label: copy.male },
    { id: 'female', label: copy.female },
  ];

  return (
    <OnboardingScaffold titleId={titleId} title={copy.title} subtitle={copy.subtitle}>
      <div className="space-y-2">
        <label
          htmlFor="onb-name"
          className="block font-label text-micro uppercase tracking-widest text-on-surface-variant"
        >
          {copy.nameLabel}
        </label>
        <input
          id="onb-name"
          type="text"
          value={draft.name}
          maxLength={40}
          onChange={e => dispatch(setField('name', e.target.value))}
          placeholder={copy.namePlaceholder}
          autoComplete="given-name"
          aria-invalid={!!errors.name || undefined}
          aria-describedby={errors.name ? 'onb-name-error' : undefined}
          className="w-full h-11 px-3 rounded-sm border border-outline-variant/30 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 outline-none focus-visible:border-primary"
        />
        {errors.name && (
          <Text variant="caption" id="onb-name-error" className="text-error">
            {errs.nameTooLong}
          </Text>
        )}
      </div>

      <div className="space-y-2">
        <Text as="span" variant="micro" className="block">
          {copy.sexLabel}
        </Text>
        <SegmentedTabs<Sex>
          options={sexOptions}
          value={draft.sex as Sex}
          onChange={id => dispatch(setField('sex', id))}
          ariaLabel={copy.sexLabel}
        />
      </div>
    </OnboardingScaffold>
  );
}
