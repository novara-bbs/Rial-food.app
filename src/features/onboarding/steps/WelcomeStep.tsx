/**
 * WelcomeStep — auth landing inside the onboarding shell.
 *
 * Renders the RIAL wordmark + tagline, three OAuth CTAs (Apple → Google →
 * Email, following App Store ordering guidelines), a "start without account"
 * ghost button, and legal microcopy.
 *
 * When Supabase is not configured (`isSupabaseEnabled = false`) the OAuth
 * buttons are hidden and only the guest path is shown — the offline-first
 * experience still works without any auth.
 *
 * Apple / Google → redirect-based OAuth (page leaves and comes back with
 * session; AuthContext detects the new state). Email → calls
 * `onNavigateToLogin` so App.tsx can show the Login screen while the
 * onboarding draft stays in localStorage. Guest → dispatches NEXT to
 * advance to GoalStep.
 */
import { Apple, Mail } from 'lucide-react';
import { useState, type Dispatch } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n';
import { signInWithApple, signInWithGoogle } from '@/lib/supabase';
import { APP_NAME } from '@/config/brand';
import { recordConsent } from '@/features/legal/components/GdprConsent';

import { type OnboardingAction } from '../state/types';

/** Google 4-color logo — same SVG used in Login.tsx. */
function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function WelcomeStep({
  titleId,
  dispatch,
  onNavigateToLogin,
}: {
  titleId: string;
  dispatch: Dispatch<OnboardingAction>;
  /** Called when user taps "Continue with email" — lets App.tsx open Login. */
  onNavigateToLogin?: () => void;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.welcome;
  const { isSupabaseEnabled } = useAuth();
  const [loadingOAuth, setLoadingOAuth] = useState<'apple' | 'google' | null>(null);

  async function handleApple() {
    recordConsent();
    setLoadingOAuth('apple');
    try {
      const { error } = await signInWithApple();
      if (error) toast.error(copy.errorGeneric);
      // On success the browser redirects to the OAuth callback URL —
      // this line is never reached.
    } catch {
      toast.error(copy.errorGeneric);
    } finally {
      setLoadingOAuth(null);
    }
  }

  async function handleGoogle() {
    recordConsent();
    setLoadingOAuth('google');
    try {
      const { error } = await signInWithGoogle();
      if (error) toast.error(copy.errorGeneric);
    } catch {
      toast.error(copy.errorGeneric);
    } finally {
      setLoadingOAuth(null);
    }
  }

  function handleEmail() {
    recordConsent();
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      // Fallback: skip to GoalStep in guest mode when no handler is wired.
      dispatch({ type: 'NEXT' });
    }
  }

  function handleGuest() {
    recordConsent();
    dispatch({ type: 'NEXT' });
  }

  return (
    <div className="flex flex-col items-center text-center gap-8 py-4">
      {/* Hero — wordmark acts as the accessible step title. */}
      <div className="space-y-2">
        <Heading
          level="h2"
          id={titleId}
          tabIndex={-1}
          className="font-black tracking-widest text-primary"
        >
          {APP_NAME}
        </Heading>
        <Text variant="body" className="text-on-surface-variant">
          {copy.tagline}
        </Text>
      </div>

      {/* Auth CTAs — only when Supabase is configured */}
      <div className="w-full space-y-3">
        {isSupabaseEnabled && (
          <>
            {/* Apple first — required by App Store if any social login is shown */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-3"
              onClick={handleApple}
              disabled={!!loadingOAuth}
            >
              <Apple className="size-5 shrink-0" aria-hidden="true" />
              {copy.continueWithApple}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-3"
              onClick={handleGoogle}
              disabled={!!loadingOAuth}
            >
              <GoogleIcon className="size-4 shrink-0" />
              {copy.continueWithGoogle}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-3"
              onClick={handleEmail}
            >
              <Mail className="size-5 shrink-0" aria-hidden="true" />
              {copy.continueWithEmail}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-outline-variant/30" aria-hidden="true" />
              <Text variant="caption" as="span" className="text-on-surface-variant shrink-0">
                {copy.orContinueAnonymously}
              </Text>
              <div className="h-px flex-1 bg-outline-variant/30" aria-hidden="true" />
            </div>
          </>
        )}

        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={handleGuest}
        >
          {copy.continueWithoutAccount}
        </Button>
      </div>

      {/* Legal microcopy — only shown when auth is available */}
      {isSupabaseEnabled && (
        <Text variant="caption" className="text-on-surface-variant/70 max-w-xs">
          {copy.legal}
        </Text>
      )}
    </div>
  );
}
