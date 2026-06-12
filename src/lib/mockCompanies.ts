import type { CompanyContact } from "@/lib/companyContact";

export type { CompanyContact } from "@/lib/companyContact";

export interface CompanyLocation {
  name: string;
  address: string;
  type: "Headquarters" | "Plant" | "Office" | "Warehouse";
  contact: string;
}

export interface CompanyCertification {
  name: string;
  description: string;
}

export interface CompanyMarket {
  country: string;
  flag: string;
}

export interface CompanyVideo {
  title: string;
  duration: string;
  gradient: string;
}

export interface CompanyDocument {
  name: string;
  size: string;
}

export interface CompanyGalleryPhoto {
  label: string;
  gradient: string;
}

export interface CompanyProfile {
  slug: string;
  name: string;
  tagline: string;
  verified: boolean;
  // When set (e.g. from Supabase), the Verified badge is driven by this instead
  // of the legacy `verified` boolean. Absent in mock data → falls back to `verified`.
  verificationStatus?: "unverified" | "pending" | "verified" | "rejected";
  location: string;
  founded: string;
  employeeRange: string;
  cageCode: string;
  logoInitials: string;
  logoColor: string;
  coverGradient: string;
  coverLabel: string;
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
  locations: CompanyLocation[];
  gallery: CompanyGalleryPhoto[];
  certifications: CompanyCertification[];
  tags: string[];
  marketsServed: CompanyMarket[];
  videos: CompanyVideo[];
  documents: CompanyDocument[];
}

export const midwestPrecisionProfile: CompanyProfile = {
  slug: "midwest-precision-parts",
  name: "Midwest Precision Parts Co.",
  tagline: "Precision Machined Components. On Time. Every Time.",
  verified: true,
  location: "Chicago, Illinois, USA",
  founded: "2012",
  employeeRange: "50–100 employees",
  cageCode: "1ABC2",
  logoInitials: "MP",
  logoColor: "bg-blue-700 text-white",
  coverGradient: "from-slate-600 via-slate-700 to-gray-900",
  coverLabel: "CNC Machining Facility",
  about:
    "Midwest Precision Parts Co. is a full-service precision machining manufacturer serving aerospace, medical device, defense, and industrial OEMs. Our 45,000 sq. ft. facility houses multi-axis CNC mills, lathes, and a dedicated quality lab with CMM inspection.",
  aboutExtended:
    "Founded in 2012, we have grown from a 5-person job shop to a 75-employee operation with AS9100D and ISO 9001:2015 certifications. We specialize in tight-tolerance aluminum, titanium, and stainless steel components with lot traceability and full material certifications. Our engineering team supports DFM reviews, prototype runs, and production scaling from 10 to 10,000+ units.",
  contact: {
    website: "www.midwestprecision.com",
    email: "sales@midwestprecision.com",
    phone: "+1 (312) 555-0147",
    linkedin: "linkedin.com/company/midwest-precision-parts",
    teams: "https://teams.microsoft.com/l/meetup-join/midwest-precision",
    zoom: "https://zoom.us/j/3125550147",
    calendly: "https://calendly.com/midwest-precision/intro",
  },
  details: {
    industry: "Manufacturing",
    subcategory: "CNC Machining",
    businessType: "Contract Manufacturer",
    naicsCode: "332710 – Machine Shops",
    dunsNumber: "08-234-5678",
    taxId: "XX-XXXXXXX",
  },
  capabilities: [
    "CNC Machining",
    "5-Axis Milling",
    "CNC Turning",
    "Prototype Development",
    "Assembly & Kitting",
    "CMM Inspection",
    "Anodizing (Partner)",
    "Heat Treat (Partner)",
  ],
  locations: [
    {
      name: "Chicago HQ & Plant",
      address: "2840 W Fulton St, Chicago, IL 60612",
      type: "Headquarters",
      contact: "James Hartley, President",
    },
    {
      name: "Elgin Production Plant",
      address: "1200 Industrial Dr, Elgin, IL 60120",
      type: "Plant",
      contact: "Sara Kim, Plant Manager",
    },
  ],
  gallery: [
    { label: "5-Axis CNC Cell", gradient: "from-slate-500 to-slate-800" },
    { label: "Quality Lab", gradient: "from-blue-400 to-blue-700" },
    { label: "Production Floor", gradient: "from-gray-400 to-gray-700" },
    { label: "CMM Inspection", gradient: "from-indigo-400 to-indigo-700" },
    { label: "Finished Parts", gradient: "from-slate-300 to-slate-600" },
    { label: "Shipping & Receiving", gradient: "from-teal-400 to-teal-700" },
  ],
  certifications: [
    {
      name: "ISO 9001:2015",
      description: "Quality management system certified for precision manufacturing.",
    },
    {
      name: "AS9100D",
      description: "Aerospace quality standard for aviation, space, and defense components.",
    },
    {
      name: "ITAR Registered",
      description: "Authorized to manufacture and export defense-related articles.",
    },
  ],
  tags: ["Aerospace", "Medical Devices", "Defense", "Automotive", "Industrial"],
  marketsServed: [
    { country: "United States", flag: "🇺🇸" },
    { country: "Canada", flag: "🇨🇦" },
    { country: "Mexico", flag: "🇲🇽" },
    { country: "Germany", flag: "🇩🇪" },
    { country: "Japan", flag: "🇯🇵" },
  ],
  videos: [
    { title: "Company Overview", duration: "2:34", gradient: "from-slate-600 to-slate-900" },
    { title: "Facility Tour", duration: "4:12", gradient: "from-blue-600 to-blue-900" },
    { title: "CNC Capabilities", duration: "3:08", gradient: "from-indigo-600 to-indigo-900" },
  ],
  documents: [
    { name: "Company Brochure", size: "2.4 MB" },
    { name: "Quality Policy", size: "890 KB" },
    { name: "Capability Statement", size: "1.1 MB" },
  ],
};

