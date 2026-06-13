import "server-only";

// Admin data helpers (SERVER-ONLY, service-role, bypasses RLS). Used by the
// /api/admin/* route handlers behind the ADMIN_EMAILS gate. Returns null when
// the service-role client is not configured so callers fall back to mock data.

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export function adminConfigured(): boolean {
  return isSupabaseAdminConfigured();
}

/** Seed/sync admin_users from the ADMIN_EMAILS env var so is_admin() works. */
export async function seedAdminUsers(): Promise<{ ok: boolean; count: number }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false, count: 0 };
  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (emails.length === 0) return { ok: true, count: 0 };
  const { error } = await supabase
    .from("admin_users")
    .upsert(emails.map((email) => ({ email })), { onConflict: "email" });
  return { ok: !error, count: emails.length };
}

export async function fetchUsers() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchCompanies() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchListings() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchIntakeSubmissions() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("intake_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Lightweight message metadata for the admin overview. */
export async function fetchMessagesMeta() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("messages")
    .select("id, thread_id, sender_user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function setUserStatus(id: string, status: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("users").update({ status }).eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function setCompanyStatus(id: string, status: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("companies").update({ status }).eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function deleteCompany(id: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("companies").delete().eq("id", id);
  return { ok: !error, error: error?.message };
}

/**
 * Manual admin verification for a company. Sets verification_status and stamps
 * verified_at/verified_by. On reject (with a reason) it also records an
 * admin_note so the rationale is captured. Also keeps the legacy `verified`
 * boolean in sync (true only when status === 'verified').
 */
export async function setCompanyVerification(
  companyId: string,
  status: "unverified" | "pending" | "verified" | "rejected",
  opts?: { reason?: string; adminEmail?: string },
) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };

  let adminId: string | null = null;
  if (opts?.adminEmail) {
    const { data } = await supabase.from("users").select("id").eq("email", opts.adminEmail).maybeSingle();
    adminId = (data?.id as string) ?? null;
  }

  const isVerified = status === "verified";
  const { error } = await supabase
    .from("companies")
    .update({
      verification_status: status,
      verified: isVerified,
      verified_at: isVerified ? new Date().toISOString() : null,
      verified_by: status === "unverified" ? null : adminId,
    })
    .eq("id", companyId);

  if (!error && status === "rejected" && opts?.reason) {
    await addAdminNote({
      authorEmail: opts.adminEmail,
      targetType: "company",
      targetId: companyId,
      body: `Verification rejected: ${opts.reason}`,
    });
  }
  return { ok: !error, error: error?.message };
}

