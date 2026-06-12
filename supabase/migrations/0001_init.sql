-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CapMaxx — Migration 0001: base schema                                      ║
-- ║                                                                            ║
-- ║  Ordered so it runs top-to-bottom on a fresh database with no forward       ║
-- ║  references: extensions → tables → functions → triggers → RLS → storage →   ║
-- ║  indexes → seed. (Migrations 0002 admin + 0003 verification build on this.) ║
-- ║                                                                            ║
-- ║  Identity table: public.users (carries auth_user_id -> auth.users).         ║
-- ║  Idempotent; safe to re-run. The consolidated schema.sql contains this plus ║
-- ║  0002 + 0003 in the same order.                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── 1) EXTENSIONS ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ── 2) TABLES (FK-dependency order: referenced tables first) ──────────────────

-- users — THE single identity table. auth_user_id links to Supabase Auth.
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  email         text unique not null,
  full_name     text,
  first_name    text,
  last_name     text,
  phone         text,
  avatar_url    text,
  role          text not null default 'Member',
  status        text not null default 'Approved',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

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
  verified       boolean not null default false,
  status         text not null default 'Pending',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

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

create table if not exists public.company_locations (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text,
  address     text,
  type        text,
  contact     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

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

create table if not exists public.company_media (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  kind        text not null default 'gallery',
  url         text,
  title       text,
  description text,
  label       text,
  gradient    text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.listings (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references public.companies(id) on delete cascade,
  type                text not null default 'offer',
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
  availability_status text not null default 'available',
  status              text not null default 'Approved',
  verified            boolean not null default false,
  views               int not null default 0,
  connections_count   int not null default 0,
  messages_count      int not null default 0,
  posted_at           timestamptz not null default now(),
  expires_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.listing_media (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  kind        text not null default 'photo',
  url         text,
  title       text,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.saved_companies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, company_id)
);

create table if not exists public.saved_listings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, listing_id)
);

create table if not exists public.follows (
  id               uuid primary key default gen_random_uuid(),
  follower_user_id uuid not null references public.users(id) on delete cascade,
  company_id       uuid not null references public.companies(id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (follower_user_id, company_id)
);

create table if not exists public.connections (
  id                   uuid primary key default gen_random_uuid(),
  requester_user_id    uuid not null references public.users(id) on delete cascade,
  addressee_company_id uuid references public.companies(id) on delete cascade,
  addressee_user_id    uuid references public.users(id) on delete cascade,
  status               text not null default 'pending',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists public.message_threads (
  id                  uuid primary key default gen_random_uuid(),
  subject             text,
  company_id          uuid references public.companies(id) on delete set null,
  created_by_user_id  uuid references public.users(id) on delete set null,
  participant_user_ids uuid[] not null default '{}',
  last_message_at     timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

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

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        text not null default 'view',
  text        text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

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
  status             text not null default 'new',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.admin_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  email       text unique not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── 3) HELPER FUNCTIONS (after tables so SQL bodies validate) ─────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.users where auth_user_id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.owns_company(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.companies c
    where c.id = cid and c.owner_id = public.current_user_id()
  );
$$;

-- ── 4) updated_at TRIGGERS ────────────────────────────────────────────────────
do $$
declare
  t text;
  tables text[] := array[
    'users','companies','company_profiles','company_locations','company_contacts',
    'company_media','listings','listing_media','saved_companies','saved_listings',
    'follows','connections','message_threads','messages','notifications',
    'intake_submissions','admin_users'
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

-- ── 5) ROW LEVEL SECURITY ─────────────────────────────────────────────────────
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

drop policy if exists listings_select_public on public.listings;
create policy listings_select_public on public.listings
  for select using (status = 'Approved' or public.owns_company(company_id) or public.is_admin());
drop policy if exists listings_write_owner on public.listings;
create policy listings_write_owner on public.listings
  for all using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

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

drop policy if exists saved_companies_rw on public.saved_companies;
create policy saved_companies_rw on public.saved_companies
  for all using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

drop policy if exists saved_listings_rw on public.saved_listings;
create policy saved_listings_rw on public.saved_listings
  for all using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

drop policy if exists follows_rw on public.follows;
create policy follows_rw on public.follows
  for all using (follower_user_id = public.current_user_id() or public.is_admin())
  with check (follower_user_id = public.current_user_id() or public.is_admin());

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

drop policy if exists notifications_rw on public.notifications;
create policy notifications_rw on public.notifications
  for all using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

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

drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select using (public.is_admin() or email = (auth.jwt() ->> 'email'));
drop policy if exists admin_users_write on public.admin_users;
create policy admin_users_write on public.admin_users
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 6) STORAGE BUCKETS ────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('company-logos',  'company-logos',  true),
  ('company-covers', 'company-covers', true),
  ('listing-images', 'listing-images', true),
  ('listing-photos', 'listing-photos', true),
  ('listing-videos', 'listing-videos', true)
on conflict (id) do nothing;

drop policy if exists capmaxx_media_public_read on storage.objects;
create policy capmaxx_media_public_read on storage.objects
  for select using (
    bucket_id in ('company-logos','company-covers','listing-images','listing-photos','listing-videos')
  );
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

-- ── 7) INDEXES ────────────────────────────────────────────────────────────────
create index if not exists idx_companies_owner          on public.companies(owner_id);
create index if not exists idx_companies_status          on public.companies(status);
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
create index if not exists idx_notifications_user        on public.notifications(user_id);
create index if not exists idx_intake_status             on public.intake_submissions(status);
create index if not exists idx_intake_company            on public.intake_submissions(company_id);
create index if not exists idx_admin_users_email         on public.admin_users(lower(email));

-- ── 8) SEED admin_users (edit to match ADMIN_EMAILS) ──────────────────────────
insert into public.admin_users (email)
values ('owner@capmaxx.com')
on conflict (email) do nothing;

-- Done. Re-run safely anytime.
