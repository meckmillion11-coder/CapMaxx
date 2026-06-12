// ──────────────────────────────────────────────────────────────────────────────
// Mock data for the Admin Panel (/admin)
//
// Users and companies live here. Listings are derived from the existing
// src/lib/mockListings.ts so the admin Listings table reuses real listing data.
// All "live" mutations (approve/suspend/delete) happen in React state inside the
// AdminPanel component — these arrays are just the initial seed.
// ──────────────────────────────────────────────────────────────────────────────

import { mockListings } from "./mockListings";
import { companySlugFromName } from "./mockCompanies";

export type ModerationStatus = "Pending" | "Approved" | "Suspended";
export type AvailabilityStatus = "available" | "expiring" | "expired";
export type ReportStatus = "pending" | "reviewed" | "removed";
export type AdminRole = "owner" | "admin" | "support";
export type NoteTargetType = "user" | "company" | "listing";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: "Owner" | "Admin" | "Member";
  joined: string;
  status: ModerationStatus;
}

export interface AdminCompany {
  id: string;
  slug: string;
  name: string;
  location: string;
  industry: string;
  subcategory: string;
  contactEmail: string;
  listings: number;
  joined: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  status: ModerationStatus;
}

export interface AdminListing {
  id: string;
  title: string;
  company: string;
  companySlug: string;
  type: "offer" | "need";
  industry: string;
  subcategory: string;
  location: string;
  posted: string;
  status: ModerationStatus;
  availability: AvailabilityStatus;
}

