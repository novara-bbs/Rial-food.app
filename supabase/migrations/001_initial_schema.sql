-- ============================================================
-- RIAL App v1.5 — Initial Schema
-- Migration: 001_initial_schema.sql
--
-- Tables:
--   profiles   — public user metadata (mirrors auth.users)
--   user_data  — per-user JSON blobs (mirrors localStorage keys)
--
-- Design:
--   • Offline-first: localStorage is the source of truth;
--     Supabase syncs in the background via src/lib/sync.ts.
--   • user_data uses a key-value model so new state keys
--     can be added without schema migrations.
--   • RLS: each user can only read/write their own rows.
-- ============================================================

-- ─── Helper: auto-update updated_at ──────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── profiles ─────────────────────────────────────────────────────────────────
-- One row per authenticated user. id FK to auth.users.id (cascade on delete).

create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        not null,
  name        text,
  is_pro      boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on new auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: users can read any profile (public display), but only write their own
alter table public.profiles enable row level security;

create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── user_data ────────────────────────────────────────────────────────────────
-- Key-value store per user. Maps 1:1 to localStorage keys in the client.
-- Valid keys mirror SyncKey in src/lib/sync.ts:
--   userProfile, dailyMacros, savedRecipes, mealPlan, shoppingList,
--   realFeelLogs, toleranceLogs, weightHistory, nutritionHistory, isPro

create table if not exists public.user_data (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  key         text        not null,
  value       jsonb,
  updated_at  timestamptz not null default now(),

  constraint user_data_unique_key unique (user_id, key)
);

create index if not exists user_data_user_id_idx on public.user_data (user_id);
create index if not exists user_data_key_idx     on public.user_data (user_id, key);

create trigger user_data_updated_at
  before update on public.user_data
  for each row execute function public.set_updated_at();

-- RLS: strict — users can only see and modify their own data
alter table public.user_data enable row level security;

create policy "user_data_select_own"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "user_data_insert_own"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "user_data_update_own"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_data_delete_own"
  on public.user_data for delete
  using (auth.uid() = user_id);

-- ─── Grants ───────────────────────────────────────────────────────────────────
-- anon key: no direct table access (all via RLS + auth)
-- authenticated role: full access controlled by RLS policies above

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_data to authenticated;
