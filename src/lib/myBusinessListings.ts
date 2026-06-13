import type { Listing } from "@/lib/mockListings";

export type ListingStatus = "active" | "expiring" | "expired";

export interface MyBusinessListing {
  id: string;
  listingId: string;
  title: string;
  type: "offer" | "need";
  status: ListingStatus;
  industry: string;
  subcategory: string;
  location: string;
  tags: string[];
  opportunityTags?: string[];
  certifications?: string[];
  capacity?: string;
  leadTime?: string;
  availabilityStatus?: "available" | "expiring" | "expired";
  views: number;
  connections: number;
  messages: number;
  listedDate: string;
  expiresDate: string;
  daysUntilExpiry?: number;
  photoBg: string;
  photoLabel: string;
}

const midwestBase: Pick<
  Listing,
  "company" | "location" | "logoColor" | "logoLetter" | "verified"
> = {
  company: "Midwest Precision Parts Co.",
  location: "Chicago, IL, USA",
  logoColor: "bg-blue-700 text-white",
  logoLetter: "M",
  verified: true,
};

export const myBusinessListings: MyBusinessListing[] = [
  {
    id: "mpp-1",
    listingId: "#OFF-1247",
    title: "CNC Machining Capacity",
    type: "offer",
    status: "active",
    industry: "Manufacturing",
    subcategory: "Precision Machining",
    location: midwestBase.location,
    tags: ["CNC Machining", "Milling", "Turning", "Precision Parts", "Prototyping"],
    views: 342,
    connections: 18,
    messages: 7,
    listedDate: "Mar 15, 2026",
    expiresDate: "Jun 15, 2026",
    photoBg: "from-slate-600 via-slate-700 to-gray-900",
    photoLabel: "CNC Machining Operations",
  },
  {
    id: "mpp-2",
    listingId: "#OFF-1189",
    title: "Sheet Metal Fabrication",
    type: "offer",
    status: "active",
    industry: "Manufacturing",
    subcategory: "Metal Fabrication",
    location: midwestBase.location,
    tags: ["Sheet Metal", "Laser Cutting", "Welding", "Powder Coating"],
    views: 198,
    connections: 12,
    messages: 3,
    listedDate: "Feb 28, 2026",
    expiresDate: "Aug 28, 2026",
    photoBg: "from-orange-500 via-red-600 to-red-800",
    photoLabel: "Sheet Metal Fabrication",
  },
  {
    id: "mpp-3",
    listingId: "#NED-0892",
    title: "Seeking Cold Storage Partner",
    type: "need",
    status: "expiring",
    industry: "Logistics",
    subcategory: "Cold Storage",
    location: midwestBase.location,
    tags: ["Cold Storage", "Refrigerated", "Distribution", "FDA Certified"],
    views: 87,
    connections: 5,
    messages: 2,
    listedDate: "Dec 10, 2025",
    expiresDate: "Jun 17, 2026",
    daysUntilExpiry: 6,
    photoBg: "from-slate-400 via-slate-500 to-slate-700",
    photoLabel: "Cold Storage Facility",
  },
  {
    id: "mpp-4",
    listingId: "#OFF-0941",
    title: "Contract Packaging Services",
    type: "offer",
    status: "expired",
    industry: "Packaging",
    subcategory: "Contract Packaging",
    location: midwestBase.location,
    tags: ["Contract Packaging", "Kitting", "Labeling", "Fulfillment"],
    views: 156,
    connections: 8,
    messages: 0,
    listedDate: "Sep 1, 2025",
    expiresDate: "Mar 1, 2026",
    photoBg: "from-amber-300 via-orange-400 to-amber-500",
    photoLabel: "Contract Packaging",
  },
  {
    id: "mpp-5",
    listingId: "#OFF-1312",
    title: "Precision Turning & Milling",
    type: "offer",
    status: "active",
    industry: "Manufacturing",
    subcategory: "CNC Machining",
    location: midwestBase.location,
    tags: ["CNC Turning", "Milling", "Tight Tolerances", "Aluminum", "Steel"],
    views: 124,
    connections: 9,
    messages: 1,
    listedDate: "Apr 5, 2026",
    expiresDate: "Oct 5, 2026",
    photoBg: "from-slate-500 via-slate-600 to-slate-800",
    photoLabel: "Precision Turning",
  },
  {
    id: "mpp-6",
    listingId: "#NED-1045",
    title: "Need Anodizing & Surface Finishing",
    type: "need",
    status: "expiring",
    industry: "Manufacturing",
    subcategory: "Surface Treatment",
    location: midwestBase.location,
    tags: ["Anodizing", "Powder Coating", "Surface Finishing", "Aluminum"],
    views: 73,
    connections: 3,
    messages: 0,
    listedDate: "Jan 20, 2026",
    expiresDate: "Jun 14, 2026",
    daysUntilExpiry: 3,
    photoBg: "",
    photoLabel: "",
  },
  {
    id: "mpp-7",
    listingId: "#OFF-1278",
    title: "5-Axis Machining Overflow Capacity",
    type: "offer",
    status: "active",
    industry: "Manufacturing",
    subcategory: "Precision Machining",
    location: midwestBase.location,
    tags: ["5-Axis Machining", "Aerospace", "Complex Geometry", "Overflow"],
    views: 201,
    connections: 6,
    messages: 2,
    listedDate: "Mar 22, 2026",
    expiresDate: "Sep 22, 2026",
    photoBg: "from-blue-600 via-slate-700 to-gray-900",
    photoLabel: "5-Axis Machining",
  },
  {
    id: "mpp-8",
    listingId: "#NED-0718",
    title: "Sub-Contract Quality Control Partner",
    type: "need",
    status: "expired",
    industry: "Manufacturing",
    subcategory: "Quality Assurance",
    location: midwestBase.location,
    tags: ["Quality Control", "CMM Inspection", "ISO 9001", "First Article"],
    views: 93,
    connections: 1,
    messages: 0,
    listedDate: "Jul 15, 2025",
    expiresDate: "Jan 15, 2026",
    photoBg: "",
    photoLabel: "",
  },
  {
    id: "mpp-9",
    listingId: "#OFF-1330",
    title: "Deburring & Finishing Services",
    type: "offer",
    status: "active",
    industry: "Manufacturing",
    subcategory: "Finishing",
    location: midwestBase.location,
    tags: ["Deburring", "Tumbling", "Surface Prep", "Assembly"],
    views: 45,
    connections: 4,
    messages: 1,
    listedDate: "Apr 18, 2026",
    expiresDate: "Oct 18, 2026",
    photoBg: "from-gray-500 via-slate-600 to-slate-800",
    photoLabel: "Finishing Services",
  },
  {
    id: "mpp-10",
    listingId: "#NED-1102",
    title: "Need EDM Wire Cutting Capacity",
    type: "need",
    status: "active",
    industry: "Manufacturing",
    subcategory: "EDM",
    location: midwestBase.location,
    tags: ["EDM", "Wire Cutting", "Tool & Die", "Precision"],
    views: 38,
    connections: 2,
    messages: 0,
    listedDate: "May 1, 2026",
    expiresDate: "Nov 1, 2026",
    photoBg: "",
    photoLabel: "",
  },
];

export const listingsKpis = {
  activeListings: myBusinessListings.filter((l) => l.status !== "expired").length,
  totalViews: 1274,
  totalConnections: 42,
  unreadMessages: 6,
  viewsGrowth: "+12% this month",
  connectionsGrowth: "+18% this month",
};

export { midwestBase };
