/**
 * GDPR / first-launch consent dialog.
 * Shown once on first app open. Stores consent in localStorage.
 * Required by EU law and Apple App Store privacy nutrition label.
 */
import { Shield } from 'lucide-react';
import BottomSheet from '@/components/ui/bottom-sheet';
import { useI18n } from '@/i18n';

const CONSENT_KEY = 'rial_gdpr_consent_v1';

export function hasGivenConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === 'true';
}

function recordConsent(): void {
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
        <button
          type="button"
          onClick={handleAccept}
          className="w-full min-h-11 py-3.5 bg-primary text-on-primary rounded-xl font-headline text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t.legal.consentAccept}
        </button>
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
