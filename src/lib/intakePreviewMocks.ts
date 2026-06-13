import type { CompanyProfile } from "@/lib/mockCompanies";
import type { Listing } from "@/lib/mockListings";
import { mockListings } from "@/lib/mockListings";
import type { IntakeSubmission } from "@/lib/intakeTypes";

export type IntakePreviewInput = Pick<
  IntakeSubmission,
  | "companyName"
  | "location"
  | "industry"
  | "listingTitle"
  | "listingDescription"
  | "resourceCategories"
  | "resourcesOffered"
  | "resourcesSought"
  | "purpose"
  | "availabilityNotes"
  | "capacityInfo"
  | "moq"
  | "leadTime"
  | "certifications"
  | "equipmentDetails"
  | "teamSize"
  | "industriesServed"
>;

/** Example company — shown until the applicant fills in their own details. */
export const MOCK_PREVIEW_COMPANY: CompanyProfile = {
  slug: "midwest-precision-parts",
  name: "Midwest Precision Parts Co.",
  tagline: "Precision CNC machining & contract manufacturing",
  verified: true,
  location: "Chicago, IL, USA",
  founded: "2008",
  employeeRange: "25–50 employees",
  cageCode: "7X2K9",
  logoInitials: "MP",
  logoColor: "bg-blue-700 text-white",
  coverGradient: "from-slate-700 via-blue-900 to-slate-800",
  coverLabel: "CNC machining floor · 3-axis & 5-axis capacity",
  about:
    "Midwest Precision Parts runs CNC milling and turning capacity between major customer orders. We list open machine hours so other manufacturers can book overflow production without adding equipment.",
  aboutExtended: "",
  contact: { email: "production@midwestprecision.example", phone: "(312) 555-0142", website: "https://midwestprecision.example" },
  details: {
    industry: "Manufacturing",
    subcategory: "CNC Machining",
    businessType: "Manufacturer",
    naicsCode: "332710",
    dunsNumber: "•••••••••",
    taxId: "•••••••••",
  },
  capabilities: ["CNC Milling", "CNC Turning", "Contract Manufacturing", "Overflow Production"],
  locations: [{ name: "Main Plant", address: "Chicago, IL", type: "Plant", contact: "Production desk" }],
  gallery: [],
  certifications: [{ name: "ISO 9001:2015", description: "Quality management" }],
  tags: ["Manufacturing Capacity", "Equipment", "Skilled Labor"],
  marketsServed: [{ country: "United States", flag: "🇺🇸" }],
  videos: [],
  documents: [],
};

const MOCK_OFFER_BASE = mockListings.find((l) => l.id === "1")!;
const MOCK_NEED_BASE = mockListings.find((l) => l.id === "9")!;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "CO";
}

function splitCerts(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
}

