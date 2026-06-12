-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CapMaxx — Migration 0002: Admin Panel expansion                            ║
-- ║                                                                            ║
-- ║  Adds admin tooling on top of 0001_init.sql:                               ║
-- ║    • admin_users.role enum (owner | admin | support)                       ║
-- ║    • admin_notes        (private internal notes on users/companies/listings)║
-- ║    • reported_companies / reported_listings (abuse/spam reports)           ║
-- ║    • message_threads.flagged (gates body access for abuse review)          ║
-- ║    • intake_submissions.admin_note (internal note on a submission)         ║
-- ║                                                                            ║
-- ║  Safe to re-run (IF NOT EXISTS / guarded enum / drop-then-create policy).   ║
-- ║  This content is also folded into schema.sql.                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── admin_users.role enum ─────────────────────────────────────────────────────
-- Roles let you distinguish the platform owner from staff admins/support.
do $$ begin
  create type public.admin_role as enum ('owner', 'admin', 'support');
exception when duplicate_object then null; end $$;

alter table public.admin_users
  add column if not exists user_id uuid references public.users(id) on delete cascade;
alter table public.admin_users
  add column if not exists role public.admin_role not null default 'admin';

-- ── admin_notes (private to admins via RLS) ───────────────────────────────────
create table if not exists public.admin_notes (
  id              uuid primary key default gen_random_uuid(),
  author_user_id  uuid references public.users(id) on delete set null,
  target_type     text not null check (target_type in ('user', 'company', 'listing')),
  target_id       uuid not null,
  body            text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── reported_companies ────────────────────────────────────────────────────────
create table if not exists public.reported_companies (
  id                uuid primary key default gen_random_uuid(),
  reporter_user_id  uuid references public.users(id) on delete set null,
  target_id         uuid not null references public.companies(id) on delete cascade,
  reason            text,
  status            text not null default 'pending' check (status in ('pending', 'reviewed', 'removed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── reported_listings ─────────────────────────────────────────────────────────
create table if not exists public.reported_listings (
  id                uuid primary key default gen_random_uuid(),
  reporter_user_id  uuid references public.users(id) on delete set null,
  target_id         uuid not null references public.listings(id) on delete cascade,
  reason            text,
  status            text not null default 'pending' check (status in ('pending', 'reviewed', 'removed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── message_threads.flagged ───────────────────────────────────────────────────
-- Admins can only read message BODIES for threads flagged for abuse/report review.
alter table public.message_threads
  add column if not exists flagged boolean not null default false;

-- ── intake_submissions.admin_note ─────────────────────────────────────────────
alter table public.intake_submissions
  add column if not exists admin_note text;

-- ── indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_admin_notes_target        on public.admin_notes(target_type, target_id);
create index if not exists idx_admin_notes_author        on public.admin_notes(author_user_id);
create index if not exists idx_reported_companies_target on public.reported_companies(target_id);
create index if not exists idx_reported_companies_status on public.reported_companies(status);
create index if not exists idx_reported_listings_target  on public.reported_listings(target_id);
create index if not exists idx_reported_listings_status  on public.reported_listings(status);
create index if not exists idx_message_threads_flagged   on public.message_threads(flagged);

-- ── updated_at triggers for the new tables ────────────────────────────────────
do $$
declare
  t text;
  tables text[] := array['admin_notes', 'reported_companies', 'reported_listings'];
begin
  foreach t in array tables loop
    execute format('drop trigger if exists trg_set_updated_at on public.%I;', t);
    execute format(
      'create trigger trg_set_updated_at before update on public.%I
         for each row execute function public.set_updated_at();', t);
  end loop;
end;
$$;

-- ════════════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════════════
alter table public.admin_notes        enable row level security;
alter table public.reported_companies enable row level security;
alter table public.reported_listings  enable row level security;

-- admin_notes: readable & writable ONLY by admins (private internal notes).
drop policy if exists admin_notes_all on public.admin_notes;
create policy admin_notes_all on public.admin_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- reported_companies: a signed-in user may file a report and see their own;
-- admins may select / update / delete everything.
drop policy if exists reported_companies_insert on public.reported_companies;
create policy reported_companies_insert on public.reported_companies
  for insert with check (reporter_user_id = public.current_user_id() or public.is_admin());
drop policy if exists reported_companies_select on public.reported_companies;
create policy reported_companies_select on public.reported_companies
  for select using (reporter_user_id = public.current_user_id() or public.is_admin());
drop policy if exists reported_companies_update on public.reported_companies;
create policy reported_companies_update on public.reported_companies
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists reported_companies_delete on public.reported_companies;
create policy reported_companies_delete on public.reported_companies
  for delete using (public.is_admin());

-- reported_listings: same model as reported_companies.
drop policy if exists reported_listings_insert on public.reported_listings;
create policy reported_listings_insert on public.reported_listings
  for insert with check (reporter_user_id = public.current_user_id() or public.is_admin());
drop policy if exists reported_listings_select on public.reported_listings;
create policy reported_listings_select on public.reported_listings
  for select using (reporter_user_id = public.current_user_id() or public.is_admin());
drop policy if exists reported_listings_update on public.reported_listings;
create policy reported_listings_update on public.reported_listings
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists reported_listings_delete on public.reported_listings;
create policy reported_listings_delete on public.reported_listings
  for delete using (public.is_admin());

-- Done. Re-run safely anytime.
