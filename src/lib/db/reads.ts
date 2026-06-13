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
import type { CompanyContact } from "@/lib/companyContact";
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

/**
 * Approved listings of a given type for the public directories (/i-offer, /i-need).
 * Returns `null` when Supabase is not configured; otherwise returns an array (possibly empty).
 */
export async function fetchListingsByType(type: "offer" | "need"): Promise<Listing[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("type", type)
    .eq("status", "Approved")
    .order("posted_at", { ascending: false });
  if (error || !data) return [];
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
    opportunityTags: arr(l.opportunity_tags),
    certifications: arr(l.certifications),
    capacity: s(l.capacity),
    leadTime: s(l.lead_time),
    availabilityStatus: asAvailability(l.availability_status),
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
  /** Certifications from company_profiles keyed by company id. */
  profileCertsByCompany: Record<string, string[]>;
  /** Opportunity tags aggregated from approved listings keyed by company id. */
  opportunityTagsByCompany: Record<string, string[]>;
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

  const companyIds = (companies as Row[]).map((c) => s(c.id)).filter(Boolean);

  const [{ data: profiles }, { data: listingRows }] = await Promise.all([
    companyIds.length > 0
      ? supabase.from("company_profiles").select("company_id, certifications").in("company_id", companyIds)
      : Promise.resolve({ data: [] as Row[] }),
    supabase.from("listings").select("company_id, opportunity_tags").eq("status", "Approved"),
  ]);

  const profileCertsByCompany: Record<string, string[]> = {};
  (profiles as Row[] | null)?.forEach((p) => {
    const id = s(p.company_id);
    if (id) profileCertsByCompany[id] = arr(p.certifications);
  });

  const opportunityTagsByCompany: Record<string, string[]> = {};
  (listingRows as Row[] | null)?.forEach((l) => {
    const id = s(l.company_id);
    if (!id) return;
    const existing = new Set(opportunityTagsByCompany[id] ?? []);
    arr(l.opportunity_tags).forEach((tag) => existing.add(tag));
    opportunityTagsByCompany[id] = Array.from(existing);
  });

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
    profileCertsByCompany,
    opportunityTagsByCompany,
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

// ── Profile page (/profile) ───────────────────────────────────────────────────

export interface MyProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  role: string;
  joinedAt: string;
  profileCompletion: number;
  activeListings: number;
  connections: number;
  messages: number;
  profileViews: number;
}

export async function fetchMyProfile(): Promise<MyProfileData | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;

  const { data: auth } = await supabase.auth.getUser();
  const { data: userRow } = await supabase
    .from("users")
    .select("first_name, last_name, email, phone, role, created_at")
    .eq("id", userId)
    .maybeSingle();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let profileCompletion = 0;
  let activeListings = 0;
  if (company?.id) {
    const [{ data: profile }, { count: listingCount }] = await Promise.all([
      supabase.from("company_profiles").select("completion").eq("company_id", company.id).maybeSingle(),
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("company_id", company.id)
        .neq("status", "Suspended"),
    ]);
    profileCompletion = Number((profile as Row | null)?.completion ?? 0);
    activeListings = listingCount ?? 0;
  }

  const u = userRow as Row | null;
  const c = company as Row | null;
  return {
    firstName: s(u?.first_name),
    lastName: s(u?.last_name),
    email: s(u?.email ?? auth.user?.email),
    phone: s(u?.phone),
    companyName: s(c?.name),
    role: s(u?.role) || "Owner",
    joinedAt: fmtDate(u?.created_at ?? c?.created_at),
    profileCompletion,
    activeListings,
    connections: 0,
    messages: 0,
    profileViews: 0,
  };
}

// ── Company profile editor (/my-business/company-profile) ─────────────────────

export interface CompanyProfileFormData {
  name: string;
  tagline: string;
  verified: boolean;
  location: string;
  founded: string;
  employeeRange: string;
  cageCode: string;
  coverLabel: string;
  coverPreview: string | null;
  logoPreview: string | null;
  about: string;
  aboutExtended: string;
  contact: CompanyContact;
  details: {
    industry: string;
    subcategory: string;
    businessType: string;
    naicsCode: string;
    dunsNumber: string;
    taxId: string;
  };
  capabilities: string[];
  tags: string[];
  locations: { name: string; address: string; type: string; contact: string }[];
  certifications: { name: string; description: string }[];
  markets: { country: string; flag: string }[];
  gallery: { label: string; gradient: string; preview?: string }[];
  videos: { title: string; duration: string; gradient: string; preview?: string; url?: string }[];
  documents: { name: string; size: string }[];
}