function productsFromText(text: string, fallback: string[]): string[] {
  if (!text.trim()) return fallback;
  const parts = text.split(/[,;•|\n]/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts.slice(0, 4) : fallback;
}

export function buildPreviewCompany(input: IntakePreviewInput): CompanyProfile {
  const name = input.companyName.trim() || MOCK_PREVIEW_COMPANY.name;
  const offered = input.resourcesOffered.trim();
  const cats = input.resourceCategories.filter(Boolean);

  return {
    ...MOCK_PREVIEW_COMPANY,
    name,
    logoInitials: initials(name),
    location: input.location.trim() || MOCK_PREVIEW_COMPANY.location,
    tagline: input.listingTitle.trim() || MOCK_PREVIEW_COMPANY.tagline,
    about: offered || input.listingDescription.trim() || MOCK_PREVIEW_COMPANY.about,
    details: {
      ...MOCK_PREVIEW_COMPANY.details,
      industry: input.industry.trim() || MOCK_PREVIEW_COMPANY.details.industry,
    },
    capabilities: cats.length ? cats : MOCK_PREVIEW_COMPANY.capabilities,
    tags: cats.length ? cats : MOCK_PREVIEW_COMPANY.tags,
    employeeRange: input.teamSize.trim() ? `${input.teamSize.trim()} employees` : MOCK_PREVIEW_COMPANY.employeeRange,
    certifications: splitCerts(input.certifications).map((c) => ({ name: c, description: "" })).length
      ? splitCerts(input.certifications).map((c) => ({ name: c, description: "" }))
      : MOCK_PREVIEW_COMPANY.certifications,
  };
}

export function buildPreviewOfferListing(input: IntakePreviewInput): Listing {
  const company = input.companyName.trim() || MOCK_OFFER_BASE.company;
  const title = input.listingTitle.trim() || MOCK_OFFER_BASE.title;
  const desc = input.listingDescription.trim() || input.resourcesOffered.trim() || MOCK_OFFER_BASE.capability;
  const cats = input.resourceCategories.filter(Boolean);

  return {
    ...MOCK_OFFER_BASE,
    type: "offer",
    company,
    location: input.location.trim() || MOCK_OFFER_BASE.location,
    industry: input.industry.trim() || MOCK_OFFER_BASE.industry,
    title,
    capability: desc,
    products: productsFromText(input.resourcesOffered, MOCK_OFFER_BASE.products),
    capacity: input.capacityInfo.trim() || MOCK_OFFER_BASE.capacity,
    moq: input.moq.trim() || MOCK_OFFER_BASE.moq,
    leadTime: input.leadTime.trim() || MOCK_OFFER_BASE.leadTime,
    equipment: input.equipmentDetails.trim() || input.resourcesOffered.trim() || MOCK_OFFER_BASE.equipment,
    certifications: splitCerts(input.certifications).length ? splitCerts(input.certifications) : MOCK_OFFER_BASE.certifications,
    industriesServed: input.industriesServed.length ? input.industriesServed : MOCK_OFFER_BASE.industriesServed,
    tags: cats.length ? cats : MOCK_OFFER_BASE.tags,
    categoryLabel: cats[0] ?? MOCK_OFFER_BASE.categoryLabel,
    opportunityTags: cats.length ? cats.slice(0, 3) : MOCK_OFFER_BASE.opportunityTags,
    availableFrom: input.availabilityNotes.trim() ? input.availabilityNotes.trim() : MOCK_OFFER_BASE.availableFrom,
    logoLetter: initials(company)[0] ?? "M",
    verified: false,
  };
}

export function buildPreviewNeedListing(input: IntakePreviewInput): Listing {
  const company = input.companyName.trim() || MOCK_NEED_BASE.company;
  const sought = input.resourcesSought.trim();
  const title =
    input.purpose === "need" || input.purpose === "both"
      ? input.listingTitle.trim() || (sought ? sought.split(/[.!?\n]/)[0].slice(0, 72) : MOCK_NEED_BASE.title)
      : sought
        ? sought.split(/[.!?\n]/)[0].slice(0, 72)
        : MOCK_NEED_BASE.title;
  const desc = sought || input.listingDescription.trim() || MOCK_NEED_BASE.capability;
  const cats = input.resourceCategories.filter(Boolean);

  return {
    ...MOCK_NEED_BASE,
    type: "need",
    company,
    location: input.location.trim() || MOCK_NEED_BASE.location,
    industry: input.industry.trim() || MOCK_NEED_BASE.industry,
    title,
    capability: desc,
    products: productsFromText(sought, MOCK_NEED_BASE.products),
    capacity: input.capacityInfo.trim() || MOCK_NEED_BASE.capacity,
    moq: input.moq.trim() || MOCK_NEED_BASE.moq,
    leadTime: input.leadTime.trim() || MOCK_NEED_BASE.leadTime,
    equipment: sought || input.equipmentDetails.trim() || MOCK_NEED_BASE.equipment,
    equipmentLabel: "Requirements",
    certifications: splitCerts(input.certifications).length ? splitCerts(input.certifications) : MOCK_NEED_BASE.certifications,
    industriesServed: input.industriesServed.length ? input.industriesServed : MOCK_NEED_BASE.industriesServed,
    tags: cats.length ? cats : MOCK_NEED_BASE.tags,
    categoryLabel: cats[0] ?? MOCK_NEED_BASE.categoryLabel,
    opportunityTags: ["New Suppliers", "Contract Manufacturing"].slice(0, cats.length ? Math.min(3, cats.length) : 2),
    availableFrom: input.availabilityNotes.trim() || MOCK_NEED_BASE.availableFrom,
    logoLetter: initials(company)[0] ?? "N",
    verified: false,
  };
}

export function usesMockCompany(input: IntakePreviewInput): boolean {
  return !input.companyName.trim();
}

export function usesMockOffer(input: IntakePreviewInput): boolean {
  return !input.listingTitle.trim() && !input.resourcesOffered.trim();
}

export function usesMockNeed(input: IntakePreviewInput): boolean {
  return !input.resourcesSought.trim() && input.purpose !== "need";
}
