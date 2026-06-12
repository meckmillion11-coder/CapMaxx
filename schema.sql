-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CapMaxx — Supabase schema (consolidated, ordered)                          ║
-- ║                                                                            ║
-- ║  HOW TO RUN                                                                 ║
-- ║    1. Open your Supabase project → SQL Editor → New query.                  ║
-- ║    2. Paste the ENTIRE contents of this file and click "Run".               ║
-- ║    3. Edit the admin_users seed at the BOTTOM to match your ADMIN_EMAILS.   ║
-- ║                                                                            ║
-- ║  ORDERING (must be respected — runs top-to-bottom with no forward refs):    ║
-- ║    1) extensions                                                            ║
-- ║    2) enums                                                                 ║
-- ║    3) ALL tables (FK-dependency order: referenced before referencing)       ║
-- ║    4) helper functions (may now safely query the tables above)              ║
-- ║    5) updated_at triggers                                                   ║
-- ║    6) RLS enable + policies                                                 ║
-- ║    7) storage buckets + policies                                            ║
-- ║    8) indexes                                                               ║
-- ║    9) seeds                                                                 ║
-- ║                                                                            ║
-- ║  IDENTITY TABLE: public.users is the single identity table everywhere.      ║
-- ║    It carries auth_user_id -> auth.users(id); every FK / function / policy  ║
-- ║    that needs "the current user" goes through public.users. There is no     ║
-- ║    separate "profiles" table (company_profiles is unrelated company data).  ║
-- ║                                                                            ║
-- ║  Idempotent: create table if not exists / create or replace function /      ║
-- ║  drop policy if exists before create / guarded enums. Safe to re-run.       ║
-- ║  Consolidates migrations 0001 (base) + 0002 (admin) + 0003 (verification).  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ════════════════════════════════════════════════════════════════════════════
--  1) EXTENSIONS
-- ════════════════════════════════════════════════════════════════════════════
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ════════════════════════════════════════════════════════════════════════════
--  2) ENUMS
-- ════════════════════════════════════════════════════════════════════════════
-- Admin role: distinguishes the platform owner from staff admins / support.
do $$ begin
  create type public.admin_role as enum ('owner', 'admin', 'support');
exception when duplicate_object then null; end $$;

-- Verification status: manual, admin-driven company verification (separate from
-- the Pending/Approved/Suspended moderation status).
do $$ begin
  create type public.verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

-- ════════════════════════════════════════════════════════════════════════════
--  3) TABLES  (created in FK-dependency order: referenced tables come first)
-- ════════════════════════════════════════════════════════════════════════════

-- ── users ────────────────────────────────────────────────────────────────────
-- THE single identity table. auth_user_id links to Supabase Auth (auth.users).
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  email         text unique not null,
  full_name     text,
  first_name    text,
  last_name     text,
  phone         text,
  avatar_url    text,
  role          text not null default 'Member',  -- Owner | Manager | Member | Employee
  status        text not null default 'Approved',-- Pending | Approved | Suspended
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── companies ────────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references public.users(id) on delete set null,
  name           text not null,
  slug           text unique,
  tagline        text,
  location       text,
  industry       text,
  subcategory    text,
  business_type  text,
  founded        text,
  employee_range text,
  cage_code      text,
  naics_code     text,
  duns_number    text,
  tax_id         text,
  website        text,
  email          text,
  phone          text,
  linkedin       text,
  teams          text,
  zoom           text,
  meet           text,
  calendly       text,
  logo_url       text,
  logo_initials  text,
  logo_color     text,
  cover_url      text,
  cover_gradient text,
  cover_label    text,
  about          text,
  about_extended text,
  capabilities   text[] not null default '{}',
  tags           text[] not null default '{}',
  verified       boolean not null default false, -- legacy flag; mirrors verification_status = 'verified'
  verification_status public.verification_status not null default 'unverified',
  verified_at    timestamptz,
  verified_by    uuid references public.users(id) on delete set null,
  status         text not null default 'Pending', -- Pending | Approved | Suspended
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── company_profiles ─────────────────────────────────────────────────────────
-- 1:1 extended company profile (markets, certifications, documents, prefs JSON).
-- NOTE: this is company data, NOT the user identity table.
create table if not exists public.company_profiles (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references public.companies(id) on delete cascade,
  markets_served jsonb not null default '[]',
  certifications jsonb not null default '[]',
  documents      jsonb not null default '[]',
  preferences    jsonb not null default '{}',
  completion     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (company_id)
);

