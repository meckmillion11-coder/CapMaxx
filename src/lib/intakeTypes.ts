export type SubmissionStatus = "new" | "reviewed" | "approved" | "archived" | "converted";

export type IntakePurpose = "offer" | "need" | "both";

export interface IntakeSubmission {
  id: string;
  submittedAt: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  industry: string;
  subcategory: string;
  purpose: IntakePurpose | "";
  listingTitle: string;
  listingDescription: string;
  resourceCategories: string[];
  resourcesOffered: string;
  resourcesSought: string;
  capacityDetails: string;
  moq: string;
  leadTime: string;
  certifications: string;
  teamSize: string;
  capacityInfo: string;
  serviceArea: string;
  equipmentDetails: string;
  industriesServed: string[];
  availabilityNotes: string;
  videoUrls: string[];
  additionalNotes: string;
  preferredContact: string;
  logoName?: string;
  imageName?: string;
  logoUrl?: string;
  imageUrl?: string;
  notes: string;
  adminNote?: string;
  status: SubmissionStatus;
  companyId?: string;
}

export type NewSubmissionInput = Omit<IntakeSubmission, "id" | "submittedAt" | "status">;

const EXTENDED_NOTES_KEY = "__capmaxx_intake_extended__";

function parseExtendedNotes(notes: string): Record<string, unknown> {
  if (!notes.trim()) return {};
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;
    const extended = parsed[EXTENDED_NOTES_KEY];
    return extended && typeof extended === "object" ? (extended as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function mapDbRowToSubmission(row: Record<string, unknown>): IntakeSubmission {
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
  const rawNotes = str(row.notes);
  const extended = parseExtendedNotes(rawNotes);
  const fromExt = (key: string) => {
    const v = extended[key];
    return typeof v === "string" ? v : "";
  };
  const fromExtArr = (key: string): string[] => {
    const v = extended[key];
    return Array.isArray(v) ? v.map(String) : [];
  };

  const purposeRaw = str(row.purpose) || fromExt("purpose");
  const purpose = (purposeRaw === "offer" || purposeRaw === "need" || purposeRaw === "both" ? purposeRaw : "") as IntakePurpose | "";

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
    purpose,
    listingTitle: str(row.listing_title) || fromExt("listingTitle"),
    listingDescription: str(row.listing_description) || fromExt("listingDescription"),
    resourceCategories: arr(row.resource_categories).length ? arr(row.resource_categories) : fromExtArr("resourceCategories"),
    resourcesOffered: str(row.resources_offered),
    resourcesSought: str(row.resources_sought),
    capacityDetails: str(row.capacity_details),
    moq: str(row.moq) || fromExt("moq"),
    leadTime: str(row.lead_time) || fromExt("leadTime"),
    certifications: str(row.certifications) || fromExt("certifications"),
    teamSize: str(row.team_size) || fromExt("teamSize"),
    capacityInfo: str(row.capacity_info) || fromExt("capacityInfo"),
    serviceArea: str(row.service_area) || fromExt("serviceArea"),
    equipmentDetails: str(row.equipment_details) || fromExt("equipmentDetails"),
    industriesServed: arr(row.industries_served).length ? arr(row.industries_served) : fromExtArr("industriesServed"),
    availabilityNotes: str(row.availability_notes) || fromExt("availabilityNotes"),
    videoUrls: arr(row.video_urls).length ? arr(row.video_urls) : fromExtArr("videoUrls"),
    additionalNotes: str(row.additional_notes) || fromExt("additionalNotes"),
    preferredContact: str(row.preferred_contact) || "Email",
    logoName: str(row.logo_name) || undefined,
    imageName: str(row.image_name) || undefined,
    logoUrl: str(row.logo_url) || undefined,
    imageUrl: str(row.image_url) || undefined,
    notes: rawNotes.startsWith("{") ? fromExt("userNotes") || "" : rawNotes,
    adminNote: str(row.admin_note) || undefined,
    status: (str(row.status) || "new") as SubmissionStatus,
    companyId: str(row.company_id) || undefined,
  };
}

/** Fallback row for databases that have not yet run migration 0004. */
export function submissionToLegacyDbRow(input: Partial<IntakeSubmission>): Record<string, unknown> {
  const full = submissionToDbRow(input);
  const extended = {
    purpose: full.purpose,
    listingTitle: input.listingTitle,
    listingDescription: input.listingDescription,
    resourceCategories: input.resourceCategories ?? [],
    moq: input.moq,
    leadTime: input.leadTime,
    certifications: input.certifications,
    teamSize: input.teamSize,
    capacityInfo: input.capacityInfo,
    serviceArea: input.serviceArea,
    equipmentDetails: input.equipmentDetails,
    industriesServed: input.industriesServed ?? [],
    availabilityNotes: input.availabilityNotes,
    videoUrls: input.videoUrls ?? [],
    additionalNotes: input.additionalNotes,
    userNotes: input.notes || input.additionalNotes || "",
  };

  return {
    company_name: full.company_name,
    contact_name: full.contact_name,
    email: full.email,
    phone: full.phone,
    website: full.website,
    location: full.location,
    industry: full.industry,
    subcategory: full.subcategory,
    resources_offered: full.resources_offered,
    resources_sought: full.resources_sought,
    capacity_details: full.capacity_details,
    preferred_contact: full.preferred_contact,
    logo_name: full.logo_name,
    image_name: full.image_name,
    logo_url: full.logo_url,
    image_url: full.image_url,
    notes: JSON.stringify({ [EXTENDED_NOTES_KEY]: extended }),
    status: "new",
  };
}

export function isMissingIntakeColumnError(message: string): boolean {
  return (
    /column .* does not exist/i.test(message) ||
    message.includes("42703") ||
    /Could not find the '.*' column of 'intake_submissions'/i.test(message) ||
    message.includes("schema cache")
  );
}

export function submissionToDbRow(input: Partial<IntakeSubmission>): Record<string, unknown> {
  return {
    company_name: input.companyName,
    contact_name: input.contactName,
    email: input.email,
    phone: input.phone || null,
    website: input.website || null,
    location: input.location || null,
    industry: input.industry || null,
    subcategory: input.subcategory || null,
    purpose: input.purpose || null,
    listing_title: input.listingTitle || null,
    listing_description: input.listingDescription || null,
    resource_categories: input.resourceCategories ?? [],
    resources_offered: input.resourcesOffered || null,
    resources_sought: input.resourcesSought || null,
    capacity_details: input.capacityDetails || input.capacityInfo || null,
    moq: input.moq || null,
    lead_time: input.leadTime || null,
    certifications: input.certifications || null,
    team_size: input.teamSize || null,
    capacity_info: input.capacityInfo || null,
    service_area: input.serviceArea || null,
    equipment_details: input.equipmentDetails || null,
    industries_served: input.industriesServed ?? [],
    availability_notes: input.availabilityNotes || null,
    video_urls: input.videoUrls ?? [],
    additional_notes: input.additionalNotes || null,
    preferred_contact: input.preferredContact || "Email",
    logo_name: input.logoName || null,
    image_name: input.imageName || null,
    logo_url: input.logoUrl || null,
    image_url: input.imageUrl || null,
    notes: input.notes || input.additionalNotes || null,
    admin_note: input.adminNote || null,
    status: input.status || "new",
  };
}
