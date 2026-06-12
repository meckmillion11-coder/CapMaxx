import "server-only";

// ──────────────────────────────────────────────────────────────────────────────
// Server-side company profile read for the public profile page (/company/[slug]).
//
// Returns null when Supabase is unconfigured or the company isn't found, so the
// page falls back to the existing mock profile. Maps the DB row (+ embedded
// locations/contacts/profile) into the rich CompanyProfile UI shape.
// ──────────────────────────────────────────────────────────────────────────────

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CompanyProfile,
  CompanyLocation,
  CompanyCertification,
  CompanyMarket,
} from "@/lib/mockCompanies";
import type { CompanyContact } from "@/lib/companyContact";

type Row = Record<string, unknown>;
const s = (v: unknown): string => (v == null ? "" : String(v));

function asLocationType(v: unknown): CompanyLocation["type"] {
  return v === "Plant" || v === "Office" || v === "Warehouse" ? v : "Headquarters";
}

export async function getCompanyProfileBySlugServer(
  slug: string,
): Promise<CompanyProfile | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("companies")
    .select(
      "*, company_locations(name,address,type,contact), company_contacts(name,position,phone,email,linkedin,is_primary), company_profiles(markets_served,certifications)",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;

  const row = data as Row;
  const name = s(row.name);
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "C";

  const primaryContact =
    (Array.isArray(row.company_contacts)
      ? (row.company_contacts as Row[]).find((c) => c.is_primary) ?? (row.company_contacts as Row[])[0]
      : null) ?? null;

  const contact: CompanyContact = {
    website: s(row.website) || undefined,
    email: s(row.email) || s(primaryContact?.email) || undefined,
    phone: s(row.phone) || s(primaryContact?.phone) || undefined,
    linkedin: s(row.linkedin) || s(primaryContact?.linkedin) || undefined,
    teams: s(row.teams) || undefined,
    zoom: s(row.zoom) || undefined,
    meet: s(row.meet) || undefined,
    calendly: s(row.calendly) || undefined,
  };

  const locations: CompanyLocation[] = Array.isArray(row.company_locations)
    ? (row.company_locations as Row[]).map((l) => ({
        name: s(l.name),
        address: s(l.address),
        type: asLocationType(l.type),
        contact: s(l.contact),
      }))
    : [];

  const profileRow = Array.isArray(row.company_profiles)
    ? (row.company_profiles as Row[])[0]
    : (row.company_profiles as Row | null);

  const certifications: CompanyCertification[] = Array.isArray(profileRow?.certifications)
    ? (profileRow!.certifications as Row[]).map((c) => ({
        name: s(c.name),
        description: s(c.description),
      }))
    : [];

  const marketsServed: CompanyMarket[] = Array.isArray(profileRow?.markets_served)
    ? (profileRow!.markets_served as Row[]).map((m) => ({
        country: s(m.country),
        flag: s(m.flag),
      }))
    : [];

  const verificationStatus = row.verification_status as CompanyProfile["verificationStatus"];

  return {
    slug: s(row.slug) || slug,
    name,
    tagline: s(row.tagline),
    verified: verificationStatus ? verificationStatus === "verified" : Boolean(row.verified),
    verificationStatus,
    location: s(row.location),
    founded: s(row.founded),
    employeeRange: s(row.employee_range),
    cageCode: s(row.cage_code),
    logoInitials: s(row.logo_initials) || initials,
    logoColor: s(row.logo_color) || "bg-blue-700 text-white",
    coverGradient: s(row.cover_gradient) || "from-slate-600 via-slate-700 to-gray-900",
    coverLabel: s(row.cover_label),
    about: s(row.about),
    aboutExtended: s(row.about_extended),
    contact,
    details: {
      industry: s(row.industry),
      subcategory: s(row.subcategory),
      businessType: s(row.business_type),
      naicsCode: s(row.naics_code),
      dunsNumber: s(row.duns_number),
      taxId: s(row.tax_id),
    },
    capabilities: Array.isArray(row.capabilities) ? (row.capabilities as unknown[]).map(String) : [],
    locations,
    gallery: [],
    certifications,
    tags: Array.isArray(row.tags) ? (row.tags as unknown[]).map(String) : [],
    marketsServed,
    videos: [],
    documents: [],
  };
}
