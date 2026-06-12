"use client";

// ──────────────────────────────────────────────────────────────────────────────
// Real Supabase READ helpers (client-safe, anon key + RLS).
//
// Each function returns `null` when Supabase is not configured (or the user
// isn't signed in where required) so callers fall back to the existing mock
// data. Rows are mapped into the SAME UI shapes the pages already render, so the
// component markup/props are untouched.
// ──────────────────────────────────────────────────────────────────────────────

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { resolveCurrentUserId } from "./client-helpers";
import type { Listing } from "@/lib/mockListings";
import type { MyBusinessListing, ListingStatus } from "@/lib/myBusinessListings";

type Row = Record<string, unknown>;

const s = (v: unknown): string => (v == null ? "" : String(v));
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

/** Relative "x days ago" label from an ISO timestamp (mirrors mock `posted`). */
function relativeTime(iso: unknown): string {
  const t = typeof iso === "string" ? new Date(iso).getTime() : NaN;
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const day = 86_400_000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

function asAvailability(v: unknown): Listing["availabilityStatus"] {
  return v === "expiring" || v === "expired" ? v : "available";
}

/** Map a joined listing row (+ embedded company) into the `Listing` UI shape. */
function mapListing(l: Row): Listing {
  const company = (l.company ?? l.companies) as Row | null;
  const companyName = s(company?.name);
  return {
    id: s(l.id),
    company: companyName,
    location: s(l.location),
    industry: s(l.industry),
    subcategory: s(l.subcategory),
    type: l.type === "need" ? "need" : "offer",
    title: s(l.title),
    capability: s(l.capability),
    capacity: s(l.capacity),
    leadTime: s(l.lead_time),
    moq: s(l.moq),
    moqLabel: l.moq_label ? s(l.moq_label) : undefined,
    availableFrom: s(l.available_from),
    availableUntil: s(l.available_until),
    teamSize: s(l.team_size),
    certifications: arr(l.certifications),
    tags: arr(l.tags),
    products: arr(l.products),
    industriesServed: arr(l.industries_served),
    equipment: s(l.equipment),
    equipmentLabel: l.equipment_label ? s(l.equipment_label) : undefined,
    opportunityTags: arr(l.opportunity_tags),
    availabilityStatus: asAvailability(l.availability_status),
    categoryLabel: s(l.category_label) || s(l.industry),
    posted: relativeTime(l.posted_at ?? l.created_at),
    verified: Boolean(l.verified ?? company?.verified),
    logoColor: s(company?.logo_color) || "bg-blue-700 text-white",
    logoLetter: (companyName[0] ?? "C").toUpperCase(),
    coverColor: s(company?.cover_gradient) || "bg-gradient-to-r from-blue-600 to-blue-800",
    photoBg: "",
    photoLabel: "",
  };
}

const LISTING_SELECT =
  "*, company:companies(name, slug, logo_color, cover_gradient, verified, verification_status)";

/** Approved listings of a given type for the public directories (/i-offer, /i-need). */
export async function fetchListingsByType(type: "offer" | "need"): Promise<Listing[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("type", type)
    .order("posted_at", { ascending: false });
  if (error || !data) return null;
  return (data as Row[]).map(mapListing);
}

function statusFromRow(l: Row): ListingStatus {
  const avail = s(l.availability_status);
  if (avail === "expired" || l.status === "Suspended") return "expired";
  if (avail === "expiring") return "expiring";
  return "active";
}

function fmtDate(v: unknown): string {
  const t = typeof v === "string" ? new Date(v) : null;
  if (!t || Number.isNaN(t.getTime())) return "";
  return t.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Listings owned by the current user's company (/my-business/listings). */
export async function fetchMyBusinessListings(): Promise<MyBusinessListing[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;

  const { data: companies } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", userId);
  const companyIds = (companies as Row[] | null)?.map((c) => s(c.id)) ?? [];
  if (companyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("company_id", companyIds)
    .order("posted_at", { ascending: false });
  if (error || !data) return null;

  return (data as Row[]).map((l) => ({
    id: s(l.id),
    listingId: `#${s(l.type).slice(0, 3).toUpperCase()}-${s(l.id).slice(0, 4)}`,
    title: s(l.title),
    type: l.type === "need" ? "need" : "offer",
    status: statusFromRow(l),
    industry: s(l.industry),
    subcategory: s(l.subcategory),
    location: s(l.location),
    tags: arr(l.tags),
    views: Number(l.views ?? 0),
    connections: Number(l.connections_count ?? 0),
    messages: Number(l.messages_count ?? 0),
    listedDate: fmtDate(l.posted_at ?? l.created_at),
    expiresDate: fmtDate(l.expires_at) || "—",
    photoBg: "",
    photoLabel: "",
  }));
}

// ── Network: companies + the current user's saved/followed sets ────────────────

export interface NetworkData {
  companies: Row[];
  savedCompanyIds: string[];
  followedCompanyIds: string[];
  savedListings: Row[];
}

/** Raw network data for /my-network (mapping to the page's shape is done there). */
export async function fetchNetworkData(): Promise<NetworkData | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);

  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .eq("status", "Approved")
    .order("created_at", { ascending: false });
  if (error || !companies) return null;

  let savedCompanyIds: string[] = [];
  let followedCompanyIds: string[] = [];
  let savedListings: Row[] = [];
  if (userId) {
    const [{ data: saved }, { data: follows }, { data: savedL }] = await Promise.all([
      supabase.from("saved_companies").select("company_id").eq("user_id", userId),
      supabase.from("follows").select("company_id").eq("follower_user_id", userId),
      supabase
        .from("saved_listings")
        .select("listing_id, listings(id, title, type, industry, availability_status, company_id, companies(name))")
        .eq("user_id", userId),
    ]);
    savedCompanyIds = (saved as Row[] | null)?.map((r) => s(r.company_id)) ?? [];
    followedCompanyIds = (follows as Row[] | null)?.map((r) => s(r.company_id)) ?? [];
    savedListings = (savedL as Row[] | null) ?? [];
  }

  return {
    companies: companies as Row[],
    savedCompanyIds,
    followedCompanyIds,
    savedListings,
  };
}

// ── Messages: threads the user participates in + per-thread messages ───────────

export interface ThreadSummary {
  id: string;
  companyId: string;
  company: string;
  subject: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface ThreadMessage {
  from: "me" | "them";
  text: string;
  time: string;
  file?: { name: string; size: string };
}

export async function fetchMyThreads(): Promise<ThreadSummary[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;

  const { data: threads, error } = await supabase
    .from("message_threads")
    .select("id, subject, company_id, last_message_at, companies(name)")
    .order("last_message_at", { ascending: false });
  if (error || !threads) return null;

  const result: ThreadSummary[] = [];
  for (const t of threads as Row[]) {
    const company = t.companies as Row | null;
    const { data: last } = await supabase
      .from("messages")
      .select("body, created_at, read, sender_user_id")
      .eq("thread_id", t.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("thread_id", t.id)
      .eq("read", false)
      .neq("sender_user_id", userId);
    result.push({
      id: s(t.id),
      companyId: s(t.company_id),
      company: s(company?.name) || s(t.subject) || "Conversation",
      subject: s(t.subject),
      lastMessage: s((last as Row | null)?.body),
      time: relativeTime(t.last_message_at),
      unread: count ?? 0,
    });
  }
  return result;
}

export async function fetchThreadMessages(threadId: string): Promise<ThreadMessage[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;

  const { data, error } = await supabase
    .from("messages")
    .select("body, attachment_name, sender_user_id, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error || !data) return null;

  return (data as Row[]).map((m) => ({
    from: s(m.sender_user_id) === userId ? "me" : "them",
    text: s(m.body),
    time: fmtDate(m.created_at),
    file: m.attachment_name ? { name: s(m.attachment_name), size: "" } : undefined,
  }));
}

// ── Request-form prefill (the signed-in user's company) ────────────────────────

export interface CompanyPrefill {
  name: string;
  website: string;
  location: string;
  industry: string;
  subcategory: string;
  description: string;
}

export async function fetchMyCompanyPrefill(): Promise<CompanyPrefill | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;
  const { data } = await supabase
    .from("companies")
    .select("name, website, location, industry, subcategory, about")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const c = data as Row;
  return {
    name: s(c.name),
    website: s(c.website),
    location: s(c.location),
    industry: s(c.industry),
    subcategory: s(c.subcategory),
    description: s(c.about),
  };
}