const additionalProfiles: CompanyProfile[] = [
  {
    slug: "summit-cold-storage",
    name: "Summit Cold Storage LLC",
    tagline: "Cold chain logistics you can count on.",
    verified: true,
    location: "Denver, CO, USA",
    founded: "2005",
    employeeRange: "25–50 employees",
    cageCode: "—",
    logoInitials: "SC",
    logoColor: "bg-slate-800 text-white",
    coverGradient: "from-slate-400 via-slate-500 to-slate-600",
    coverLabel: "Cold Storage Facility",
    about: "Summit Cold Storage provides refrigerated and frozen warehousing, cross-docking, and distribution across the Rocky Mountain region.",
    aboutExtended: "Our FDA-registered facility offers 10,000 pallet positions with real-time temperature monitoring and SQF Level 2 certification.",
    contact: {
      website: "www.summitcoldstorage.com",
      email: "info@summitcoldstorage.com",
      phone: "+1 (303) 555-0199",
      linkedin: "linkedin.com/company/summit-cold-storage",
      zoom: "https://zoom.us/j/3035550199",
      calendly: "https://calendly.com/summit-cold/tour",
    },
    details: {
      industry: "Logistics",
      subcategory: "Cold Storage",
      businessType: "3PL Provider",
      naicsCode: "493120 – Refrigerated Warehousing",
      dunsNumber: "12-345-6789",
      taxId: "XX-XXXXXXX",
    },
    capabilities: ["Cold Storage", "Frozen Storage", "Cross Docking", "Distribution"],
    locations: [
      {
        name: "Denver Distribution Center",
        address: "4500 E 46th Ave, Denver, CO 80216",
        type: "Headquarters",
        contact: "Mike Torres, Operations Director",
      },
    ],
    gallery: [
      { label: "Cold Storage Aisle", gradient: "from-slate-400 to-slate-700" },
      { label: "Loading Docks", gradient: "from-blue-300 to-blue-600" },
      { label: "Temperature Monitoring", gradient: "from-cyan-400 to-cyan-700" },
      { label: "Freezer Zone", gradient: "from-indigo-300 to-indigo-600" },
      { label: "Cross-Dock Area", gradient: "from-gray-400 to-gray-700" },
      { label: "Fleet Yard", gradient: "from-teal-300 to-teal-600" },
    ],
    certifications: [
      { name: "SQF Level 2", description: "Safe Quality Food certification for food-grade storage." },
      { name: "FDA Registered", description: "Registered facility for food and beverage storage." },
    ],
    tags: ["Food & Beverage", "Pharmaceutical", "Retail", "Distribution"],
    marketsServed: [
      { country: "United States", flag: "🇺🇸" },
      { country: "Canada", flag: "🇨🇦" },
    ],
    videos: [{ title: "Facility Overview", duration: "1:45", gradient: "from-slate-500 to-slate-800" }],
    documents: [{ name: "Services Overview", size: "1.8 MB" }],
  },
  {
    slug: "apex-fabrication-group",
    name: "Apex Fabrication Group",
    tagline: "Metal fabrication from prototype to production.",
    verified: true,
    location: "Detroit, MI, USA",
    founded: "1998",
    employeeRange: "100–250 employees",
    cageCode: "2DEF3",
    logoInitials: "AF",
    logoColor: "bg-red-700 text-white",
    coverGradient: "from-orange-500 via-red-500 to-red-700",
    coverLabel: "Metal Fabrication Shop",
    about: "Apex Fabrication Group delivers CNC machining, laser cutting, sheet metal forming, welding, and powder coating for automotive and industrial clients.",
    aboutExtended: "Our 120,000 sq. ft. campus includes in-house engineering, tooling, and a dedicated prototype cell for rapid turnaround.",
    contact: {
      website: "www.apexfabgroup.com",
      email: "quotes@apexfabgroup.com",
      phone: "+1 (313) 555-0234",
      linkedin: "linkedin.com/company/apex-fabrication-group",
      meet: "https://meet.google.com/apex-fab-grp",
      calendly: "https://calendly.com/apex-fab/quote",
    },
    details: {
      industry: "Manufacturing",
      subcategory: "Metal Fabrication",
      businessType: "Contract Manufacturer",
      naicsCode: "332322 – Sheet Metal Work",
      dunsNumber: "05-678-9012",
      taxId: "XX-XXXXXXX",
    },
    capabilities: ["CNC Machining", "Laser Cutting", "Sheet Metal", "Welding", "Powder Coating"],
    locations: [
      {
        name: "Detroit Main Plant",
        address: "8800 E Jefferson Ave, Detroit, MI 48214",
        type: "Headquarters",
        contact: "Carlos Mendez, VP Operations",
      },
    ],
    gallery: [
      { label: "Laser Cutting", gradient: "from-orange-400 to-red-700" },
      { label: "Welding Bay", gradient: "from-amber-400 to-orange-700" },
      { label: "CNC Department", gradient: "from-gray-400 to-gray-700" },
      { label: "Powder Coat Line", gradient: "from-red-400 to-red-700" },
      { label: "Assembly Area", gradient: "from-slate-400 to-slate-700" },
      { label: "Quality Control", gradient: "from-blue-400 to-blue-700" },
    ],
    certifications: [
      { name: "ISO 9001:2015", description: "Certified quality management system." },
      { name: "IATF 16949", description: "Automotive quality management standard." },
    ],
    tags: ["Automotive", "Industrial", "Heavy Equipment", "Construction"],
    marketsServed: [
      { country: "United States", flag: "🇺🇸" },
      { country: "Mexico", flag: "🇲🇽" },
    ],
    videos: [
      { title: "Shop Tour", duration: "3:22", gradient: "from-orange-600 to-red-900" },
      { title: "Laser Capabilities", duration: "2:10", gradient: "from-red-600 to-red-900" },
    ],
    documents: [
      { name: "Capability Statement", size: "980 KB" },
      { name: "Equipment List", size: "450 KB" },
    ],
  },
];

