// ──────────────────────────────────────────────────────────────────────────────
// Shared intake submissions store
//
// This is the single source of truth shared between the public intake form
// (/intake) and the admin "Intake Submissions" tab (/admin).
//
// PERSISTENCE:
//   - When Supabase IS configured, submissions are written to the
//     `intake_submissions` table (anon INSERT is allowed by RLS) and the admin
//     panel reads them back via the service-role /api/admin/intake route.
//   - When Supabase is NOT configured, the store falls back to the original
//     localStorage + in-memory behavior so the demo still works offline.
//
// The Supabase write is best-effort and fire-and-forget: the local cache is
// always updated synchronously first (keeping useSyncExternalStore stable and
// the UI instant), then the row is mirrored to Supabase in the background.
//
// On first load (empty localStorage) a small set of seed submissions is written
// so the admin table is never empty in a fresh demo environment.
// ──────────────────────────────────────────────────────────────────────────────

export type SubmissionStatus = "new" | "reviewed" | "archived";
export type ContactMethod = "Email" | "Phone" | "Text / SMS" | "Video Call" | "Any";

export interface IntakeSubmission {
  id: string;
  submittedAt: string; // ISO timestamp
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  industry: string;
  subcategory: string;
  resourcesOffered: string;
  resourcesSought: string;
  capacityDetails: string;
  preferredContact: ContactMethod;
  logoName?: string;
  imageName?: string;
  notes: string;
  adminNote?: string;
  status: SubmissionStatus;
}

const STORAGE_KEY = "capmaxx_intake_submissions";

// Seed data — used the first time the store is read in a fresh browser.
const seedSubmissions: IntakeSubmission[] = [
  {
    id: "seed-1",
    submittedAt: "2026-06-09T14:22:00.000Z",
    companyName: "Lakeside Metalworks",
    contactName: "Dana Reyes",
    email: "dana@lakesidemetal.com",
    phone: "(414) 555-0173",
    website: "lakesidemetal.com",
    location: "Milwaukee, WI, USA",
    industry: "Manufacturing",
    subcategory: "Fabrication",
    resourcesOffered: "Open press brake and laser cutting capacity, roughly 30 hours/week available for overflow work.",
    resourcesSought: "Looking for powder coating partners within 100 miles.",
    capacityDetails: "Two fiber lasers (4kW), 3 press brakes. Can take on short-run and prototype jobs.",
    preferredContact: "Email",
    notes: "Referred by a current member at a trade show.",
    status: "new",
  },
  {
    id: "seed-2",
    submittedAt: "2026-06-10T09:05:00.000Z",
    companyName: "Harbor Cold Logistics",
    contactName: "Marcus Webb",
    email: "mwebb@harborcold.com",
    phone: "(206) 555-0142",
    website: "harborcold.com",
    location: "Tacoma, WA, USA",
    industry: "Logistics",
    subcategory: "Cold Chain",
    resourcesOffered: "1,500 open pallet positions in refrigerated storage plus cross-dock space.",
    resourcesSought: "Regional refrigerated trucking partners for last-mile.",
    capacityDetails: "FDA-registered, -10°F to 38°F zones, 24/7 dock access.",
    preferredContact: "Phone",
    notes: "",
    status: "reviewed",
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRaw(): IntakeSubmission[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as IntakeSubmission[]) : null;
  } catch {
    return null;
  }
}

