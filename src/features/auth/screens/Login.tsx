/**
 * Login screen — email/password + OAuth (Google, Apple).
 * Apple Sign-In is required by Apple App Store if any social login is offered.
 */
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Apple } from 'lucide-react';
import { toast } from 'sonner';
import { signInWithEmail, signInWithGoogle, signInWithApple } from '../../../lib/supabase';
import { useI18n } from '../../../i18n';
import { Heading } from '@/components/ui/Typography';

interface LoginProps {
  onBack?: () => void;
  onNavigateToSignup: () => void;
  onForgotPassword: () => void;
}

export default function Login({ onNavigateToSignup, onForgotPassword }: LoginProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await signInWithEmail(email.trim(), password);
      if (error) toast.error(error.message);
    } catch {
      toast.error(t.auth.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) toast.error(error.message);
    } catch {
      toast.error(t.auth.errorGeneric);
    }
  };

  const handleApple = async () => {
    try {
      const { error } = await signInWithApple();
      if (error) toast.error(error.message);
    } catch {
      toast.error(t.auth.errorGeneric);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-elev-3 shadow-primary/25">
            <span className="font-headline text-headline font-black text-on-primary">R</span>
          </div>
          <div className="text-center">
            <Heading level="h1" className="font-black tracking-widest">RIAL</Heading>
            <p className="font-body text-sm text-on-surface-variant mt-1">{t.auth.tagline}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="w-full max-w-sm space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
              aria-label={t.auth.emailPlaceholder}
              autoComplete="email"
              className="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
              aria-label={t.auth.passwordPlaceholder}
              autoComplete="current-password"
              className="w-full pl-11 pr-12 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button type="button" onClick={onForgotPassword} className="font-body text-xs text-primary hover:underline">
              {t.auth.forgotPassword}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-headline text-label font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {t.auth.signIn}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full max-w-sm flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="font-headline text-micro normal-case tracking-normal text-on-surface-variant">{t.auth.orContinueWith}</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        {/* OAuth buttons */}
        <div className="w-full max-w-sm space-y-3">
          {/* Apple Sign-In — shown first (App Store requirement) */}
          <button
            type="button"
            onClick={handleApple}
            className="w-full py-3.5 bg-surface-container-highest border border-outline-variant/30 rounded-xl font-body text-body-sm font-medium text-on-surface flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors"
          >
            <Apple className="w-4 h-4" />
            {t.auth.continueWithApple}
          </button>
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-3.5 bg-surface-container-highest border border-outline-variant/30 rounded-xl font-body text-body-sm font-medium text-on-surface flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors"
          >
            {/* Google G icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.auth.continueWithGoogle}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 text-center">
        <p className="font-body text-sm text-on-surface-variant">
          {t.auth.noAccount}{' '}
          <button type="button" onClick={onNavigateToSignup} className="text-primary font-medium hover:underline">
            {t.auth.createAccount}
          </button>
        </p>
      </div>
    </div>
  );
}
