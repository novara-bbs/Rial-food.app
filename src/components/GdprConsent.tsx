/**
 * GDPR / first-launch consent dialog.
 * Shown once on first app open. Stores consent in localStorage.
 * Required by EU law and Apple App Store privacy nutrition label.
 */
import { Shield } from 'lucide-react';
import { useI18n } from '../i18n';

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
    <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-container-highest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-headline text-base font-black uppercase tracking-widest text-tertiary">
            {t.legal.consentTitle}
          </h2>
        </div>

        {/* Body */}
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          {t.legal.consentBody}{' '}
          <button
            type="button"
            onClick={onNavigatePrivacy}
            className="text-primary underline hover:no-underline"
          >
            {t.legal.privacyLink}
          </button>
          {' '}{t.legal.consentAnd}{' '}
          <button
            type="button"
            onClick={onNavigateTerms}
            className="text-primary underline hover:no-underline"
          >
            {t.legal.termsLink}
          </button>
          .
        </p>

        {/* Accept */}
        <button
          type="button"
          onClick={handleAccept}
          className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-headline text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
        >
          {t.legal.consentAccept}
        </button>
      </div>
    </div>
  );
}