function writeRaw(submissions: IntakeSubmission[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch {
    // ignore quota / serialization errors in this mock store
  }
}

// In-memory cache so getSnapshot returns a stable reference between renders
// (required for React's useSyncExternalStore). The cache is the source of truth
// on the client; localStorage is kept in sync alongside it.
let cache: IntakeSubmission[] | null = null;
const listeners = new Set<() => void>();

function ensureCache(): IntakeSubmission[] {
  if (cache) return cache;
  const existing = readRaw();
  if (existing === null) {
    writeRaw(seedSubmissions);
    cache = [...seedSubmissions];
  } else {
    cache = existing;
  }
  return cache;
}

function commit(next: IntakeSubmission[]): IntakeSubmission[] {
  cache = next;
  writeRaw(next);
  listeners.forEach((l) => l());
  return next;
}

/** Subscribe to store changes — wired to React's useSyncExternalStore. */
export function subscribeSubmissions(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Stable client snapshot for useSyncExternalStore. */
export function getSubmissions(): IntakeSubmission[] {
  if (!isBrowser()) return seedSubmissions;
  return ensureCache();
}

/** Stable server snapshot for useSyncExternalStore (constant reference). */
export function getServerSubmissions(): IntakeSubmission[] {
  return seedSubmissions;
}

export type NewSubmissionInput = Omit<IntakeSubmission, "id" | "submittedAt" | "status">;

/**
 * Appends a new submission to the shared store and returns the created record.
 */
export function addSubmission(input: NewSubmissionInput): IntakeSubmission {
  const submission: IntakeSubmission = {
    ...input,
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    submittedAt: new Date().toISOString(),
    status: "new",
  };
  commit([submission, ...ensureCache()]);
  // Best-effort mirror to Supabase (no-op + warns when unconfigured).
  void mirrorInsertToSupabase(input);
  return submission;
}

// Fire-and-forget Supabase insert. Dynamically imported so the (client-only)
// Supabase helper is never pulled into a server bundle, and any failure is
// swallowed — the local cache already has the row, so the demo is unaffected.
async function mirrorInsertToSupabase(input: NewSubmissionInput): Promise<void> {
  try {
    const { insertIntakeSubmission } = await import("@/lib/db/intake");
    await insertIntakeSubmission({
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      website: input.website,
      location: input.location,
      industry: input.industry,
      subcategory: input.subcategory,
      resourcesOffered: input.resourcesOffered,
      resourcesSought: input.resourcesSought,
      capacityDetails: input.capacityDetails,
      preferredContact: input.preferredContact,
      logoName: input.logoName,
      imageName: input.imageName,
      notes: input.notes,
    });
  } catch {
    // ignore — local store remains the source of truth in the demo
  }
}

/**
 * Maps a Supabase intake_submissions row to the client IntakeSubmission shape.
 * Used by the admin panel when hydrating from the database.
 */
export function mapDbRowToSubmission(row: Record<string, unknown>): IntakeSubmission {
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    id: str(row.id),
    submittedAt: str(row.created_at) || new Date().toISOString(),
    companyName: str(row.company_name),
    contactName: str(row.contact_name),
    email: str(row.email),
    phone: str(row.phone),
    website: str(row.website),
    location: str(row.location),
    industry: str(row.industry),
    subcategory: str(row.subcategory),
    resourcesOffered: str(row.resources_offered),
    resourcesSought: str(row.resources_sought),
    capacityDetails: str(row.capacity_details),
    preferredContact: (str(row.preferred_contact) || "Email") as ContactMethod,
    logoName: str(row.logo_name) || undefined,
    imageName: str(row.image_name) || undefined,
    notes: str(row.notes),
    adminNote: str(row.admin_note) || undefined,
    status: (str(row.status) || "new") as SubmissionStatus,
  };
}

/**
 * Replaces the entire store with server-provided submissions (e.g. fetched from
 * Supabase via the admin route). Notifies useSyncExternalStore subscribers.
 */
export function replaceSubmissions(list: IntakeSubmission[]): IntakeSubmission[] {
  return commit(list);
}

/**
 * Updates the status of a submission (used by the admin panel).
 */
export function updateSubmissionStatus(id: string, status: SubmissionStatus): IntakeSubmission[] {
  return commit(ensureCache().map((s) => (s.id === id ? { ...s, status } : s)));
}

/**
 * Sets the internal admin note on a submission (used by the admin panel).
 */
export function updateSubmissionNote(id: string, adminNote: string): IntakeSubmission[] {
  return commit(ensureCache().map((s) => (s.id === id ? { ...s, adminNote } : s)));
}

/**
 * Removes a submission from the store (used by the admin panel).
 */
export function deleteSubmission(id: string): IntakeSubmission[] {
  return commit(ensureCache().filter((s) => s.id !== id));
}

export const contactMethods: ContactMethod[] = ["Email", "Phone", "Text / SMS", "Video Call", "Any"];
