"use client";

// Intake submission helpers (client-safe). The public intake form inserts via
// the anon key — RLS allows anonymous INSERT into intake_submissions. Reading /
// moderating submissions is admin-only and lives in src/lib/db/admin.ts (server)
// + the /api/admin routes.

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notConfigured, type DbResult } from "./client-helpers";
import type { DbIntakeSubmission } from "./types";

export interface IntakeInsertInput {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  location?: string;
  industry?: string;
  subcategory?: string;
  resourcesOffered?: string;
  resourcesSought?: string;
  capacityDetails?: string;
  preferredContact?: string;
  logoName?: string;
  imageName?: string;
  logoUrl?: string;
  imageUrl?: string;
  notes?: string;
}

/** Insert a public intake submission. No-op when Supabase isn't configured. */
export async function insertIntakeSubmission(
  input: IntakeInsertInput,
): Promise<DbResult<DbIntakeSubmission>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<DbIntakeSubmission>();

  const row = {
    company_name: input.companyName,
    contact_name: input.contactName,
    email: input.email,
    phone: input.phone ?? null,
    website: input.website ?? null,
    location: input.location ?? null,
    industry: input.industry ?? null,
    subcategory: input.subcategory ?? null,
    resources_offered: input.resourcesOffered ?? null,
    resources_sought: input.resourcesSought ?? null,
    capacity_details: input.capacityDetails ?? null,
    preferred_contact: input.preferredContact ?? "Email",
    logo_name: input.logoName ?? null,
    image_name: input.imageName ?? null,
    logo_url: input.logoUrl ?? null,
    image_url: input.imageUrl ?? null,
    notes: input.notes ?? null,
    status: "new",
  };

  const { data, error } = await supabase
    .from("intake_submissions")
    .insert(row)
    .select("*")
    .single();
  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true, data: data as DbIntakeSubmission };
}
