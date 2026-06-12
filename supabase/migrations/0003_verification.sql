-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CapMaxx — Migration 0003: Company Verification Workflow                    ║
-- ║                                                                            ║
-- ║  Manual, admin-driven verification for companies (separate from the        ║
-- ║  approve/suspend moderation flow):                                         ║
-- ║    • verification_status enum: unverified | pending | verified | rejected  ║
-- ║    • verified_at  (when it became verified)                                ║
-- ║    • verified_by  (admin user who made the decision)                       ║
-- ║                                                                            ║
-- ║  Safe to re-run (guarded enum + add column if not exists).                  ║
-- ║  This content is also folded into schema.sql.                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── verification_status enum ──────────────────────────────────────────────────
do $$ begin
  create type public.verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

-- ── companies: verification columns ───────────────────────────────────────────
alter table public.companies
  add column if not exists verification_status public.verification_status not null default 'unverified';
alter table public.companies
  add column if not exists verified_at timestamptz;
alter table public.companies
  add column if not exists verified_by uuid references public.users(id) on delete set null;

create index if not exists idx_companies_verification on public.companies(verification_status);

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- No new policies required: verification_status lives on public.companies, which
-- is already covered by the companies policies from 0001_init.sql —
--   • SELECT: public can read Approved companies (so verification_status of an
--     approved company is publicly readable), owners read their own, admins read all.
--   • UPDATE: only the owning user or an admin (is_admin()) — so verification is
--     effectively admin-managed (the app only ever sets it from admin routes).
-- updated_at is maintained by the existing trg_set_updated_at trigger on companies.

-- Done. Re-run safely anytime.
