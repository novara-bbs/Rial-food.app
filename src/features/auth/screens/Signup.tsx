/**
 * Signup screen — email/password + name.
 */
import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { signUpWithEmail } from '../../../lib/supabase';
import { useI18n } from '../../../i18n';

interface SignupProps {
  onNavigateToLogin: () => void;
}

export default function Signup({ onNavigateToLogin }: SignupProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isValid = name.trim().length >= 2 && email.includes('@') && password.length >= 8;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      const { error } = await signUpWithEmail(email.trim(), password, name.trim());
      if (error) {
        toast.error(error.message);
      } else {
        setDone(true);
      }
    } catch {
      toast.error(t.auth.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
          <Mail className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h2 className="font-headline text-xl font-black uppercase tracking-widest text-tertiary mb-2">
            {t.auth.checkEmail}
          </h2>
          <p className="font-body text-sm text-on-surface-variant max-w-xs">
            {t.auth.checkEmailDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="font-body text-sm text-primary hover:underline"
        >
          {t.auth.backToLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="font-headline text-3xl font-black text-on-primary">R</span>
          </div>
          <div className="text-center">
            <h1 className="font-headline text-2xl font-black uppercase tracking-widest text-tertiary">RIAL</h1>
            <p className="font-body text-sm text-on-surface-variant mt-1">{t.auth.createAccountTagline}</p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.auth.namePlaceholder}
              aria-label={t.auth.namePlaceholder}
              autoComplete="name"
              className="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

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
              autoComplete="new-password"
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

          {/* Password hint */}
          <p className="font-label text-micro text-on-surface-variant/60 uppercase tracking-widest px-1">
            {t.auth.passwordHint}
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {t.auth.createAccount}
          </button>

          {/* Legal note */}
          <p className="font-label text-micro text-on-surface-variant/50 uppercase tracking-widest text-center leading-relaxed px-2">
            {t.auth.legalNote}
          </p>
        </form>
      </div>

      <div className="px-6 pb-10 text-center">
        <p className="font-body text-sm text-on-surface-variant">
          {t.auth.haveAccount}{' '}
          <button type="button" onClick={onNavigateToLogin} className="text-primary font-medium hover:underline">
            {t.auth.signIn}
          </button>
        </p>
      </div>
    </div>
  );
}
