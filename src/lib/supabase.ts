/**
 * Supabase client singleton.
 *
 * Setup:
 *  1. Create a project at https://supabase.com (free tier is fine)
 *  2. Copy your project URL and anon key from Settings → API
 *  3. Add to .env:
 *       VITE_SUPABASE_URL=https://xxxx.supabase.co
 *       VITE_SUPABASE_ANON_KEY=eyJhbGci...
 *
 * SQL tables to create in Supabase → SQL Editor:
 *   See scripts/supabase-schema.sql
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

export type { User, Session, AuthError } from '@supabase/supabase-js';

// ─── DB type map ──────────────────────────────────────────────────────────────
// Use standalone row types to avoid circular self-references in the Database interface.

// Supabase JSON-compatible value type
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

type ProfileRow = {
  id: string;           // matches auth.users.id
  email: string;
  name: string | null;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
};

type UserDataRow = {
  id: string;
  user_id: string;
  key: string;          // 'userProfile' | 'dailyMacros' | ...
  value: Json | null;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProfileRow, 'id' | 'created_at'>>;
        Relationships: [];
      };
      user_data: {
        Row: UserDataRow;
        Insert: Omit<UserDataRow, 'id' | 'updated_at'> & { updated_at?: string };
        Update: Partial<Omit<UserDataRow, 'id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ─── Client ───────────────────────────────────────────────────────────────────

let _client: SupabaseClient<Database> | null = null;

/**
 * Returns the Supabase client. If env vars are missing (e.g. in local dev
 * without a Supabase project) returns null and the app works fully offline.
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!_client) {
    _client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
  }
  return _client;
}

export const supabase = getSupabaseClient;

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function signUpWithEmail(email: string, password: string, name: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
}

export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export async function signInWithApple() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut() {
  const client = getSupabaseClient();
  if (!client) return;
  return client.auth.signOut();
}

export async function resetPassword(email: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/?reset-password=true`,
  });
}

export async function deleteAccount() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');
  // Calls the Supabase Edge Function (to be created in Sprint M)
  const { error } = await client.functions.invoke('delete-account');
  if (error) throw error;
}