export interface AdminReport {
  id: string;
  kind: "company" | "listing";
  targetId: string;
  targetName: string;
  reporter: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AdminThreadBody {
  from: string;
  text: string;
  at: string;
}

export interface AdminThreadMeta {
  id: string;
  subject: string;
  companyA: string;
  companyB: string;
  participants: number;
  lastMessageAt: string;
  messages: number;
  flagged: boolean;
  // Bodies are only populated for flagged threads (abuse/report review).
  bodies?: AdminThreadBody[];
}

export interface AdminNote {
  id: string;
  targetType: NoteTargetType;
  targetId: string;
  targetLabel: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface PlatformStats {
  users: number;
  companies: number;
  listings: number;
  offerListings: number;
  needListings: number;
  activeListings: number;
  messages: number;
  newSignups: number;
  pendingVerification: number;
}

export const adminUsers: AdminUser[] = [
  { id: "u1", name: "James Hartley", email: "james@midwestprecision.com", company: "Midwest Precision Parts Co.", role: "Owner", joined: "Jan 12, 2026", status: "Approved" },
  { id: "u2", name: "Sara Kim", email: "sara@midwestprecision.com", company: "Midwest Precision Parts Co.", role: "Member", joined: "Jan 14, 2026", status: "Approved" },
  { id: "u3", name: "Mike Torres", email: "mike@summitcoldstorage.com", company: "Summit Cold Storage LLC", role: "Owner", joined: "Feb 03, 2026", status: "Approved" },
  { id: "u4", name: "Carlos Mendez", email: "carlos@apexfabgroup.com", company: "Apex Fabrication Group", role: "Owner", joined: "Feb 21, 2026", status: "Approved" },
  { id: "u5", name: "Emily Chen", email: "emily@greenleafbakery.com", company: "GreenLeaf Bakery Co.", role: "Owner", joined: "Mar 08, 2026", status: "Pending" },
  { id: "u6", name: "David Okafor", email: "david@packrite.com", company: "PackRite Solutions", role: "Owner", joined: "Mar 19, 2026", status: "Approved" },
  { id: "u7", name: "Lena Brooks", email: "lena@blueline-transport.com", company: "BlueLine Transport Inc.", role: "Owner", joined: "Apr 02, 2026", status: "Approved" },
  { id: "u8", name: "Raj Patel", email: "raj@techassembly.com", company: "TechAssembly Solutions", role: "Owner", joined: "Apr 15, 2026", status: "Suspended" },
  { id: "u9", name: "Nina Alvarez", email: "nina@coastalcopack.com", company: "Coastal Food Co-Pack", role: "Owner", joined: "May 01, 2026", status: "Pending" },
  { id: "u10", name: "Tom Becker", email: "tom@hartwellmolding.com", company: "Hartwell Injection Molding", role: "Member", joined: "May 22, 2026", status: "Approved" },
];

const baseCompanies: Omit<AdminCompany, "slug">[] = [
  { id: "c1", name: "Midwest Precision Parts Co.", location: "Chicago, IL, USA", industry: "Manufacturing", subcategory: "CNC Machining", contactEmail: "sales@midwestprecision.com", listings: 2, joined: "Jan 12, 2026", verified: true, verificationStatus: "verified", status: "Approved" },
  { id: "c2", name: "Summit Cold Storage LLC", location: "Denver, CO, USA", industry: "Logistics", subcategory: "Cold Storage", contactEmail: "info@summitcoldstorage.com", listings: 1, joined: "Feb 03, 2026", verified: true, verificationStatus: "verified", status: "Approved" },
  { id: "c3", name: "Apex Fabrication Group", location: "Detroit, MI, USA", industry: "Manufacturing", subcategory: "Metal Fabrication", contactEmail: "quotes@apexfabgroup.com", listings: 1, joined: "Feb 21, 2026", verified: true, verificationStatus: "verified", status: "Approved" },
  { id: "c4", name: "GreenLeaf Bakery Co.", location: "Portland, OR, USA", industry: "Food & Beverage", subcategory: "Bakery", contactEmail: "hello@greenleafbakery.com", listings: 1, joined: "Mar 08, 2026", verified: false, verificationStatus: "pending", status: "Pending" },
  { id: "c5", name: "PackRite Solutions", location: "Chicago, IL, USA", industry: "Packaging", subcategory: "Custom Packaging", contactEmail: "sales@packrite.com", listings: 1, joined: "Mar 19, 2026", verified: false, verificationStatus: "unverified", status: "Approved" },
  { id: "c6", name: "BlueLine Transport Inc.", location: "Atlanta, GA, USA", industry: "Logistics", subcategory: "Freight & Transportation", contactEmail: "dispatch@blueline-transport.com", listings: 1, joined: "Apr 02, 2026", verified: true, verificationStatus: "verified", status: "Approved" },
  { id: "c7", name: "TechAssembly Solutions", location: "Austin, TX, USA", industry: "Electronics", subcategory: "PCB Assembly", contactEmail: "rfq@techassembly.com", listings: 1, joined: "Apr 15, 2026", verified: false, verificationStatus: "rejected", status: "Suspended" },
  { id: "c8", name: "Coastal Food Co-Pack", location: "Seattle, WA, USA", industry: "Food & Beverage", subcategory: "Co-Packing", contactEmail: "info@coastalcopack.com", listings: 1, joined: "May 01, 2026", verified: false, verificationStatus: "pending", status: "Pending" },
  { id: "c9", name: "Hartwell Injection Molding", location: "Cincinnati, OH, USA", industry: "Plastics", subcategory: "Injection Molding", contactEmail: "sales@hartwellmolding.com", listings: 1, joined: "May 22, 2026", verified: false, verificationStatus: "unverified", status: "Approved" },
];

export const adminCompanies: AdminCompany[] = baseCompanies.map((c) => ({
  ...c,
  slug: companySlugFromName(c.name),
}));

// Derive the admin listings table from the existing mock listings. We assign an
// initial moderation status so most are Approved with a couple of Pending and a
// Suspended entry to exercise the status filters/badges.
const listingStatusOverrides: Record<string, ModerationStatus> = {
  "9": "Pending",
  "12": "Pending",
  "13": "Pending",
  "10": "Suspended",
};

export const adminListings: AdminListing[] = mockListings.map((l) => ({
  id: l.id,
  title: l.title,
  company: l.company,
  companySlug: companySlugFromName(l.company),
  type: l.type,
  industry: l.industry,
  subcategory: l.subcategory,
  location: l.location,
  posted: l.posted,
  status: listingStatusOverrides[l.id] ?? "Approved",
  availability: l.availabilityStatus,
}));

export const moderationStatuses: ModerationStatus[] = ["Pending", "Approved", "Suspended"];

// ── Reports (mock seed) ───────────────────────────────────────────────────────
export const adminReports: AdminReport[] = [
  {
    id: "rc1",
    kind: "company",
    targetId: "c7",
    targetName: "TechAssembly Solutions",
    reporter: "lena@blueline-transport.com",
    reason: "Suspected fake company — no verifiable address or website.",
    status: "pending",
    createdAt: "2026-06-08T10:15:00.000Z",
  },
  {
    id: "rl1",
    kind: "listing",
    targetId: "10",
    targetName: "Industrial Sewing & Assembly",
    reporter: "mike@summitcoldstorage.com",
    reason: "Spam — duplicate listing posted repeatedly.",
    status: "pending",
    createdAt: "2026-06-09T16:40:00.000Z",
  },
  {
    id: "rc2",
    kind: "company",
    targetId: "c4",
    targetName: "GreenLeaf Bakery Co.",
    reporter: "raj@techassembly.com",
    reason: "Misleading certifications claim.",
    status: "reviewed",
    createdAt: "2026-06-05T09:00:00.000Z",
  },
];

// ── Message thread metadata (mock seed) ───────────────────────────────────────
// Bodies are only present on flagged threads to mirror the abuse-review gate.
export const adminThreads: AdminThreadMeta[] = [
  {
    id: "t1",
    subject: "CNC overflow capacity",
    companyA: "Apex Fabrication Group",
    companyB: "Midwest Precision Parts Co.",
    participants: 2,
    lastMessageAt: "2026-06-10T13:20:00.000Z",
    messages: 6,
    flagged: false,
  },
  {
    id: "t2",
    subject: "Cold storage availability",
    companyA: "BlueLine Transport Inc.",
    companyB: "Summit Cold Storage LLC",
    participants: 2,
    lastMessageAt: "2026-06-09T08:05:00.000Z",
    messages: 3,
    flagged: false,
  },
  {
    id: "t3",
    subject: "Partnership inquiry",
    companyA: "PackRite Solutions",
    companyB: "TechAssembly Solutions",
    participants: 2,
    lastMessageAt: "2026-06-07T17:45:00.000Z",
    messages: 4,
    flagged: true,
    bodies: [
      { from: "PackRite Solutions", text: "Hi — are you the real manufacturer or a reseller?", at: "2026-06-07T17:30:00.000Z" },
      { from: "TechAssembly Solutions", text: "Send payment upfront via wire and we'll discuss.", at: "2026-06-07T17:38:00.000Z" },
      { from: "PackRite Solutions", text: "That sounds like a scam. Reporting this thread.", at: "2026-06-07T17:45:00.000Z" },
    ],
  },
];

// ── Admin notes (mock seed) ───────────────────────────────────────────────────
export const adminNotesSeed: AdminNote[] = [
  {
    id: "n1",
    targetType: "company",
    targetId: "c7",
    targetLabel: "TechAssembly Solutions",
    body: "Flagged by another member as possibly fake. Pending verification call.",
    author: "owner@capmaxx.com",
    createdAt: "2026-06-08T11:00:00.000Z",
  },
];

// ── Platform stats (mock fallback) ────────────────────────────────────────────
export const mockPlatformStats: PlatformStats = {
  users: adminUsers.length,
  companies: adminCompanies.length,
  listings: adminListings.length,
  offerListings: adminListings.filter((l) => l.type === "offer").length,
  needListings: adminListings.filter((l) => l.type === "need").length,
  activeListings: adminListings.filter((l) => l.availability === "available").length,
  messages: adminThreads.reduce((sum, t) => sum + t.messages, 0),
  newSignups: 4,
  pendingVerification: adminCompanies.filter((c) => c.verificationStatus === "pending").length,
};
