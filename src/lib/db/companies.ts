"use client";

// Company data helpers (client-safe, anon key + RLS). Every function no-ops
// gracefully (returns notConfigured / null) when Supabase isn't configured so
// the demo UI keeps working with mock data.

import {
  getSupabaseBrowserClient,
  resolveCurrentUserId,
  notConfigured,
  type DbResult,
} from "./client-helpers";
import type { DbCompany } from "./types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Resolve the company owned by the currently signed-in user, if any. */
export async function getCurrentUserCompany(): Promise<DbCompany | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as DbCompany) ?? null;
}

export async function getCompanyBySlug(slug: string): Promise<DbCompany | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase.from("companies").select("*").eq("slug", slug).maybeSingle();
  return (data as DbCompany) ?? null;
}

/**
 * Create the current user's company (used at sign-up). Returns notConfigured
 * when Supabase is absent so the caller can fall back to the demo flow.
 */
export async function createCompanyForCurrentUser(
  input: Partial<DbCompany> & { name: string },
): Promise<DbResult<DbCompany>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<DbCompany>();
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return { ok: false, configured: true, error: "not signed in" };

  const { data, error } = await supabase
    .from("companies")
    .insert({ ...input, owner_id: userId, slug: input.slug ?? slugify(input.name) })
    .select("*")
    .single();

  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true, data: data as DbCompany };
}

/** Upsert the current user's company profile fields (company profile save). */
export async function saveCurrentUserCompany(
  patch: Partial<DbCompany>,
): Promise<DbResult<DbCompany>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<DbCompany>();
  const existing = await getCurrentUserCompany();
  if (existing) {
    const { data, error } = await supabase
      .from("companies")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) return { ok: false, configured: true, error: error.message };
    return { ok: true, configured: true, data: data as DbCompany };
  }
  if (!patch.name) return { ok: false, configured: true, error: "missing company name" };
  return createCompanyForCurrentUser({ ...patch, name: patch.name });
}

/** Persist a logo / cover URL on the current user's company. */
export async function setCompanyImage(
  field: "logo_url" | "cover_url",
  url: string,
): Promise<DbResult<DbCompany>> {
  return saveCurrentUserCompany({ [field]: url } as Partial<DbCompany>);
}
