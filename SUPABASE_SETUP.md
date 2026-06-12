# CapMaxx × Supabase — Setup Guide

This app uses **Supabase** as its real backend (Postgres + Auth + Storage), with a
**graceful fallback** to the original demo/mock/localStorage behavior whenever the
Supabase environment variables are absent. You can develop and demo the entire UI
without Supabase configured; wire it up when you're ready for real persistence.

---

## 1. Run the SQL

1. Create a Supabase project (https://supabase.com → New project).
2. In the dashboard: **SQL Editor → New query**.
3. Paste the **entire** contents of [`schema.sql`](./schema.sql) and click **Run**.
   This consolidated file already includes the admin-panel expansion, so a fresh
   project only needs this one script.

This single script creates everything:

- **20 tables** (all with `id uuid PK`, `created_at`, `updated_at`):
  `users, companies, company_profiles, company_locations, company_contacts,
  company_media, listings, listing_media, saved_companies, saved_listings,
  follows, connections, message_threads, messages, notifications,
  intake_submissions, admin_users, admin_notes, reported_companies,
  reported_listings`
- Foreign keys + indexes on every FK and common lookup column.
- An `updated_at` trigger applied to every table.
- **Row Level Security** enabled on every table, with policies (see §4).
- Helper functions: `current_user_id()`, `is_admin()`, `owns_company()`, `set_updated_at()`.
- An `admin_role` enum (`owner | admin | support`) used by `admin_users.role`.
- A `verification_status` enum (`unverified | pending | verified | rejected`) on
  `companies`, plus `verified_at` / `verified_by` (admin-driven verification).
- **Storage buckets** (public-read): `company-logos, company-covers,
  listing-images, listing-photos, listing-videos` + their access policies.
- A seed row in `admin_users` (edit the email at the bottom of the file).

The script is safe to re-run (uses `if not exists` / `create or replace` and drops
policies before recreating them).

> **Run order (important):** `schema.sql` is strictly ordered so it runs
> top-to-bottom on a brand-new project with **no missing-relation / forward-reference
> errors**: extensions → enums → **all tables** (FK-dependency order) → helper
> functions → triggers → RLS + policies → storage → indexes → seeds. The helper
> functions (e.g. `current_user_id()`) are `language sql` and are validated at
> creation time, so they are defined **after** the tables they query.
>
> **Single identity table:** `public.users` is the one and only identity table
> (it carries `auth_user_id → auth.users(id)`). Every FK, helper function, and RLS
> policy that needs "the current user" goes through `public.users`. There is no
> separate `profiles` table (`company_profiles` is unrelated company data).

> **Migrations:** the schema is split across
> [`0001_init.sql`](./supabase/migrations/0001_init.sql) (base),
> [`0002_admin_expansion.sql`](./supabase/migrations/0002_admin_expansion.sql)
> (admin panel: roles, `admin_notes`, reports, thread `flagged`, intake
> `admin_note`), and
> [`0003_verification.sql`](./supabase/migrations/0003_verification.sql)
> (company verification: `verification_status` enum + `verified_at` / `verified_by`).
> If you already ran earlier migrations on an existing database, run **only** the
> newer ones to upgrade. A brand-new project should just run `schema.sql`, which
> contains all of them. Every file is idempotent.

> Storage buckets and their policies are created **by the SQL**. If your Supabase
> project restricts `storage.*` DDL from the SQL editor, create the five buckets
> manually under **Storage → New bucket** (mark each **Public**) — the upload
> helpers will then work.

---

## 2. Environment variables (`.env.local`)

Copy `.env.example` → `.env.local` and fill in the four values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role secret key>
ADMIN_EMAILS=owner@capmaxx.com
```

Where to find each (Supabase dashboard → **Project Settings → API**):

| Variable | Source |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project API keys → `anon` `public`** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Project API keys → `service_role`** (secret — server only) |
| `ADMIN_EMAILS` | You choose — comma-separated admin emails |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` has **no** `NEXT_PUBLIC_` prefix and is only read
> in server-only modules (`src/lib/supabase/admin.ts`, `/api/admin/*`). Never
> import it into a client component.

Restart `next dev` after editing `.env.local`.

---

## 3. Post-setup steps

1. **Enable email auth**: Supabase dashboard → **Authentication → Providers →
   Email** (enabled by default). For quick local testing you may disable
   "Confirm email" so sign-ups get a session immediately.
2. **Seed `admin_users`**: handled automatically — the `/api/admin/data` route
   calls `seedAdminUsers()` which upserts every address in `ADMIN_EMAILS`. The
   SQL also seeds one row; edit it to match your admin email.
3. **Create buckets** (only if your project blocked storage DDL in §1) — see the
   note in §1.
4. **(Optional) Confirm RLS**: dashboard → **Authentication → Policies** should
   list policies for every table.

---

## 4. Tables & RLS overview

| Area | Read | Write |
| --- | --- | --- |
| `companies`, `company_profiles`, `company_locations`, `company_contacts`, `company_media`, `listings`, `listing_media` | Public read when the (parent) company/listing is **Approved**; owners + admins always | Only the **owning user** (`owns_company`) or an **admin** |
| `saved_companies`, `saved_listings`, `follows`, `notifications` | Owner rows only (or admin) | Owner rows only (or admin) |
| `connections` | Requester, addressee, or company owner (or admin) | Requester creates; participants/owner/admin update |
| `message_threads`, `messages` | Only **participants** of the thread (or admin) | Participants only; sender must be the current user |
| `intake_submissions` | **Admins only** | **Anyone** may INSERT (public form); admins moderate/delete |
| `users` | Self or admin | Self or admin |
| `admin_users` | Admin (or your own email) | Admin only |
| `admin_notes` | **Admins only** (private) | Admins only |
| `reported_companies`, `reported_listings` | Reporter (own) or admin | Reporter may file; admins update/delete (manage) |

`message_threads.flagged` gates abuse review: the admin Messages tab shows thread
**metadata only**, and message **bodies** are fetched (server-side) **only** for
threads with `flagged = true`.

**Company verification** (`companies.verification_status`, `verified_at`,
`verified_by`) needs **no extra policies** — it rides the existing `companies`
RLS: the value of an **Approved** company is publicly readable, and only the
owner or an **admin** can UPDATE it (the app only ever writes it from admin
routes). It is separate from the Pending/Approved/Suspended moderation `status`.

**Admin authorization model (env ↔ DB):** Postgres can't read `process.env`, so DB
admin authorization is driven by the `admin_users` table via `is_admin()`, which
compares the JWT email (`auth.jwt() ->> 'email'`) to `admin_users.email`. The app
keeps `admin_users` in sync with the `ADMIN_EMAILS` env var (auto-seed on the
admin route + the SQL seed). So:

- **`ADMIN_EMAILS`** gates the `/admin` page and `/api/admin/*` routes (app layer).
- **`admin_users`** gates admin DB operations under RLS (database layer).
- They are kept identical by `seedAdminUsers()`.

---

## 5. How the graceful (no-env) fallback works

When `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing:

- All client factories (`getSupabaseBrowserClient`, `getSupabaseServerClient`,
  `getSupabaseAdminClient`) return **`null`** and log a single console warning —
  they never throw.
- Every `src/lib/db/*` helper and storage upload **no-ops** (returns
  `{ configured:false }` / a local object-URL preview), so UI handlers keep
  working exactly as the demo did.
- `intake_submissions` continues to use **localStorage + in-memory** state.
- `/admin` (`/api/admin/data` returns `{ configured:false }`) keeps showing the
  **mock** users/companies/listings.
- File uploads return a **local object URL** so previews still render.

When the env vars **are** present, the same code paths transparently switch to
real Supabase reads/writes — no UI/markup changes required.

---

## 6. Admin Panel (`/admin`)

**Access:** the `/admin` page and `/api/admin/*` routes are gated by `ADMIN_EMAILS`
(app layer); DB ops are authorized by `is_admin()` against `admin_users` (DB
layer). A non-admin email sees **Access Denied**. Admin is never shown in normal
navigation. When Supabase is unconfigured the panel runs entirely on mock data.

Tabs / capabilities (all read from Supabase when configured, else mock):

| Tab | Capabilities |
| --- | --- |
| **Platform Stats** | Live counts: users, companies, listings, offer/need, active listings, messages, new signups (30d); pending approvals, **pending verification** & open reports |
| **Users** | Search; view email/name/company/role; **Suspend** / **Reactivate** |
| **Companies** | Search; filter by **verification status**; verification badge; **Approve** / **Suspend** / **Delete**; company name links to the public profile (new tab) |
| **Verification** | Queue of companies by verification state (default **pending**); per-company **Mark Pending** / **Verify** / **Reject** (reason saved as an admin note) |
| **Listings** | Search; filter **Offer/Need** and **Active/Expiring/Expired**; **Approve** / **Suspend** / **Delete**; company reference links to the profile |
| **Reports** | Reported companies + listings; **Mark reviewed**; **Remove content** (suspends target + marks report removed) |
| **Intake Submissions** | View; **Mark reviewed** / Archive / Delete; **Add admin note** (inline); **Convert to company** (creates a Pending company draft when live; "coming soon" in demo) |
| **Messages** | Thread metadata only (parties, participants, count, last activity); bodies revealed **only** for `flagged` threads |
| **Admin Notes** | Add private internal notes on a user/company/listing; searchable list (admins only) |

Notes on actions: moderation is **optimistic** — local state updates instantly and,
when live, a best-effort call to `/api/admin/action` persists via the service-role
client. "Convert to company" is intentionally a minimal draft-creator (no billing,
verification, or onboarding automation).

### Verification workflow (manual, admin-only)

`companies.verification_status` is an enum with four states:

| State | Meaning | Set by |
| --- | --- | --- |
| `unverified` | Default; no review done | default / "reset" |
| `pending` | Awaiting admin review (docs requested) | **Mark Pending** |
| `verified` | Admin confirmed; drives the green **Verified** badge | **Verify** |
| `rejected` | Admin declined; reason saved as an `admin_note` | **Reject** (prompts for reason) |

- `setCompanyVerification(companyId, status, { reason, adminEmail })` (in
  `src/lib/db/admin.ts`) updates the status, stamps `verified_at` + `verified_by`
  (the admin), keeps the legacy `verified` boolean in sync (`true` only when
  `verified`), and writes an admin note on reject.
- The **Verified badge** across the site is driven by `verification_status === 'verified'`
  when Supabase data is present, falling back to the legacy `verified` boolean for
  mock data. This is handled in the data layer (admin company mapping sets
  `verified` from `verification_status`) and `CompanyProfileView` accepts an
  optional `verificationStatus` — so no card restyling was needed.
- Verification is **separate** from Approve/Suspend moderation: a company can be
  Approved but still `unverified`, or `verified` yet later Suspended.
- Verification is **companies-only** for now; listings can adopt the same enum
  later without schema churn.

---

## 7. Key files

| File | Purpose |
| --- | --- |
| `schema.sql` | Full consolidated schema (base + admin expansion), RLS, triggers, storage |
| `supabase/migrations/0001_init.sql` | Base schema migration |
| `supabase/migrations/0002_admin_expansion.sql` | Admin panel migration (roles, notes, reports, flags) |
| `supabase/migrations/0003_verification.sql` | Company verification migration (status enum + verified_at/by) |
| `src/lib/supabase/{config,client,server,admin,storage}.ts` | Guarded clients + storage helpers |
| `src/lib/db/*.ts` | DB helpers (companies, listings, profiles, social, messages, notifications, intake, auth, admin) |
| `src/lib/db/admin.ts` | Service-role admin helpers (users/companies/listings/reports/threads/stats/notes/convert) |
| `src/lib/adminData.ts` | Mock fallback data + admin types |
| `src/components/admin/AdminPanel.tsx` | The admin UI (tabular, searchable, 8 tabs) |
| `src/app/api/admin/*` | Service-role admin read/moderation routes (gated by `ADMIN_EMAILS`) |
