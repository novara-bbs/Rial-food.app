/**
 * Forgot password — sends a reset email via Supabase.
 */
import { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { resetPassword } from '../../../lib/supabase';
import { useI18n } from '../../../i18n';
import { Heading } from '@/components/ui/Typography';

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
      }
    } catch {
      toast.error(t.auth.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center p-4 pt-safe">
        <button type="button" onClick={onBack} className="p-2 rounded-xl hover:bg-surface-container-low transition-colors">
          <ArrowLeft className="w-5 h-5 text-on-surface" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {sent ? (
          <div className="text-center space-y-4 max-w-xs">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <Heading level="h2" className="font-black tracking-widest">{t.auth.checkEmail}</Heading>
            <p className="font-body text-sm text-on-surface-variant">{t.auth.resetEmailDesc}</p>
            <button type="button" onClick={onBack} className="font-body text-sm text-primary hover:underline">
              {t.auth.backToLogin}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <Heading level="h2" className="font-black tracking-widest mb-2">
                {t.auth.forgotPassword}
              </Heading>
              <p className="font-body text-sm text-on-surface-variant max-w-xs">
                {t.auth.forgotPasswordDesc}
              </p>
            </div>

            <form onSubmit={handleReset} className="w-full max-w-sm space-y-4">
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
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-headline text-label font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {t.auth.sendResetLink}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
