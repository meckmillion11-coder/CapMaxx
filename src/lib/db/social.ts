"use client";

// Saves / follows / connections helpers (per-user rows, RLS-protected).
// Client-safe with graceful fallback (no-op when unconfigured).

import {
  getSupabaseBrowserClient,
  resolveCurrentUserId,
  notConfigured,
  type DbResult,
} from "./client-helpers";

async function ctx() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;
  return { supabase, userId };
}

/** Toggle a saved company. `saved` = desired end state. */
export async function setSavedCompany(companyId: string, saved: boolean): Promise<DbResult<null>> {
  const c = await ctx();
  if (!c) return notConfigured<null>();
  if (saved) {
    const { error } = await c.supabase
      .from("saved_companies")
      .upsert({ user_id: c.userId, company_id: companyId }, { onConflict: "user_id,company_id" });
    if (error) return { ok: false, configured: true, error: error.message };
  } else {
    const { error } = await c.supabase
      .from("saved_companies")
      .delete()
      .eq("user_id", c.userId)
      .eq("company_id", companyId);
    if (error) return { ok: false, configured: true, error: error.message };
  }
  return { ok: true, configured: true, data: null };
}

/** Toggle a saved listing. */
export async function setSavedListing(listingId: string, saved: boolean): Promise<DbResult<null>> {
  const c = await ctx();
  if (!c) return notConfigured<null>();
  if (saved) {
    const { error } = await c.supabase
      .from("saved_listings")
      .upsert({ user_id: c.userId, listing_id: listingId }, { onConflict: "user_id,listing_id" });
    if (error) return { ok: false, configured: true, error: error.message };
  } else {
    const { error } = await c.supabase
      .from("saved_listings")
      .delete()
      .eq("user_id", c.userId)
      .eq("listing_id", listingId);
    if (error) return { ok: false, configured: true, error: error.message };
  }
  return { ok: true, configured: true, data: null };
}

/** Toggle following a company. */
export async function setFollowCompany(companyId: string, following: boolean): Promise<DbResult<null>> {
  const c = await ctx();
  if (!c) return notConfigured<null>();
  if (following) {
    const { error } = await c.supabase
      .from("follows")
      .upsert({ follower_user_id: c.userId, company_id: companyId }, { onConflict: "follower_user_id,company_id" });
    if (error) return { ok: false, configured: true, error: error.message };
  } else {
    const { error } = await c.supabase
      .from("follows")
      .delete()
      .eq("follower_user_id", c.userId)
      .eq("company_id", companyId);
    if (error) return { ok: false, configured: true, error: error.message };
  }
  return { ok: true, configured: true, data: null };
}

/** Request a connection to a company. */
export async function requestConnection(companyId: string): Promise<DbResult<null>> {
  const c = await ctx();
  if (!c) return notConfigured<null>();
  const { error } = await c.supabase
    .from("connections")
    .insert({ requester_user_id: c.userId, addressee_company_id: companyId, status: "pending" });
  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true, data: null };
}

/**
 * Resolve a company by slug, then request a connection. Used by the public
 * company profile (which only knows the slug). No-ops gracefully when Supabase
 * is unconfigured or the company can't be found.
 */
export async function requestConnectionBySlug(slug: string): Promise<DbResult<null>> {
  const c = await ctx();
  if (!c) return notConfigured<null>();
  const { data } = await c.supabase.from("companies").select("id").eq("slug", slug).maybeSingle();
  const companyId = (data?.id as string) ?? null;
  if (!companyId) return { ok: false, configured: true, error: "company not found" };
  return requestConnection(companyId);
}
