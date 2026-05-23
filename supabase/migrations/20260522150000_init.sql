-- Initial schema: lists, items, and the staging table that lets a
-- migrated Appwrite user re-claim their data when they first sign in
-- through Supabase Auth.
--
-- This is the schema described in docs/supabase-migration-plan.md §1 + §3.1.
--
-- Idempotent enough for the local stack: each `create table` uses `if not
-- exists`, and policy/trigger creates use `create or replace` where Postgres
-- supports it. For prod we'll rely on Supabase's migration runner.

-- ─── lists ────────────────────────────────────────────────────────────────
create table if not exists public.lists (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  title               text,
  note                text,
  mood                text,
  legacy_appwrite_id  text        unique,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists lists_user_created_idx
  on public.lists (user_id, created_at desc);

-- ─── items ────────────────────────────────────────────────────────────────
create table if not exists public.items (
  id                  uuid        primary key default gen_random_uuid(),
  list_id             uuid        not null references public.lists(id) on delete cascade,
  user_id             uuid        not null references auth.users(id) on delete cascade,
  content             text        not null,
  position            integer     not null,
  legacy_appwrite_id  text        unique,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists items_list_pos_idx on public.items (list_id, position);
create index if not exists items_user_idx     on public.items (user_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lists_touch on public.lists;
create trigger lists_touch
  before update on public.lists
  for each row execute function public.touch_updated_at();

drop trigger if exists items_touch on public.items;
create trigger items_touch
  before update on public.items
  for each row execute function public.touch_updated_at();

-- ─── Row-Level Security ───────────────────────────────────────────────────
alter table public.lists enable row level security;
alter table public.items enable row level security;

-- Recreate-on-apply so re-running the migration locally is safe.
drop policy if exists lists_select_own on public.lists;
drop policy if exists lists_modify_own on public.lists;
drop policy if exists items_select_own on public.items;
drop policy if exists items_modify_own on public.items;

create policy lists_select_own on public.lists
  for select using (auth.uid() = user_id);
create policy lists_modify_own on public.lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy items_select_own on public.items
  for select using (auth.uid() = user_id);
create policy items_modify_own on public.items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Legacy user mapping (for the future Appwrite → Supabase data import) ─
-- The one-shot migration script populates this table with one row per
-- Appwrite user (their old $id + email). When that user signs into the new
-- system (Google OAuth or password reset), the trigger below repoints any
-- lists/items still tagged with the synthetic legacy uuid to their real
-- auth.uid().
create table if not exists public.legacy_user_map (
  legacy_id    text        primary key,
  synthetic_id uuid        not null unique,
  email        text        not null,
  claimed_at   timestamptz
);

create index if not exists legacy_user_map_email_idx
  on public.legacy_user_map (lower(email));

-- RLS off — only the service role touches this table directly. The trigger
-- below runs as security definer so end-user requests never read from it.
alter table public.legacy_user_map enable row level security;
-- (no policies = nobody can read/write through PostgREST)

create or replace function public.claim_legacy_data()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  hit record;
begin
  for hit in
    select legacy_id, synthetic_id
    from public.legacy_user_map
    where lower(email) = lower(new.email)
      and claimed_at is null
  loop
    update public.lists
      set user_id = new.id
      where user_id = hit.synthetic_id;
    update public.items
      set user_id = new.id
      where user_id = hit.synthetic_id;
    update public.legacy_user_map
      set claimed_at = now()
      where legacy_id = hit.legacy_id;
  end loop;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_claim_legacy on auth.users;
create trigger on_auth_user_created_claim_legacy
  after insert on auth.users
  for each row execute function public.claim_legacy_data();