export async function fetchMyCompanyProfileForm(): Promise<CompanyProfileFormData | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!company) {
    return {
      name: "",
      tagline: "",
      verified: false,
      location: "",
      founded: "",
      employeeRange: "",
      cageCode: "",
      coverLabel: "",
      coverPreview: null,
      logoPreview: null,
      about: "",
      aboutExtended: "",
      contact: {},
      details: {
        industry: "",
        subcategory: "",
        businessType: "",
        naicsCode: "",
        dunsNumber: "",
        taxId: "",
      },
      capabilities: [],
      tags: [],
      locations: [],
      certifications: [],
      markets: [],
      gallery: [],
      videos: [],
      documents: [],
    };
  }

  const c = company as Row;
  const companyId = s(c.id);

  const [{ data: profile }, { data: locs }, { data: media }] = await Promise.all([
    supabase.from("company_profiles").select("*").eq("company_id", companyId).maybeSingle(),
    supabase.from("company_locations").select("*").eq("company_id", companyId).order("created_at"),
    supabase.from("company_media").select("*").eq("company_id", companyId).order("sort_order"),
  ]);

  const p = profile as Row | null;
  const marketsRaw = Array.isArray(p?.markets_served) ? (p!.markets_served as Row[]) : [];
  const certsRaw = Array.isArray(p?.certifications) ? (p!.certifications as Row[]) : [];
  const docsRaw = Array.isArray(p?.documents) ? (p!.documents as Row[]) : [];

  const gallery: CompanyProfileFormData["gallery"] = [];
  const videos: CompanyProfileFormData["videos"] = [];
  const documents: CompanyProfileFormData["documents"] = [...docsRaw.map((d) => ({
    name: s(d.name),
    size: s(d.size),
  }))];

  for (const m of (media as Row[] | null) ?? []) {
    const kind = s(m.kind);
    if (kind === "gallery") {
      gallery.push({
        label: s(m.label) || s(m.title),
        gradient: s(m.gradient) || "from-gray-400 to-gray-600",
        preview: m.url ? s(m.url) : undefined,
      });
    } else if (kind === "video") {
      videos.push({
        title: s(m.title),
        duration: s(m.description),
        gradient: s(m.gradient) || "from-gray-500 to-gray-800",
        preview: m.url ? s(m.url) : undefined,
        url: m.url ? s(m.url) : undefined,
      });
    } else if (kind === "document" && !documents.some((d) => d.name === s(m.title))) {
      documents.push({ name: s(m.title), size: "" });
    }
  }

  return {
    name: s(c.name),
    tagline: s(c.tagline),
    verified: c.verification_status === "verified" || Boolean(c.verified),
    location: s(c.location),
    founded: s(c.founded),
    employeeRange: s(c.employee_range),
    cageCode: s(c.cage_code),
    coverLabel: s(c.cover_label),
    coverPreview: c.cover_url ? s(c.cover_url) : null,
    logoPreview: c.logo_url ? s(c.logo_url) : null,
    about: s(c.about),
    aboutExtended: s(c.about_extended),
    contact: {
      website: s(c.website),
      email: s(c.email),
      phone: s(c.phone),
      linkedin: s(c.linkedin),
      teams: s(c.teams),
      zoom: s(c.zoom),
      meet: s(c.meet),
      calendly: s(c.calendly),
    },
    details: {
      industry: s(c.industry),
      subcategory: s(c.subcategory),
      businessType: s(c.business_type),
      naicsCode: s(c.naics_code),
      dunsNumber: s(c.duns_number),
      taxId: s(c.tax_id),
    },
    capabilities: arr(c.capabilities),
    tags: arr(c.tags),
    locations: ((locs as Row[] | null) ?? []).map((l) => ({
      name: s(l.name),
      address: s(l.address),
      type: s(l.type),
      contact: s(l.contact),
    })),
    certifications: certsRaw.map((cert) => ({
      name: s(cert.name),
      description: s(cert.description),
    })),
    markets: marketsRaw.map((m) => ({
      country: s(m.country),
      flag: s(m.flag),
    })),
    gallery,
    videos,
    documents,
  };
}

// ── My Business dashboard summary ─────────────────────────────────────────────

export interface MyBusinessDashboard {
  companyName: string;
  userName: string;
  unreadMessages: number;
  connectionRequests: number;
  expiringListings: number;
  expiredListings: number;
}

export async function fetchMyBusinessDashboard(): Promise<MyBusinessDashboard | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;

  const { data: userRow } = await supabase
    .from("users")
    .select("full_name, first_name, email")
    .eq("id", userId)
    .maybeSingle();
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const u = userRow as Row | null;
  const userName =
    s(u?.full_name) || s(u?.first_name) || s(u?.email).split("@")[0] || "there";
  const companyName = s((company as Row | null)?.name) || "your company";

  let expiringListings = 0;
  let expiredListings = 0;
  if (company?.id) {
    const { data: listings } = await supabase
      .from("listings")
      .select("availability_status, status")
      .eq("company_id", company.id);
    for (const l of (listings as Row[] | null) ?? []) {
      const avail = s(l.availability_status);
      if (avail === "expiring") expiringListings += 1;
      if (avail === "expired" || l.status === "Suspended") expiredListings += 1;
    }
  }

  let unreadMessages = 0;
  const { data: threads } = await supabase
    .from("message_threads")
    .select("id")
    .order("last_message_at", { ascending: false });
  for (const t of (threads as Row[] | null) ?? []) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("thread_id", t.id)
      .eq("read", false)
      .neq("sender_user_id", userId);
    unreadMessages += count ?? 0;
  }

  return {
    companyName,
    userName,
    unreadMessages,
    connectionRequests: 0,
    expiringListings,
    expiredListings,
  };
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  type: string;
  text: string;
  time: string;
  unread: boolean;
}

export async function fetchMyNotifications(): Promise<NotificationItem[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;
  const { data } = await supabase
    .from("notifications")
    .select("id, type, text, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return ((data as Row[] | null) ?? []).map((n) => ({
    id: s(n.id),
    type: s(n.type) || "view",
    text: s(n.text),
    time: relativeTime(n.created_at),
    unread: !n.read,
  }));
}