export const mockCompanyProfiles: CompanyProfile[] = [
  midwestPrecisionProfile,
  ...additionalProfiles,
];

export function getCompanyBySlug(slug: string): CompanyProfile | undefined {
  return mockCompanyProfiles.find((c) => c.slug === slug);
}

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getCompanyProfileOrFallback(slug: string): CompanyProfile {
  const existing = getCompanyBySlug(slug);
  if (existing) return existing;

  return {
    ...midwestPrecisionProfile,
    slug,
    name: titleCaseSlug(slug),
    tagline: "B2B capabilities and services on CapMaxx.",
    logoInitials: titleCaseSlug(slug)
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase(),
  };
}

export function companyProfileHref(slugOrId: string): string {
  const bySlug = getCompanyBySlug(slugOrId);
  if (bySlug) return `/company/${bySlug.slug}`;

  const slugMap: Record<string, string> = {
    "1": "summit-cold-storage",
    "4": "apex-fabrication-group",
    "12": "midwest-precision-parts",
  };

  const slug = slugMap[slugOrId] ?? slugOrId;
  return `/company/${slug}`;
}

export function companySlugFromName(name: string): string {
  const nameMap: Record<string, string> = {
    "midwest precision parts co.": "midwest-precision-parts",
    "midwest precision parts": "midwest-precision-parts",
    "summit cold storage llc": "summit-cold-storage",
    "summit cold storage": "summit-cold-storage",
    "apex fabrication group": "apex-fabrication-group",
    "apex fabrication": "apex-fabrication-group",
    "blueline transport inc.": "blueline-transport",
    "greenleaf bakery co.": "greenleaf-bakery",
    "northfield poultry supply": "northfield-poultry",
    "frostway foods": "frostway-foods",
    "packrite solutions": "packrite-solutions",
    "voltex electrical": "voltex-electrical",
    "techassembly solutions": "techassembly-solutions",
    "hartwell injection molding": "hartwell-injection-molding",
    "coastal food co-pack": "coastal-food-copack",
  };

  const key = name.toLowerCase();
  if (nameMap[key]) return nameMap[key];

  const match = mockCompanyProfiles.find((c) =>
    c.name.toLowerCase().includes(key.split(" ")[0])
  );
  if (match) return match.slug;

  return key.replace(/\./g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
