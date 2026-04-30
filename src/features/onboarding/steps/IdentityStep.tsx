/**
 * IdentityStep — name (text input) + biological sex (segmented tabs).
 *
 * Owns: `draft.name`, `draft.sex`. Validator: `nameTooLong` (40 char cap).
 * Sex defaults to `'male'` in `INITIAL_DRAFT`, so the tabs always have a
 * visual selection and the CTA never blocks waiting for sex. Errors are
 * gated by `showErrors` so they stay silent until the user tries to
 * advance with an invalid input.
 */
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
  const copy = t.onboarding.identity;
  const errs = t.onboarding.errors;

  const sexOptions: ReadonlyArray<{ id: Sex; label: string }> = [
    { id: 'male',   label: copy.male },
    { id: 'female', label: copy.female },
  ];

  const nameHasError = showErrors && !!errors.name;

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
          aria-invalid={nameHasError || undefined}
          aria-describedby={nameHasError ? 'onb-name-error' : undefined}
          className="w-full h-11 px-3 rounded-sm border border-outline-variant/30 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 outline-none focus-visible:border-primary"
        />
        {nameHasError && (
          <Text variant="caption" id="onb-name-error" className="text-error">
            {errs[errors.name as keyof typeof errs] ?? errs.nameTooLong}
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