export async function setListingStatus(id: string, status: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function deleteListing(id: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("listings").delete().eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function setIntakeStatus(id: string, status: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("intake_submissions").update({ status }).eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function deleteIntakeSubmission(id: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("intake_submissions").delete().eq("id", id);
  return { ok: !error, error: error?.message };
}

/** Set/clear the internal admin note on an intake submission. */
export async function setIntakeNote(id: string, note: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("intake_submissions").update({ admin_note: note }).eq("id", id);
  return { ok: !error, error: error?.message };
}

/**
 * Full conversion: company + profile + listing(s) from intake data.
 */
export async function convertIntakeToCompany(id: string, adminEmail?: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false, error: "not configured" };

  const { data: sub, error: subErr } = await supabase.from("intake_submissions").select("*").eq("id", id).single();
  if (subErr || !sub) return { ok: false, error: subErr?.message ?? "not found" };

  const s = sub as Record<string, unknown>;
  const str = (v: unknown) => (v == null ? "" : String(v));
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

  const name = str(s.company_name);
  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  const slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;
  const caps = arr(s.resource_categories).concat(arr(s.industries_served));
  const purpose = str(s.purpose) || "offer";

  const { data: company, error: compErr } = await supabase
    .from("companies")
    .insert({
      name,
      slug,
      location: str(s.location),
      industry: str(s.industry),
      subcategory: str(s.subcategory),
      email: str(s.email),
      phone: str(s.phone),
      website: str(s.website),
      about: str(s.resources_offered) || str(s.listing_description),
      about_extended: str(s.listing_description),
      capabilities: caps.length ? caps : arr(s.resource_categories),
      tags: arr(s.industries_served),
      logo_url: str(s.logo_url) || null,
      logo_initials: (name[0] ?? "C").toUpperCase(),
      logo_color: "bg-blue-700 text-white",
      cover_gradient: "from-blue-600 to-blue-800",
      status: "Approved",
      verified: false,
      verification_status: "pending",
    })
    .select("id")
    .single();

  if (compErr || !company) return { ok: false, error: compErr?.message ?? "company insert failed" };
  const companyId = company.id as string;

  const certs = str(s.certifications)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  await supabase.from("company_profiles").insert({
    company_id: companyId,
    certifications: certs,
    completion: 40,
  });

  await supabase.from("company_contacts").insert({
    company_id: companyId,
    name: str(s.contact_name),
    email: str(s.email),
    phone: str(s.phone),
    is_primary: true,
  });

  const listingIds: string[] = [];
  const baseListing = {
    company_id: companyId,
    title: str(s.listing_title) || name,
    capability: str(s.listing_title) || str(s.industry),
    industry: str(s.industry),
    subcategory: str(s.subcategory),
    location: str(s.location),
    capacity: str(s.capacity_info) || str(s.capacity_details),
    lead_time: str(s.lead_time),
    moq: str(s.moq),
    team_size: str(s.team_size),
    equipment: str(s.equipment_details),
    equipment_label: "Equipment",
    category_label: str(s.industry) || "Resource",
    certifications: certs,
    tags: arr(s.resource_categories).length ? arr(s.resource_categories) : caps.slice(0, 6),
    opportunity_tags: arr(s.resource_categories),
    industries_served: arr(s.industries_served),
    availability_status: "available",
    status: "Approved",
    verified: false,
  };

  const createListing = async (type: "offer" | "need") => {
    const { data: listing } = await supabase
      .from("listings")
      .insert({ ...baseListing, type })
      .select("id")
      .single();
    if (listing?.id) listingIds.push(String(listing.id));
  };

  if (purpose === "both") {
    await createListing("offer");
    await createListing("need");
  } else {
    await createListing(purpose === "need" ? "need" : "offer");
  }

  if (str(s.image_url)) {
    await supabase.from("company_media").insert({
      company_id: companyId,
      kind: "gallery",
      url: str(s.image_url),
      title: str(s.listing_title) || "Primary image",
    });
  }

  await supabase
    .from("intake_submissions")
    .update({
      company_id: companyId,
      status: "converted",
      converted_at: new Date().toISOString(),
      converted_listing_ids: listingIds,
    })
    .eq("id", id);

  await logIntakeStatus(id, "converted", adminEmail, `Converted to company ${companyId}`);

  return { ok: true, companyId, listingIds };
}

export async function updateIntakeSubmission(id: string, patch: Record<string, unknown>) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("intake_submissions").update(patch).eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function logIntakeStatus(submissionId: string, status: string, changedBy?: string, note?: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("intake_status").insert({
    submission_id: submissionId,
    status,
    changed_by: changedBy ?? null,
    note: note ?? null,
  });
  return { ok: !error, error: error?.message };
}

export async function fetchIntakeFormConfig() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("intake_form_config").select("config").limit(1).maybeSingle();
  return (data?.config as Record<string, unknown>) ?? null;
}

export async function saveIntakeFormConfig(config: Record<string, unknown>, updatedBy?: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const { data: existing } = await supabase.from("intake_form_config").select("id").limit(1).maybeSingle();
  if (existing?.id) {
    const { error } = await supabase
      .from("intake_form_config")
      .update({ config, updated_by: updatedBy ?? null, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    return { ok: !error, error: error?.message };
  }
  const { error } = await supabase.from("intake_form_config").insert({ config, updated_by: updatedBy ?? null });
  return { ok: !error, error: error?.message };
}

export async function insertPublicIntakeSubmission(row: Record<string, unknown>) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false, error: "not configured" };
  const { data, error } = await supabase.from("intake_submissions").insert(row).select("id").single();
  if (error) return { ok: false, error: error.message };
  const id = String(data.id);
  await logIntakeStatus(id, "new", undefined, "Public intake submission");
  return { ok: true, id };
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function fetchReportedCompanies() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("reported_companies")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchReportedListings() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("reported_listings")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function setReportStatus(kind: "company" | "listing", id: string, status: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const table = kind === "company" ? "reported_companies" : "reported_listings";
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  return { ok: !error, error: error?.message };
}

/**
 * "Remove content" for a report: suspends the offending company/listing and
 * marks the report as removed. Suspending (not hard-deleting) keeps an audit
 * trail and is reversible from the Companies/Listings tabs.
 */
export async function removeReportedContent(kind: "company" | "listing", reportId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };
  const table = kind === "company" ? "reported_companies" : "reported_listings";
  const { data: report } = await supabase.from(table).select("target_id").eq("id", reportId).single();
  if (!report?.target_id) return { ok: false, error: "report not found" };

  const targetTable = kind === "company" ? "companies" : "listings";
  const { error: targetErr } = await supabase
    .from(targetTable)
    .update({ status: "Suspended" })
    .eq("id", report.target_id);
  const { error: repErr } = await supabase.from(table).update({ status: "removed" }).eq("id", reportId);
  return { ok: !targetErr && !repErr, error: targetErr?.message ?? repErr?.message };
}

// ── Messages metadata (bodies gated behind the per-thread `flagged` flag) ──────

export async function fetchThreadsMeta() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data: threads } = await supabase
    .from("message_threads")
    .select("id, subject, company_id, participant_user_ids, last_message_at, flagged, created_at")
    .order("last_message_at", { ascending: false })
    .limit(200);
  if (!threads) return [];

  // One bulk fetch of lightweight message rows to derive per-thread counts.
  const { data: msgRows } = await supabase
    .from("messages")
    .select("id, thread_id")
    .limit(5000);
  const countByThread = new Map<string, number>();
  (msgRows ?? []).forEach((m) => {
    const tid = String(m.thread_id);
    countByThread.set(tid, (countByThread.get(tid) ?? 0) + 1);
  });

  // SECURITY: only fetch message bodies for threads explicitly flagged for
  // abuse/report review. Non-flagged threads expose metadata only.
  const result = [];
  for (const t of threads) {
    let bodies: { id: string; sender_user_id: string; body: string; created_at: string }[] | undefined;
    if (t.flagged) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_user_id, body, created_at")
        .eq("thread_id", t.id)
        .order("created_at", { ascending: true });
      bodies = (msgs ?? []) as typeof bodies;
    }
    result.push({ ...t, message_count: countByThread.get(String(t.id)) ?? 0, bodies });
  }
  return result;
}

