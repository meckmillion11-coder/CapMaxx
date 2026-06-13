-- CapMaxx Early Access Intake System

-- Extend intake_submissions with early-access fields
alter table public.intake_submissions
  add column if not exists purpose text,
  add column if not exists listing_title text,
  add column if not exists listing_description text,
  add column if not exists resource_categories text[] not null default '{}',
  add column if not exists moq text,
  add column if not exists lead_time text,
  add column if not exists certifications text,
  add column if not exists team_size text,
  add column if not exists capacity_info text,
  add column if not exists service_area text,
  add column if not exists equipment_details text,
  add column if not exists industries_served text[] not null default '{}',
  add column if not exists availability_notes text,
  add column if not exists video_urls text[] not null default '{}',
  add column if not exists additional_notes text,
  add column if not exists converted_listing_ids uuid[] not null default '{}',
  add column if not exists approved_at timestamptz,
  add column if not exists converted_at timestamptz;

-- intake_media — photos, videos, logos attached to a submission
create table if not exists public.intake_media (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null references public.intake_submissions(id) on delete cascade,
  kind            text not null default 'photo',
  file_name       text,
  url             text,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_intake_media_submission on public.intake_media(submission_id);

-- intake_notes — admin notes on submissions (audit trail)
create table if not exists public.intake_notes (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null references public.intake_submissions(id) on delete cascade,
  author_email    text,
  body            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_intake_notes_submission on public.intake_notes(submission_id);

-- intake_status — status change history
create table if not exists public.intake_status (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null references public.intake_submissions(id) on delete cascade,
  status          text not null,
  changed_by      text,
  note            text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_intake_status_submission on public.intake_status(submission_id);

-- intake_form_config — admin-editable form field configuration (single row)
create table if not exists public.intake_form_config (
  id              uuid primary key default gen_random_uuid(),
  config          jsonb not null default '{}',
  updated_by      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- RLS
alter table public.intake_media enable row level security;
alter table public.intake_notes enable row level security;
alter table public.intake_status enable row level security;
alter table public.intake_form_config enable row level security;

drop policy if exists intake_media_admin on public.intake_media;
create policy intake_media_admin on public.intake_media
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists intake_media_public_insert on public.intake_media;
create policy intake_media_public_insert on public.intake_media
  for insert with check (true);

drop policy if exists intake_notes_admin on public.intake_notes;
create policy intake_notes_admin on public.intake_notes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists intake_status_admin on public.intake_status;
create policy intake_status_admin on public.intake_status
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists intake_status_public_insert on public.intake_status;
create policy intake_status_public_insert on public.intake_status
  for insert with check (true);

drop policy if exists intake_form_config_admin on public.intake_form_config;
create policy intake_form_config_admin on public.intake_form_config
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists intake_form_config_public_read on public.intake_form_config;
create policy intake_form_config_public_read on public.intake_form_config
  for select using (true);

-- Seed default form config if empty
insert into public.intake_form_config (config)
select '{}'::jsonb
where not exists (select 1 from public.intake_form_config limit 1);
