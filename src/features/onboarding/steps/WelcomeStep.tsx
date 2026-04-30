import { Sparkles } from 'lucide-react';

import { useI18n } from '@/i18n';

import OnboardingScaffold from '../components/OnboardingScaffold';

export default function WelcomeStep({ titleId }: { titleId: string }) {
  const { t } = useI18n();
  const copy = t.onboarding.welcome;
  return (
    <OnboardingScaffold
      titleId={titleId}
      variant="centered"
      title={copy.title}
      subtitle={copy.subtitle}
      heroSlot={
        <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="size-12" aria-hidden="true" />
        </div>
      }
    >
      {/* CTA lives in the shell footer — nothing needed here. */}
      {null}
    </OnboardingScaffold>
  );
}
