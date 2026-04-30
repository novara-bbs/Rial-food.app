/**
 * GDPR / consent helpers + (currently-unused) modal dialog.
 *
 * Active flow ([1.5.172]+): consent is recorded implicitly via
 * `recordConsent()` when the user takes their first action in
 * WelcomeStep (Apple/Google/Email/Guest), following the
 * Instagram/TikTok inline-disclosure pattern. The microcopy in
 * WelcomeStep states "by continuing you accept Privacy + Terms".
 *
 * The `<GdprConsent>` component below is kept in the repo for
 * potential reuse in a future settings/legal flow but is no longer
 * mounted in the mainline app tree. Removing it entirely would lose
 * the canonical privacy-policy-anchored modal layout.
 */
import { Shield } from 'lucide-react';
import BottomSheet from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

const CONSENT_KEY = 'rial_gdpr_consent_v1';

export function hasGivenConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === 'true';
}

export function recordConsent(): void {
  localStorage.setItem(CONSENT_KEY, 'true');
}

interface Props {
  onAccept: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
}

export default function GdprConsent({ onAccept, onNavigatePrivacy, onNavigateTerms }: Props) {
  const { t } = useI18n();

  const handleAccept = () => {
    recordConsent();
    onAccept();
  };

  return (
    <BottomSheet
      open={true}
      onOpenChange={() => { /* consent is mandatory — only Accept closes */ }}
      title={t.legal.consentTitle}
      size="compact"
      headerLayout="title-centered"
      hideCloseButton
      hideHandle
      footer={
        <Button
          variant="default"
          onClick={handleAccept}
          className="w-full rounded-xl"
        >
          {t.legal.consentAccept}
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Icon badge */}
        <div className="flex items-center justify-center pt-2">
          <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Shield className="w-7 h-7 text-primary" aria-hidden="true" />
          </div>
        </div>

        {/* Body */}
        <p className="font-body text-sm text-on-surface-variant leading-relaxed text-center">
          {t.legal.consentBody}{' '}
          <button
            type="button"
            onClick={onNavigatePrivacy}
            className="text-primary underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            {t.legal.privacyLink}
          </button>
          {' '}{t.legal.consentAnd}{' '}
          <button
            type="button"
            onClick={onNavigateTerms}
            className="text-primary underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            {t.legal.termsLink}
          </button>
          .
        </p>
      </div>
    </BottomSheet>
  );
}
