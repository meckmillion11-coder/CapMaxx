"use client";

// Listing data helpers (client-safe, anon key + RLS). Graceful fallback: no-ops
// when Supabase is not configured.

import {
  getSupabaseBrowserClient,
  notConfigured,
  type DbResult,
} from "./client-helpers";
import { getCurrentUserCompany } from "./companies";
import type { DbListing } from "./types";

/** Create a listing for the current user's company. */
export async function createListing(
  input: Partial<DbListing> & { title: string; type: "offer" | "need" },
): Promise<DbResult<DbListing>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<DbListing>();
  const company = await getCurrentUserCompany();
  if (!company) return { ok: false, configured: true, error: "no company for current user" };

  const { data, error } = await supabase
    .from("listings")
    .insert({ ...input, company_id: company.id })
    .select("*")
    .single();
  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true, data: data as DbListing };
}

export async function updateListing(
  id: string,
  patch: Partial<DbListing>,
): Promise<DbResult<DbListing>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<DbListing>();
  const { data, error } = await supabase
    .from("listings")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true, data: data as DbListing };
}

/** Close a listing (mark expired). */
export function closeListing(id: string): Promise<DbResult<DbListing>> {
  return updateListing(id, { availability_status: "expired", status: "Suspended" });
}

/** Renew a listing (mark active again). */
export function renewListing(id: string): Promise<DbResult<DbListing>> {
  return updateListing(id, { availability_status: "available", status: "Approved" });
}

export async function deleteListing(id: string): Promise<DbResult<null>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<null>();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true, data: null };
}