-- ── company_locations ────────────────────────────────────────────────────────
create table if not exists public.company_locations (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text,
  address     text,
  type        text,    -- Headquarters | Plant | Office | Warehouse
  contact     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── company_contacts ─────────────────────────────────────────────────────────
create table if not exists public.company_contacts (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text,
  position    text,
  phone       text,
  email       text,
  linkedin    text,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── company_media ────────────────────────────────────────────────────────────
create table if not exists public.company_media (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  kind        text not null default 'gallery', -- logo | cover | gallery | document | video
  url         text,
  title       text,
  description text,
  label       text,
  gradient    text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── listings ─────────────────────────────────────────────────────────────────
create table if not exists public.listings (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references public.companies(id) on delete cascade,
  type                text not null default 'offer',   -- offer | need
  title               text not null,
  capability          text,
  capacity            text,
  lead_time           text,
  moq                 text,
  moq_label           text,
  available_from      text,
  available_until     text,
  team_size           text,
  industry            text,
  subcategory         text,
  location            text,
  equipment           text,
  equipment_label     text,
  category_label      text,
  certifications      text[] not null default '{}',
  tags                text[] not null default '{}',
  products            text[] not null default '{}',
  industries_served   text[] not null default '{}',
  opportunity_tags    text[] not null default '{}',
  availability_status text not null default 'available', -- available | expiring | expired
  status              text not null default 'Approved',  -- Pending | Approved | Suspended (moderation)
  verified            boolean not null default false,
  views               int not null default 0,
  connections_count   int not null default 0,
  messages_count      int not null default 0,
  posted_at           timestamptz not null default now(),
  expires_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── listing_media ────────────────────────────────────────────────────────────
create table if not exists public.listing_media (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  kind        text not null default 'photo', -- primary | photo | video
  url         text,
  title       text,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── saved_companies ──────────────────────────────────────────────────────────
create table if not exists public.saved_companies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, company_id)
);

-- ── saved_listings ───────────────────────────────────────────────────────────
create table if not exists public.saved_listings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, listing_id)
);

-- ── follows ──────────────────────────────────────────────────────────────────
create table if not exists public.follows (
  id               uuid primary key default gen_random_uuid(),
  follower_user_id uuid not null references public.users(id) on delete cascade,
  company_id       uuid not null references public.companies(id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (follower_user_id, company_id)
);

-- ── connections ──────────────────────────────────────────────────────────────
create table if not exists public.connections (
  id                   uuid primary key default gen_random_uuid(),
  requester_user_id    uuid not null references public.users(id) on delete cascade,
  addressee_company_id uuid references public.companies(id) on delete cascade,
  addressee_user_id    uuid references public.users(id) on delete cascade,
  status               text not null default 'pending', -- pending | accepted | declined
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── message_threads ──────────────────────────────────────────────────────────
-- participant_user_ids drives "messages in threads they belong to" RLS.
create table if not exists public.message_threads (
  id                  uuid primary key default gen_random_uuid(),
  subject             text,
  company_id          uuid references public.companies(id) on delete set null,
  created_by_user_id  uuid references public.users(id) on delete set null,
  participant_user_ids uuid[] not null default '{}',
  last_message_at     timestamptz not null default now(),
  flagged             boolean not null default false, -- gates admin body access
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── messages ─────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  thread_id       uuid not null references public.message_threads(id) on delete cascade,
  sender_user_id  uuid not null references public.users(id) on delete cascade,
  body            text,
  attachment_url  text,
  attachment_name text,
  read            boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── notifications ────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        text not null default 'view', -- view | message | saved | expiring | connection
  text        text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── intake_submissions ───────────────────────────────────────────────────────
-- Standalone public intake form submissions (optionally linked to a company).
create table if not exists public.intake_submissions (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid references public.companies(id) on delete set null,
  company_name       text not null,
  contact_name       text not null,
  email              text not null,
  phone              text,
  website            text,
  location           text,
  industry           text,
  subcategory        text,
  resources_offered  text,
  resources_sought   text,
  capacity_details   text,
  preferred_contact  text not null default 'Email',
  logo_name          text,
  image_name         text,
  logo_url           text,
  image_url          text,
  notes              text,
  admin_note         text,                          -- internal admin note
  status             text not null default 'new', -- new | reviewed | archived
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── admin_users ──────────────────────────────────────────────────────────────
-- Drives is_admin() RLS authorization. Seed from ADMIN_EMAILS (bottom of file).
create table if not exists public.admin_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  email       text unique not null,
  role        public.admin_role not null default 'admin', -- owner | admin | support
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── admin_notes ───────────────────────────────────────────────────────────────
-- Private internal notes admins keep on a user / company / listing. RLS makes
-- these readable & writable ONLY by admins.
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
-- Abuse/spam reports filed against a company. Admin-manageable.
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
-- Abuse/spam reports filed against a listing. Admin-manageable.
create table if not exists public.reported_listings (
  id                uuid primary key default gen_random_uuid(),
  reporter_user_id  uuid references public.users(id) on delete set null,
  target_id         uuid not null references public.listings(id) on delete cascade,
  reason            text,
  status            text not null default 'pending' check (status in ('pending', 'reviewed', 'removed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Backfill columns (idempotent upgrade path for DBs created before 0002/0003) ─
-- These no-op on a fresh run (columns already created above) but upgrade older DBs.
alter table public.admin_users        add column if not exists role public.admin_role not null default 'admin';
alter table public.message_threads    add column if not exists flagged boolean not null default false;
alter table public.intake_submissions add column if not exists admin_note text;
alter table public.companies          add column if not exists verification_status public.verification_status not null default 'unverified';
alter table public.companies          add column if not exists verified_at timestamptz;
alter table public.companies          add column if not exists verified_by uuid references public.users(id) on delete set null;

-- ════════════════════════════════════════════════════════════════════════════
--  4) HELPER FUNCTIONS  (defined AFTER tables so SQL bodies validate cleanly)
-- ════════════════════════════════════════════════════════════════════════════

-- Keep updated_at fresh on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Map the current auth.uid() (auth.users.id) to our public.users.id.
create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_user_id = auth.uid();
$$;

-- True when the signed-in user's JWT email is present in admin_users.
-- Postgres cannot read process.env, so admin authorization is driven by the
-- admin_users table. Seed it from your ADMIN_EMAILS (see bottom of file). This
-- mirrors the env-based gate used by the /admin route in the app.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- True when the signed-in user owns the given company.
create or replace function public.owns_company(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies c
    where c.id = cid
      and c.owner_id = public.current_user_id()
  );
$$;

-- ════════════════════════════════════════════════════════════════════════════
--  5) updated_at TRIGGERS (applied to every table)
-- ════════════════════════════════════════════════════════════════════════════
do $$
declare
  t text;
  tables text[] := array[
    'users','companies','company_profiles','company_locations','company_contacts',
    'company_media','listings','listing_media','saved_companies','saved_listings',
    'follows','connections','message_threads','messages','notifications',
    'intake_submissions','admin_users','admin_notes','reported_companies',
    'reported_listings'
  ];
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
--  6) ROW LEVEL SECURITY  (enable + policies)
-- ════════════════════════════════════════════════════════════════════════════
alter table public.users              enable row level security;
alter table public.companies          enable row level security;
alter table public.company_profiles   enable row level security;
alter table public.company_locations  enable row level security;
alter table public.company_contacts   enable row level security;
alter table public.company_media      enable row level security;
alter table public.listings           enable row level security;
alter table public.listing_media      enable row level security;
alter table public.saved_companies    enable row level security;
alter table public.saved_listings     enable row level security;
alter table public.follows            enable row level security;
alter table public.connections        enable row level security;
alter table public.message_threads    enable row level security;
alter table public.messages           enable row level security;
alter table public.notifications      enable row level security;
alter table public.intake_submissions enable row level security;
alter table public.admin_users        enable row level security;
alter table public.admin_notes        enable row level security;
alter table public.reported_companies enable row level security;
alter table public.reported_listings  enable row level security;

-- ── users ─────────────────────────────────────────────────────────────────────
drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
  for select using (auth_user_id = auth.uid() or public.is_admin());
drop policy if exists users_insert_self on public.users;
create policy users_insert_self on public.users
  for insert with check (auth_user_id = auth.uid() or public.is_admin());
drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (auth_user_id = auth.uid() or public.is_admin())
  with check (auth_user_id = auth.uid() or public.is_admin());
drop policy if exists users_delete_admin on public.users;
create policy users_delete_admin on public.users
  for delete using (public.is_admin());

-- ── companies (public read of approved; owner write; admin all) ───────────────
drop policy if exists companies_select_public on public.companies;
create policy companies_select_public on public.companies
  for select using (status = 'Approved' or owner_id = public.current_user_id() or public.is_admin());
drop policy if exists companies_insert_owner on public.companies;
create policy companies_insert_owner on public.companies
  for insert with check (owner_id = public.current_user_id() or public.is_admin());
drop policy if exists companies_update_owner on public.companies;
create policy companies_update_owner on public.companies
  for update using (owner_id = public.current_user_id() or public.is_admin())
  with check (owner_id = public.current_user_id() or public.is_admin());
drop policy if exists companies_delete_owner on public.companies;
create policy companies_delete_owner on public.companies
  for delete using (owner_id = public.current_user_id() or public.is_admin());

-- ── company_profiles ──────────────────────────────────────────────────────────
drop policy if exists company_profiles_select on public.company_profiles;
create policy company_profiles_select on public.company_profiles
  for select using (
    exists (select 1 from public.companies c where c.id = company_id and c.status = 'Approved')
    or public.owns_company(company_id) or public.is_admin()
  );
drop policy if exists company_profiles_write on public.company_profiles;
create policy company_profiles_write on public.company_profiles
  for all using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

-- ── company_locations ─────────────────────────────────────────────────────────
drop policy if exists company_locations_select on public.company_locations;
create policy company_locations_select on public.company_locations
  for select using (
    exists (select 1 from public.companies c where c.id = company_id and c.status = 'Approved')
    or public.owns_company(company_id) or public.is_admin()
  );
drop policy if exists company_locations_write on public.company_locations;
create policy company_locations_write on public.company_locations
  for all using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

-- ── company_contacts ──────────────────────────────────────────────────────────
drop policy if exists company_contacts_select on public.company_contacts;
create policy company_contacts_select on public.company_contacts
  for select using (
    exists (select 1 from public.companies c where c.id = company_id and c.status = 'Approved')
    or public.owns_company(company_id) or public.is_admin()
  );
drop policy if exists company_contacts_write on public.company_contacts;
create policy company_contacts_write on public.company_contacts
  for all using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

-- ── company_media ─────────────────────────────────────────────────────────────
drop policy if exists company_media_select on public.company_media;
create policy company_media_select on public.company_media
  for select using (
    exists (select 1 from public.companies c where c.id = company_id and c.status = 'Approved')
    or public.owns_company(company_id) or public.is_admin()
  );
drop policy if exists company_media_write on public.company_media;
create policy company_media_write on public.company_media
  for all using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

-- ── listings (public read approved; owner write; admin all) ───────────────────
drop policy if exists listings_select_public on public.listings;
create policy listings_select_public on public.listings
  for select using (status = 'Approved' or public.owns_company(company_id) or public.is_admin());
drop policy if exists listings_write_owner on public.listings;
create policy listings_write_owner on public.listings
  for all using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

-- ── listing_media ─────────────────────────────────────────────────────────────
drop policy if exists listing_media_select on public.listing_media;
create policy listing_media_select on public.listing_media
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.status = 'Approved' or public.owns_company(l.company_id) or public.is_admin())
    )
  );
drop policy if exists listing_media_write on public.listing_media;
create policy listing_media_write on public.listing_media
  for all using (
    exists (select 1 from public.listings l where l.id = listing_id and (public.owns_company(l.company_id) or public.is_admin()))
  )
  with check (
    exists (select 1 from public.listings l where l.id = listing_id and (public.owns_company(l.company_id) or public.is_admin()))
  );

-- ── saved_companies (own rows only) ───────────────────────────────────────────
drop policy if exists saved_companies_rw on public.saved_companies;
create policy saved_companies_rw on public.saved_companies
  for all using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

-- ── saved_listings (own rows only) ────────────────────────────────────────────
drop policy if exists saved_listings_rw on public.saved_listings;
create policy saved_listings_rw on public.saved_listings
  for all using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

-- ── follows (own rows only) ───────────────────────────────────────────────────
drop policy if exists follows_rw on public.follows;
create policy follows_rw on public.follows
  for all using (follower_user_id = public.current_user_id() or public.is_admin())
  with check (follower_user_id = public.current_user_id() or public.is_admin());

-- ── connections (requester or addressee) ──────────────────────────────────────
drop policy if exists connections_select on public.connections;
create policy connections_select on public.connections
  for select using (
    requester_user_id = public.current_user_id()
    or addressee_user_id = public.current_user_id()
    or public.owns_company(addressee_company_id)
    or public.is_admin()
  );
drop policy if exists connections_insert on public.connections;
create policy connections_insert on public.connections
  for insert with check (requester_user_id = public.current_user_id() or public.is_admin());
drop policy if exists connections_update on public.connections;
create policy connections_update on public.connections
  for update using (
    requester_user_id = public.current_user_id()
    or addressee_user_id = public.current_user_id()
    or public.owns_company(addressee_company_id)
    or public.is_admin()
  );
drop policy if exists connections_delete on public.connections;
create policy connections_delete on public.connections
  for delete using (requester_user_id = public.current_user_id() or public.is_admin());

-- ── message_threads (participants only) ───────────────────────────────────────
drop policy if exists threads_select on public.message_threads;
create policy threads_select on public.message_threads
  for select using (public.current_user_id() = any (participant_user_ids) or public.is_admin());
drop policy if exists threads_insert on public.message_threads;
create policy threads_insert on public.message_threads
  for insert with check (public.current_user_id() = any (participant_user_ids) or public.is_admin());
drop policy if exists threads_update on public.message_threads;
create policy threads_update on public.message_threads
  for update using (public.current_user_id() = any (participant_user_ids) or public.is_admin())
  with check (public.current_user_id() = any (participant_user_ids) or public.is_admin());

-- ── messages (only in threads the user belongs to) ────────────────────────────
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select using (
    exists (
      select 1 from public.message_threads t
      where t.id = thread_id and (public.current_user_id() = any (t.participant_user_ids) or public.is_admin())
    )
  );
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (
    sender_user_id = public.current_user_id()
    and exists (
      select 1 from public.message_threads t
      where t.id = thread_id and public.current_user_id() = any (t.participant_user_ids)
    )
  );
drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update using (sender_user_id = public.current_user_id() or public.is_admin())
  with check (sender_user_id = public.current_user_id() or public.is_admin());

-- ── notifications (own rows only) ─────────────────────────────────────────────
drop policy if exists notifications_rw on public.notifications;
create policy notifications_rw on public.notifications
  for all using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

-- ── intake_submissions ────────────────────────────────────────────────────────
-- Anyone (including anonymous visitors) may submit the public intake form.
-- Only admins may read / moderate / delete submissions.
drop policy if exists intake_insert_public on public.intake_submissions;
create policy intake_insert_public on public.intake_submissions
  for insert with check (true);
drop policy if exists intake_select_admin on public.intake_submissions;
create policy intake_select_admin on public.intake_submissions
  for select using (public.is_admin());
drop policy if exists intake_update_admin on public.intake_submissions;
create policy intake_update_admin on public.intake_submissions
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists intake_delete_admin on public.intake_submissions;
create policy intake_delete_admin on public.intake_submissions
  for delete using (public.is_admin());

-- ── admin_users (admin-managed) ───────────────────────────────────────────────
drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select using (public.is_admin() or email = (auth.jwt() ->> 'email'));
drop policy if exists admin_users_write on public.admin_users;
create policy admin_users_write on public.admin_users
  for all using (public.is_admin()) with check (public.is_admin());

-- ── admin_notes (private to admins) ───────────────────────────────────────────
drop policy if exists admin_notes_all on public.admin_notes;
create policy admin_notes_all on public.admin_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- ── reported_companies (users file/see own; admins manage all) ────────────────
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

-- ── reported_listings (users file/see own; admins manage all) ─────────────────
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

-- ════════════════════════════════════════════════════════════════════════════
--  7) STORAGE BUCKETS  (public-read buckets for media)
-- ════════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values
  ('company-logos',  'company-logos',  true),
  ('company-covers', 'company-covers', true),
  ('listing-images', 'listing-images', true),
  ('listing-photos', 'listing-photos', true),
  ('listing-videos', 'listing-videos', true)
on conflict (id) do nothing;

-- Public read for all CapMaxx media buckets.
drop policy if exists capmaxx_media_public_read on storage.objects;
create policy capmaxx_media_public_read on storage.objects
  for select using (
    bucket_id in ('company-logos','company-covers','listing-images','listing-photos','listing-videos')
  );

-- Authenticated users may upload / update / delete media in those buckets.
-- (Tighten later to per-owner folder prefixes if desired.)
drop policy if exists capmaxx_media_auth_write on storage.objects;
create policy capmaxx_media_auth_write on storage.objects
  for insert to authenticated with check (
    bucket_id in ('company-logos','company-covers','listing-images','listing-photos','listing-videos')
  );
drop policy if exists capmaxx_media_auth_update on storage.objects;
create policy capmaxx_media_auth_update on storage.objects
  for update to authenticated using (
    bucket_id in ('company-logos','company-covers','listing-images','listing-photos','listing-videos')
  );
drop policy if exists capmaxx_media_auth_delete on storage.objects;
create policy capmaxx_media_auth_delete on storage.objects
  for delete to authenticated using (
    bucket_id in ('company-logos','company-covers','listing-images','listing-photos','listing-videos')
  );

-- ════════════════════════════════════════════════════════════════════════════
--  8) INDEXES (on foreign keys & common lookups)
-- ════════════════════════════════════════════════════════════════════════════
create index if not exists idx_companies_owner          on public.companies(owner_id);
create index if not exists idx_companies_status          on public.companies(status);
create index if not exists idx_companies_verification    on public.companies(verification_status);
create index if not exists idx_company_profiles_company  on public.company_profiles(company_id);
create index if not exists idx_company_locations_company on public.company_locations(company_id);
create index if not exists idx_company_contacts_company  on public.company_contacts(company_id);
create index if not exists idx_company_media_company     on public.company_media(company_id);
create index if not exists idx_listings_company          on public.listings(company_id);
create index if not exists idx_listings_status           on public.listings(status);
create index if not exists idx_listings_type             on public.listings(type);
create index if not exists idx_listing_media_listing     on public.listing_media(listing_id);
create index if not exists idx_saved_companies_user      on public.saved_companies(user_id);
create index if not exists idx_saved_companies_company   on public.saved_companies(company_id);
create index if not exists idx_saved_listings_user       on public.saved_listings(user_id);
create index if not exists idx_saved_listings_listing    on public.saved_listings(listing_id);
create index if not exists idx_follows_user              on public.follows(follower_user_id);
create index if not exists idx_follows_company           on public.follows(company_id);
create index if not exists idx_connections_requester     on public.connections(requester_user_id);
create index if not exists idx_connections_company       on public.connections(addressee_company_id);
create index if not exists idx_messages_thread           on public.messages(thread_id);
create index if not exists idx_messages_sender           on public.messages(sender_user_id);
create index if not exists idx_threads_company           on public.message_threads(company_id);
create index if not exists idx_threads_participants      on public.message_threads using gin (participant_user_ids);
create index if not exists idx_message_threads_flagged   on public.message_threads(flagged);
create index if not exists idx_notifications_user        on public.notifications(user_id);
create index if not exists idx_intake_status             on public.intake_submissions(status);
create index if not exists idx_intake_company            on public.intake_submissions(company_id);
create index if not exists idx_admin_users_email         on public.admin_users(lower(email));
create index if not exists idx_admin_notes_target        on public.admin_notes(target_type, target_id);
create index if not exists idx_admin_notes_author        on public.admin_notes(author_user_id);
create index if not exists idx_reported_companies_target on public.reported_companies(target_id);
create index if not exists idx_reported_companies_status on public.reported_companies(status);
create index if not exists idx_reported_listings_target  on public.reported_listings(target_id);
create index if not exists idx_reported_listings_status  on public.reported_listings(status);

-- ════════════════════════════════════════════════════════════════════════════
--  9) SEED admin_users  ← EDIT THESE EMAILS TO MATCH YOUR ADMIN_EMAILS
-- ════════════════════════════════════════════════════════════════════════════
-- Keep this list in sync with the ADMIN_EMAILS env var used by the /admin route.
-- These emails get full admin authorization in the database via is_admin().
insert into public.admin_users (email, role)
values
  ('owner@capmaxx.com', 'owner'),
  ('meckmillion04@gmail.com', 'admin')
on conflict (email) do nothing;

-- Done. Re-run safely anytime.
