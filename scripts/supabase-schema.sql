-- RIAL Supabase Schema
-- Run this in Supabase → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Created automatically on sign-up via trigger
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null,
  name        text,
  is_pro      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS: users can only read/write their own row
alter table public.profiles enable row level security;
create policy "profiles: own row" on public.profiles
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── user_data ────────────────────────────────────────────────────────────────
-- Key-value store for all app state (userProfile, savedRecipes, etc.)
create table if not exists public.user_data (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users on delete cascade not null,
  key         text not null,
  value       jsonb,
  updated_at  timestamptz not null default now(),
  unique (user_id, key)
);

create index if not exists user_data_user_id_idx on public.user_data (user_id);

-- RLS: users can only access their own data
alter table public.user_data enable row level security;
create policy "user_data: own rows" on public.user_data
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger user_data_updated_at
  before update on public.user_data
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Done! Tables created with Row Level Security enabled.
-- Users can only access their own data.
-- ─────────────────────────────────────────────────────────────────────────────
