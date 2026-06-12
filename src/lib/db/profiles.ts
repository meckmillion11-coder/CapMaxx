"use client";

// company_profiles helpers (extended profile + preferences). Client-safe with
// graceful fallback.

import {
  getSupabaseBrowserClient,
  notConfigured,
  type DbResult,
} from "./client-helpers";
import { getCurrentUserCompany } from "./companies";

export interface CompanyProfileRow {
  id: string;
  company_id: string;
  markets_served?: unknown;
  certifications?: unknown;
  documents?: unknown;
  preferences?: Record<string, unknown>;
  completion?: number;
}

/** Upsert the extended profile row for the current user's company. */
export async function saveCompanyProfile(
  patch: Partial<Omit<CompanyProfileRow, "id" | "company_id">>,
): Promise<DbResult<CompanyProfileRow>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<CompanyProfileRow>();
  const company = await getCurrentUserCompany();
  if (!company) return { ok: false, configured: true, error: "no company for current user" };

  const { data, error } = await supabase
    .from("company_profiles")
    .upsert({ company_id: company.id, ...patch }, { onConflict: "company_id" })
    .select("*")
    .single();
  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true, data: data as CompanyProfileRow };
}

/** Save business preferences (Preferences page). */
export function savePreferences(
  preferences: Record<string, unknown>,
): Promise<DbResult<CompanyProfileRow>> {
  return saveCompanyProfile({ preferences });
}
