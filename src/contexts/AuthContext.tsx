/**
 * Auth context — wraps Supabase session management.
 *
 * If Supabase is not configured (no env vars), the app works fully
 * in guest/offline mode with all data stored locally.
 *
 * Auth states:
 *  loading   — checking for existing session on mount
 *  guest     — no account, data local only
 *  authed    — signed in, data syncs to Supabase
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import type { User, Session } from '../lib/supabase';

type AuthStatus = 'loading' | 'guest' | 'authed';

interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  /** Whether Supabase is configured and available */
  isSupabaseEnabled: boolean;
  /** Sign out and return to guest mode */
  signOut: () => Promise<void>;
  /** Force a session refresh after OAuth redirect */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const client = getSupabaseClient();
  const isSupabaseEnabled = client !== null;

  useEffect(() => {
    if (!client) {
      // No Supabase — go straight to guest mode
      setStatus('guest');
      return;
    }

    // Get initial session
    client.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setStatus('authed');
      } else {
        setStatus('guest');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setStatus(newSession ? 'authed' : 'guest');
    });

    return () => subscription.unsubscribe();
  }, [client]);

  const signOut = async () => {
    if (!client) return;
    await client.auth.signOut();
    // Clear user-owned data to prevent cross-user contamination on shared devices.
    // Preserved: rial-locale (language pref), rial_theme (UI pref), rial_gdpr_consent_v1 (legal).
    const preserve = new Set(['rial-locale', 'rial_theme', 'rial_gdpr_consent_v1']);
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allKeys.push(k);
    }
    allKeys
      .filter(k => (k.startsWith('rial_') || k.startsWith('rial-')) && !preserve.has(k))
      .forEach(k => localStorage.removeItem(k));
    setUser(null);
    setSession(null);
    setStatus('guest');
  };

  const refreshSession = async () => {
    if (!client) return;
    const { data } = await client.auth.refreshSession();
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      setStatus('authed');
    }
  };

  return (
    <AuthContext.Provider value={{ status, user, session, isSupabaseEnabled, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