// ── Platform stats ─────────────────────────────────────────────────────────────

export async function getPlatformStats() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const head = { count: "exact" as const, head: true };
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [users, companies, listings, offer, need, active, messages, signups, pendingVerification] =
    await Promise.all([
      supabase.from("users").select("id", head),
      supabase.from("companies").select("id", head),
      supabase.from("listings").select("id", head),
      supabase.from("listings").select("id", head).eq("type", "offer"),
      supabase.from("listings").select("id", head).eq("type", "need"),
      supabase.from("listings").select("id", head).eq("availability_status", "available"),
      supabase.from("messages").select("id", head),
      supabase.from("users").select("id", head).gte("created_at", since),
      supabase.from("companies").select("id", head).eq("verification_status", "pending"),
    ]);

  return {
    users: users.count ?? 0,
    companies: companies.count ?? 0,
    listings: listings.count ?? 0,
    offerListings: offer.count ?? 0,
    needListings: need.count ?? 0,
    activeListings: active.count ?? 0,
    messages: messages.count ?? 0,
    newSignups: signups.count ?? 0,
    pendingVerification: pendingVerification.count ?? 0,
  };
}

// ── Admin notes (private internal notes on user/company/listing) ───────────────

export async function fetchAdminNotes() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("admin_notes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  return data ?? [];
}

export async function addAdminNote(input: {
  authorEmail?: string;
  targetType: "user" | "company" | "listing";
  targetId: string;
  body: string;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { ok: false };

  let authorId: string | null = null;
  if (input.authorEmail) {
    const { data } = await supabase.from("users").select("id").eq("email", input.authorEmail).maybeSingle();
    authorId = (data?.id as string) ?? null;
  }

  const { data, error } = await supabase
    .from("admin_notes")
    .insert({
      author_user_id: authorId,
      target_type: input.targetType,
      target_id: input.targetId,
      body: input.body,
    })
    .select("*")
    .single();
  return { ok: !error, error: error?.message, note: data };
}
