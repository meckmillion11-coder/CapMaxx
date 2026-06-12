"use client";

import { Fragment, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  adminUsers,
  adminCompanies,
  adminListings,
  adminReports,
  adminThreads,
  adminNotesSeed,
  mockPlatformStats,
  type AdminUser,
  type AdminCompany,
  type AdminListing,
  type AdminReport,
  type AdminThreadMeta,
  type AdminNote,
  type PlatformStats,
  type ModerationStatus,
  type AvailabilityStatus,
  type ReportStatus,
  type NoteTargetType,
  type VerificationStatus,
} from "@/lib/adminData";
import { companySlugFromName } from "@/lib/mockCompanies";
import {
  subscribeSubmissions,
  getSubmissions,
  getServerSubmissions,
  updateSubmissionStatus,
  updateSubmissionNote,
  deleteSubmission,
  replaceSubmissions,
  mapDbRowToSubmission,
  type SubmissionStatus,
} from "@/lib/intakeSubmissions";

// Format an ISO timestamp the way the mock data presents "joined" dates.
function fmtDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

function asModeration(value: unknown): ModerationStatus {
  return value === "Approved" || value === "Suspended" || value === "Pending"
    ? (value as ModerationStatus)
    : "Approved";
}

function asReportStatus(value: unknown): ReportStatus {
  return value === "pending" || value === "reviewed" || value === "removed"
    ? (value as ReportStatus)
    : "pending";
}

function asAvailability(value: unknown): AvailabilityStatus {
  return value === "available" || value === "expiring" || value === "expired"
    ? (value as AvailabilityStatus)
    : "available";
}

function asVerification(value: unknown): VerificationStatus {
  return value === "unverified" || value === "pending" || value === "verified" || value === "rejected"
    ? (value as VerificationStatus)
    : "unverified";
}

type Row = Record<string, unknown>;

// POST an action to the secured admin API. Best-effort: failures are swallowed
// because the panel has already updated local state optimistically.
async function postAdminAction(body: {
  entity: "user" | "company" | "listing" | "intake" | "report" | "note";
  action: "status" | "delete" | "note" | "convert" | "remove" | "verify";
  id?: string;
  status?: string;
  note?: string;
  kind?: "company" | "listing";
  targetType?: NoteTargetType;
  targetId?: string;
  body?: string;
}): Promise<{ ok: boolean; companyId?: string; note?: Row } | null> {
  try {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as { ok: boolean; companyId?: string; note?: Row };
  } catch {
    return null;
  }
}

type Tab =
  | "dashboard"
  | "users"
  | "companies"
  | "verification"
  | "listings"
  | "reports"
  | "submissions"
  | "messages"
  | "notes";

const tabs: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Platform Stats" },
  { id: "users", label: "Users" },
  { id: "companies", label: "Companies" },
  { id: "verification", label: "Verification" },
  { id: "listings", label: "Listings" },
  { id: "reports", label: "Reports" },
  { id: "submissions", label: "Intake Submissions" },
  { id: "messages", label: "Messages" },
  { id: "notes", label: "Admin Notes" },
];

function StatusBadge({ status }: { status: ModerationStatus }) {
  const styles: Record<ModerationStatus, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Suspended: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {status}
    </span>
  );
}

function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  const styles: Record<AvailabilityStatus, string> = {
    available: "bg-green-50 text-green-700 border-green-200",
    expiring: "bg-amber-50 text-amber-700 border-amber-200",
    expired: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const labels: Record<AvailabilityStatus, string> = { available: "Active", expiring: "Expiring", expired: "Expired" };
  return (
    <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const styles: Record<VerificationStatus, string> = {
    unverified: "bg-gray-100 text-gray-500 border-gray-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    verified: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<VerificationStatus, string> = {
    unverified: "Unverified",
    pending: "Pending",
    verified: "Verified",
    rejected: "Rejected",
  };
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {status === "verified" && (
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {labels[status]}
    </span>
  );
}

// A company name rendered as a link to its public profile (opens in a new tab).
function CompanyLink({ name, slug, className }: { name: string; slug?: string; className?: string }) {
  const href = `/company/${slug || companySlugFromName(name)}`;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${name} profile`}
      className={`text-blue-700 hover:underline hover:text-blue-800 cursor-pointer ${className ?? ""}`}
    >
      {name}
    </Link>
  );
}

function ReportBadge({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    reviewed: "bg-blue-50 text-blue-700 border-blue-200",
    removed: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<ReportStatus, string> = { pending: "Pending", reviewed: "Reviewed", removed: "Removed" };
  return (
    <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function SubmissionBadge({ status }: { status: SubmissionStatus }) {
  const styles: Record<SubmissionStatus, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    reviewed: "bg-green-50 text-green-700 border-green-200",
    archived: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const labels: Record<SubmissionStatus, string> = { new: "New", reviewed: "Reviewed", archived: "Archived" };
  return (
    <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-3">
      <div className={`text-2xl font-bold leading-none ${accent ?? "text-gray-900"}`}>{value}</div>
      <div className="text-[11px] text-gray-500 mt-1">{label}</div>
    </div>
  );
}

const thCls = "text-left font-semibold text-[11px] uppercase tracking-wide text-gray-500 px-3 py-2";
const tdCls = "px-3 py-2 text-[13px] text-gray-700 align-middle";
const actionBtn =
  "text-[11px] font-medium px-1.5 py-0.5 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const selectCls =
  "text-[13px] border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white";

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full sm:w-64 pl-8 pr-2.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

export default function AdminPanel({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<Tab>("dashboard");

  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [companies, setCompanies] = useState<AdminCompany[]>(adminCompanies);
  const [listings, setListings] = useState<AdminListing[]>(adminListings);
  const [reports, setReports] = useState<AdminReport[]>(adminReports);
  const [threads, setThreads] = useState<AdminThreadMeta[]>(adminThreads);
  const [notes, setNotes] = useState<AdminNote[]>(adminNotesSeed);
  const [apiStats, setApiStats] = useState<PlatformStats | null>(null);
  // True once we've loaded real data from Supabase (service-role) via the API.
  const [supabaseLive, setSupabaseLive] = useState(false);

  const [companySearch, setCompanySearch] = useState("");
  const [listingSearch, setListingSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [threadSearch, setThreadSearch] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  const [listingType, setListingType] = useState<"all" | "offer" | "need">("all");
  const [listingAvail, setListingAvail] = useState<"all" | AvailabilityStatus>("all");
  const [companyVerification, setCompanyVerification] = useState<"all" | VerificationStatus>("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | VerificationStatus>("pending");
  const [verificationSearch, setVerificationSearch] = useState("");

  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string>("");

  // Note composer state.
  const [noteType, setNoteType] = useState<NoteTargetType>("company");
  const [noteTargetId, setNoteTargetId] = useState<string>("");
  const [noteBody, setNoteBody] = useState<string>("");

  // Read the shared intake store (localStorage-backed) via an external store so
  // mutations elsewhere are reflected and there is no hydration mismatch.
  const submissions = useSyncExternalStore(subscribeSubmissions, getSubmissions, getServerSubmissions);

  // Hydrate from Supabase when configured. The /api/admin/data route returns
  // { configured:false } when Supabase env vars are absent, in which case we
  // keep the mock seed data and the demo works unchanged.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/data");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled || !json?.configured) return;

        const companyRows: Row[] = json.companies ?? [];
        const listingRows: Row[] = json.listings ?? [];
        const userRows: Row[] = json.users ?? [];
        const submissionRows: Row[] = json.submissions ?? [];
        const reportedCompanyRows: Row[] = json.reportedCompanies ?? [];
        const reportedListingRows: Row[] = json.reportedListings ?? [];
        const threadRows: Row[] = json.threads ?? [];
        const noteRows: Row[] = json.notes ?? [];

        const companyById = new Map<string, Row>();
        companyRows.forEach((c) => companyById.set(String(c.id), c));
        const listingById = new Map<string, Row>();
        listingRows.forEach((l) => listingById.set(String(l.id), l));
        const userById = new Map<string, Row>();
        userRows.forEach((u) => userById.set(String(u.id), u));

        const companyByOwner = new Map<string, string>();
        companyRows.forEach((c) => {
          if (c.owner_id) companyByOwner.set(String(c.owner_id), String(c.name ?? ""));
        });
        const listingCountByCompany = new Map<string, number>();
        listingRows.forEach((l) => {
          const cid = String(l.company_id ?? "");
          listingCountByCompany.set(cid, (listingCountByCompany.get(cid) ?? 0) + 1);
        });

        setCompanies(
          companyRows.map((c) => {
            const vstatus = asVerification(c.verification_status);
            return {
              id: String(c.id),
              slug: String(c.slug || companySlugFromName(String(c.name ?? ""))),
              name: String(c.name ?? ""),
              location: String(c.location ?? ""),
              industry: String(c.industry ?? ""),
              subcategory: String(c.subcategory ?? ""),
              contactEmail: String(c.email ?? ""),
              listings: listingCountByCompany.get(String(c.id)) ?? 0,
              joined: fmtDate(c.created_at),
              // When live, the green "Verified" badge is driven by verification_status.
              verified: c.verification_status ? vstatus === "verified" : Boolean(c.verified),
              verificationStatus: vstatus,
              status: asModeration(c.status),
            };
          }),
        );

        setListings(
          listingRows.map((l) => {
            const cid = String(l.company_id);
            const cname = String(companyById.get(cid)?.name ?? "");
            return {
              id: String(l.id),
              title: String(l.title ?? ""),
              company: cname,
              companySlug: String(companyById.get(cid)?.slug || companySlugFromName(cname)),
              type: l.type === "need" ? "need" : "offer",
              industry: String(l.industry ?? ""),
              subcategory: String(l.subcategory ?? ""),
              location: String(l.location ?? ""),
              posted: fmtDate(l.posted_at ?? l.created_at),
              status: asModeration(l.status),
              availability: asAvailability(l.availability_status),
            };
          }),
        );

        setUsers(
          userRows.map((u) => ({
            id: String(u.id),
            name: String(u.full_name ?? u.email ?? ""),
            email: String(u.email ?? ""),
            company: companyByOwner.get(String(u.id)) ?? "—",
            role: (u.role === "Owner" || u.role === "Admin" || u.role === "Member"
              ? u.role
              : "Member") as AdminUser["role"],
            joined: fmtDate(u.created_at),
            status: asModeration(u.status),
          })),
        );

        const repCompanies: AdminReport[] = reportedCompanyRows.map((r) => ({
          id: String(r.id),
          kind: "company",
          targetId: String(r.target_id),
          targetName: String(companyById.get(String(r.target_id))?.name ?? "(deleted company)"),
          reporter: String(userById.get(String(r.reporter_user_id))?.email ?? "—"),
          reason: String(r.reason ?? ""),
          status: asReportStatus(r.status),
          createdAt: String(r.created_at ?? ""),
        }));
        const repListings: AdminReport[] = reportedListingRows.map((r) => ({
          id: String(r.id),
          kind: "listing",
          targetId: String(r.target_id),
          targetName: String(listingById.get(String(r.target_id))?.title ?? "(deleted listing)"),
          reporter: String(userById.get(String(r.reporter_user_id))?.email ?? "—"),
          reason: String(r.reason ?? ""),
          status: asReportStatus(r.status),
          createdAt: String(r.created_at ?? ""),
        }));
        setReports([...repCompanies, ...repListings]);

        setThreads(
          threadRows.map((t) => {
            const flagged = Boolean(t.flagged);
            const bodyRows = Array.isArray(t.bodies) ? (t.bodies as Row[]) : [];
            return {
              id: String(t.id),
              subject: String(t.subject ?? "(no subject)"),
              companyA: "",
              companyB: String(companyById.get(String(t.company_id))?.name ?? "—"),
              participants: Array.isArray(t.participant_user_ids) ? t.participant_user_ids.length : 0,
              lastMessageAt: String(t.last_message_at ?? t.created_at ?? ""),
              messages: Number(t.message_count ?? 0),
              flagged,
              bodies: flagged
                ? bodyRows.map((b) => ({
                    from: String(userById.get(String(b.sender_user_id))?.email ?? "user"),
                    text: String(b.body ?? ""),
                    at: String(b.created_at ?? ""),
                  }))
                : undefined,
            };
          }),
        );

        setNotes(
          noteRows.map((n) => {
            const tt = (n.target_type === "user" || n.target_type === "listing" ? n.target_type : "company") as NoteTargetType;
            let label = String(n.target_id);
            if (tt === "company") label = String(companyById.get(String(n.target_id))?.name ?? label);
            else if (tt === "listing") label = String(listingById.get(String(n.target_id))?.title ?? label);
            else label = String(userById.get(String(n.target_id))?.email ?? label);
            return {
              id: String(n.id),
              targetType: tt,
              targetId: String(n.target_id),
              targetLabel: label,
              body: String(n.body ?? ""),
              author: String(userById.get(String(n.author_user_id))?.email ?? "admin"),
              createdAt: String(n.created_at ?? ""),
            };
          }),
        );

        if (json.stats) setApiStats(json.stats as PlatformStats);

        replaceSubmissions(submissionRows.map(mapDbRowToSubmission));
        setSupabaseLive(true);
      } catch {
        // network/parse error — keep mock data
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats: PlatformStats = useMemo(() => {
    const pendingVerification = companies.filter((c) => c.verificationStatus === "pending").length;
    if (apiStats) return { ...apiStats, pendingVerification };
    return {
      users: users.length,
      companies: companies.length,
      listings: listings.length,
      offerListings: listings.filter((l) => l.type === "offer").length,
      needListings: listings.filter((l) => l.type === "need").length,
      activeListings: listings.filter((l) => l.availability === "available").length,
      messages: threads.reduce((sum, t) => sum + t.messages, 0),
      newSignups: mockPlatformStats.newSignups,
      pendingVerification: companies.filter((c) => c.verificationStatus === "pending").length,
    };
  }, [apiStats, users, companies, listings, threads]);

  const pendingCount = useMemo(
    () =>
      companies.filter((c) => c.status === "Pending").length +
      listings.filter((l) => l.status === "Pending").length,
    [companies, listings],
  );
  const openReports = useMemo(() => reports.filter((r) => r.status === "pending").length, [reports]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [u.name, u.email, u.company].some((f) => f.toLowerCase().includes(q)));
  }, [users, userSearch]);

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    return companies.filter((c) => {
      if (companyVerification !== "all" && c.verificationStatus !== companyVerification) return false;
      if (!q) return true;
      return [c.name, c.location, c.industry, c.subcategory, c.contactEmail].some((f) => f.toLowerCase().includes(q));
    });
  }, [companies, companySearch, companyVerification]);

  const verificationQueue = useMemo(() => {
    const q = verificationSearch.trim().toLowerCase();
    return companies.filter((c) => {
      if (verificationFilter !== "all" && c.verificationStatus !== verificationFilter) return false;
      if (!q) return true;
      return [c.name, c.location, c.industry, c.contactEmail].some((f) => f.toLowerCase().includes(q));
    });
  }, [companies, verificationFilter, verificationSearch]);

  const filteredListings = useMemo(() => {
    const q = listingSearch.trim().toLowerCase();
    return listings.filter((l) => {
      if (listingType !== "all" && l.type !== listingType) return false;
      if (listingAvail !== "all" && l.availability !== listingAvail) return false;
      if (!q) return true;
      return [l.title, l.company, l.industry, l.subcategory, l.location].some((f) => f.toLowerCase().includes(q));
    });
  }, [listings, listingSearch, listingType, listingAvail]);

  const filteredReports = useMemo(() => {
    const q = reportSearch.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => [r.targetName, r.reporter, r.reason].some((f) => f.toLowerCase().includes(q)));
  }, [reports, reportSearch]);

  const filteredThreads = useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => [t.subject, t.companyA, t.companyB].some((f) => f.toLowerCase().includes(q)));
  }, [threads, threadSearch]);

  const filteredNotes = useMemo(() => {
    const q = noteSearch.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => [n.targetLabel, n.body, n.author].some((f) => f.toLowerCase().includes(q)));
  }, [notes, noteSearch]);

  // ── mutations (optimistic local + guarded Supabase persistence) ──────────────
  const setUserStatusLocal = (id: string, status: ModerationStatus) => {
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, status } : u)));
    if (supabaseLive) void postAdminAction({ entity: "user", action: "status", id, status });
  };

  const setCompanyStatus = (id: string, status: ModerationStatus) => {
    setCompanies((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
    if (supabaseLive) void postAdminAction({ entity: "company", action: "status", id, status });
  };
  const removeCompany = (id: string) => {
    setCompanies((p) => p.filter((c) => c.id !== id));
    if (supabaseLive) void postAdminAction({ entity: "company", action: "delete", id });
  };

  // Add a note to local state (and persist when live). Shared by the Notes tab
  // composer and the verification reject flow.
  const pushNote = (targetType: NoteTargetType, targetId: string, targetLabel: string, body: string) => {
    const optimistic: AdminNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetType,
      targetId,
      targetLabel,
      body,
      author: adminEmail,
      createdAt: new Date().toISOString(),
    };
    setNotes((p) => [optimistic, ...p]);
    if (supabaseLive) void postAdminAction({ entity: "note", action: "note", targetType, targetId, body });
  };

  const setVerification = (company: AdminCompany, status: VerificationStatus) => {
    let reason: string | undefined;
    if (status === "rejected") {
      const input = window.prompt("Reason for rejecting verification (recorded as an admin note):", "");
      if (input === null) return; // cancelled
      reason = input.trim();
    }
    setCompanies((p) =>
      p.map((c) => (c.id === company.id ? { ...c, verificationStatus: status, verified: status === "verified" } : c)),
    );
    if (status === "rejected" && reason) {
      pushNote("company", company.id, company.name, `Verification rejected: ${reason}`);
    }
    const labels: Record<VerificationStatus, string> = {
      unverified: "reset to unverified",
      pending: "marked pending review",
      verified: "verified",
      rejected: "rejected",
    };
    setActionMsg(`${company.name} ${labels[status]}.`);
    if (supabaseLive) {
      void postAdminAction({ entity: "company", action: "verify", id: company.id, status, note: reason });
    }
  };

  const setListingStatus = (id: string, status: ModerationStatus) => {
    setListings((p) => p.map((l) => (l.id === id ? { ...l, status } : l)));
    if (supabaseLive) void postAdminAction({ entity: "listing", action: "status", id, status });
  };
  const removeListing = (id: string) => {
    setListings((p) => p.filter((l) => l.id !== id));
    if (supabaseLive) void postAdminAction({ entity: "listing", action: "delete", id });
  };

  const setReportStatusLocal = (report: AdminReport, status: ReportStatus) => {
    setReports((p) => p.map((r) => (r.id === report.id ? { ...r, status } : r)));
    if (supabaseLive) void postAdminAction({ entity: "report", action: "status", id: report.id, kind: report.kind, status });
  };
  const removeReportedContent = (report: AdminReport) => {
    setReports((p) => p.map((r) => (r.id === report.id ? { ...r, status: "removed" } : r)));
    // Reflect the content suspension in the relevant table locally too.
    if (report.kind === "company") {
      setCompanies((p) => p.map((c) => (c.id === report.targetId ? { ...c, status: "Suspended" } : c)));
    } else {
      setListings((p) => p.map((l) => (l.id === report.targetId ? { ...l, status: "Suspended" } : l)));
    }
    if (supabaseLive) void postAdminAction({ entity: "report", action: "remove", id: report.id, kind: report.kind });
  };

  const setSubStatus = (id: string, status: SubmissionStatus) => {
    updateSubmissionStatus(id, status);
    if (supabaseLive) void postAdminAction({ entity: "intake", action: "status", id, status });
  };
  const removeSub = (id: string) => {
    deleteSubmission(id);
    if (supabaseLive) void postAdminAction({ entity: "intake", action: "delete", id });
  };
  const saveSubNote = (id: string, note: string) => {
    updateSubmissionNote(id, note);
    setActionMsg("Note saved.");
    if (supabaseLive) void postAdminAction({ entity: "intake", action: "note", id, note });
  };
  const convertSub = (id: string) => {
    if (supabaseLive) {
      void postAdminAction({ entity: "intake", action: "convert", id }).then((r) => {
        setActionMsg(r?.ok ? "Created a Pending company draft from this submission." : "Convert failed.");
      });
      updateSubmissionStatus(id, "reviewed");
    } else {
      setActionMsg("Convert to company — coming soon (connect Supabase to enable drafts).");
    }
  };

  const addNote = () => {
    const body = noteBody.trim();
    if (!body || !noteTargetId) {
      setActionMsg("Pick a target and write a note first.");
      return;
    }
    const targetLabel =
      noteType === "company"
        ? companies.find((c) => c.id === noteTargetId)?.name ?? noteTargetId
        : noteType === "listing"
          ? listings.find((l) => l.id === noteTargetId)?.title ?? noteTargetId
          : users.find((u) => u.id === noteTargetId)?.email ?? noteTargetId;

    pushNote(noteType, noteTargetId, targetLabel, body);
    setNoteBody("");
    setActionMsg("Note added.");
  };

  const noteTargetOptions = useMemo(() => {
    if (noteType === "company") return companies.map((c) => ({ id: c.id, label: c.name }));
    if (noteType === "listing") return listings.map((l) => ({ id: l.id, label: l.title }));
    return users.map((u) => ({ id: u.id, label: `${u.name} · ${u.email}` }));
  }, [noteType, companies, listings, users]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-400">
            Platform owner controls · signed in as {adminEmail}
            {supabaseLive ? " · live (Supabase)" : " · demo data"}
          </p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-1">
          Owner Access
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-[13px] -mb-px border-b-2 transition-colors ${
              tab === t.id
                ? "border-blue-700 text-blue-700 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
            {t.id === "submissions" && submissions.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5">
                {submissions.length}
              </span>
            )}
            {t.id === "reports" && openReports > 0 && (
              <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">
                {openReports}
              </span>
            )}
            {t.id === "verification" && stats.pendingVerification > 0 && (
              <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">
                {stats.pendingVerification}
              </span>
            )}
          </button>
        ))}
      </div>

      {actionMsg && (
        <div className="mb-3 flex items-center justify-between gap-2 text-[12px] bg-blue-50 border border-blue-100 text-blue-800 rounded px-3 py-2">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg("")} className="text-blue-500 hover:text-blue-700">
            Dismiss
          </button>
        </div>
      )}

      {/* ── PLATFORM STATS ── */}
      {tab === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Users" value={stats.users} accent="text-blue-700" />
            <StatCard label="Total Companies" value={stats.companies} accent="text-blue-700" />
            <StatCard label="Total Listings" value={stats.listings} accent="text-blue-700" />
            <StatCard label="Active Listings" value={stats.activeListings} accent="text-green-700" />
            <StatCard label="Offer Listings" value={stats.offerListings} accent="text-green-700" />
            <StatCard label="Need Listings" value={stats.needListings} accent="text-orange-600" />
            <StatCard label="Messages" value={stats.messages} accent="text-gray-900" />
            <StatCard label="New Signups (30d)" value={stats.newSignups} accent="text-blue-700" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Pending Approvals" value={pendingCount} accent="text-amber-600" />
            <StatCard label="Pending Verification" value={stats.pendingVerification} accent="text-amber-600" />
            <StatCard label="Open Reports" value={openReports} accent="text-red-600" />
            <StatCard label="Intake Submissions" value={submissions.length} accent="text-green-700" />
          </div>

          <div className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Pending Approvals</h2>
            {companies.filter((c) => c.status === "Pending").length === 0 &&
            listings.filter((l) => l.status === "Pending").length === 0 ? (
              <p className="text-[13px] text-gray-400">Nothing waiting for review.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {companies
                  .filter((c) => c.status === "Pending")
                  .map((c) => (
                    <li key={c.id} className="flex items-center justify-between py-2">
                      <span className="text-[13px] text-gray-700">
                        <span className="text-gray-400">Company ·</span> {c.name}
                      </span>
                      <button
                        onClick={() => setCompanyStatus(c.id, "Approved")}
                        className={`${actionBtn} border-green-300 text-green-700 hover:bg-green-50`}
                      >
                        Approve
                      </button>
                    </li>
                  ))}
                {listings
                  .filter((l) => l.status === "Pending")
                  .map((l) => (
                    <li key={l.id} className="flex items-center justify-between py-2">
                      <span className="text-[13px] text-gray-700">
                        <span className="text-gray-400">Listing ·</span> {l.title}
                      </span>
                      <button
                        onClick={() => setListingStatus(l.id, "Approved")}
                        className={`${actionBtn} border-green-300 text-green-700 hover:bg-green-50`}
                      >
                        Approve
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === "users" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
            <SearchBox value={userSearch} onChange={setUserSearch} placeholder="Search users..." />
          </div>
          <div className="bg-white border border-gray-200 rounded overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Email</th>
                  <th className={thCls}>Company</th>
                  <th className={thCls}>Role</th>
                  <th className={thCls}>Joined</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className={`${tdCls} font-medium text-gray-900`}>{u.name}</td>
                    <td className={tdCls}>{u.email}</td>
                    <td className={tdCls}>{u.company}</td>
                    <td className={tdCls}>{u.role}</td>
                    <td className={`${tdCls} text-gray-400`}>{u.joined}</td>
                    <td className={tdCls}><StatusBadge status={u.status} /></td>
                    <td className={`${tdCls} text-right whitespace-nowrap`}>
                      {u.status === "Suspended" ? (
                        <button
                          onClick={() => setUserStatusLocal(u.id, "Approved")}
                          className={`${actionBtn} border-green-300 text-green-700 hover:bg-green-50`}
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => setUserStatusLocal(u.id, "Suspended")}
                          className={`${actionBtn} border-red-300 text-red-700 hover:bg-red-50`}
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-[13px] text-gray-400">No users match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── COMPANIES ── */}
      {tab === "companies" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Companies ({filteredCompanies.length})</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={companyVerification}
                onChange={(e) => setCompanyVerification(e.target.value as typeof companyVerification)}
                className={selectCls}
              >
                <option value="all">All verification</option>
                <option value="unverified">Unverified</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <SearchBox value={companySearch} onChange={setCompanySearch} placeholder="Search companies..." />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Company</th>
                  <th className={thCls}>Location</th>
                  <th className={thCls}>Industry</th>
                  <th className={thCls}>Listings</th>
                  <th className={thCls}>Verification</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60">
                    <td className={`${tdCls} font-medium`}>
                      <CompanyLink name={c.name} slug={c.slug} />
                      {c.verified && <span className="ml-1 text-blue-600" title="Verified">✓</span>}
                      <div className="text-[11px] text-gray-400 font-normal">{c.contactEmail}</div>
                    </td>
                    <td className={tdCls}>{c.location}</td>
                    <td className={tdCls}>
                      {c.industry}
                      <div className="text-[11px] text-gray-400">{c.subcategory}</div>
                    </td>
                    <td className={tdCls}>{c.listings}</td>
                    <td className={tdCls}><VerificationBadge status={c.verificationStatus} /></td>
                    <td className={tdCls}><StatusBadge status={c.status} /></td>
                    <td className={`${tdCls} text-right whitespace-nowrap`}>
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => setCompanyStatus(c.id, "Approved")}
                          disabled={c.status === "Approved"}
                          className={`${actionBtn} border-green-300 text-green-700 hover:bg-green-50`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setCompanyStatus(c.id, "Suspended")}
                          disabled={c.status === "Suspended"}
                          className={`${actionBtn} border-amber-300 text-amber-700 hover:bg-amber-50`}
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => removeCompany(c.id)}
                          className={`${actionBtn} border-red-300 text-red-700 hover:bg-red-50`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCompanies.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-[13px] text-gray-400">No companies match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VERIFICATION ── */}
      {tab === "verification" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Verification Queue ({verificationQueue.length})</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as typeof verificationFilter)}
                className={selectCls}
              >
                <option value="pending">Pending review</option>
                <option value="unverified">Unverified</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
              <SearchBox value={verificationSearch} onChange={setVerificationSearch} placeholder="Search companies..." />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 -mt-1">
            Manual admin verification — independent of Approve/Suspend moderation. Rejections record an admin note.
          </p>
          <div className="bg-white border border-gray-200 rounded overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Company</th>
                  <th className={thCls}>Industry</th>
                  <th className={thCls}>Verification</th>
                  <th className={thCls}>Moderation</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {verificationQueue.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60">
                    <td className={`${tdCls} font-medium`}>
                      <CompanyLink name={c.name} slug={c.slug} />
                      <div className="text-[11px] text-gray-400 font-normal">{c.location}</div>
                    </td>
                    <td className={tdCls}>
                      {c.industry}
                      <div className="text-[11px] text-gray-400">{c.subcategory}</div>
                    </td>
                    <td className={tdCls}><VerificationBadge status={c.verificationStatus} /></td>
                    <td className={tdCls}><StatusBadge status={c.status} /></td>
                    <td className={`${tdCls} text-right whitespace-nowrap`}>
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => setVerification(c, "pending")}
                          disabled={c.verificationStatus === "pending"}
                          className={`${actionBtn} border-amber-300 text-amber-700 hover:bg-amber-50`}
                          title="Request docs / mark pending review"
                        >
                          Mark Pending
                        </button>
                        <button
                          onClick={() => setVerification(c, "verified")}
                          disabled={c.verificationStatus === "verified"}
                          className={`${actionBtn} border-green-300 text-green-700 hover:bg-green-50`}
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => setVerification(c, "rejected")}
                          disabled={c.verificationStatus === "rejected"}
                          className={`${actionBtn} border-red-300 text-red-700 hover:bg-red-50`}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {verificationQueue.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-[13px] text-gray-400">
                      No companies in this verification state.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LISTINGS ── */}
      {tab === "listings" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Listings ({filteredListings.length})</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select value={listingType} onChange={(e) => setListingType(e.target.value as typeof listingType)} className={selectCls}>
                <option value="all">All types</option>
                <option value="offer">Offer</option>
                <option value="need">Need</option>
              </select>
              <select value={listingAvail} onChange={(e) => setListingAvail(e.target.value as typeof listingAvail)} className={selectCls}>
                <option value="all">All availability</option>
                <option value="available">Active</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
              </select>
              <SearchBox value={listingSearch} onChange={setListingSearch} placeholder="Search listings..." />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Listing</th>
                  <th className={thCls}>Company</th>
                  <th className={thCls}>Type</th>
                  <th className={thCls}>Availability</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/60">
                    <td className={`${tdCls} font-medium text-gray-900`}>
                      {l.title}
                      <div className="text-[11px] text-gray-400 font-normal">{l.location} · {l.posted}</div>
                    </td>
                    <td className={tdCls}>
                      {l.company ? <CompanyLink name={l.company} slug={l.companySlug} /> : "—"}
                    </td>
                    <td className={tdCls}>
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${l.type === "offer" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                        {l.type === "offer" ? "Offer" : "Need"}
                      </span>
                    </td>
                    <td className={tdCls}><AvailabilityBadge status={l.availability} /></td>
                    <td className={tdCls}><StatusBadge status={l.status} /></td>
                    <td className={`${tdCls} text-right whitespace-nowrap`}>
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => setListingStatus(l.id, "Approved")}
                          disabled={l.status === "Approved"}
                          className={`${actionBtn} border-green-300 text-green-700 hover:bg-green-50`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setListingStatus(l.id, "Suspended")}
                          disabled={l.status === "Suspended"}
                          className={`${actionBtn} border-amber-300 text-amber-700 hover:bg-amber-50`}
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => removeListing(l.id)}
                          className={`${actionBtn} border-red-300 text-red-700 hover:bg-red-50`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredListings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-[13px] text-gray-400">No listings match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REPORTS ── */}
      {tab === "reports" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Reports ({filteredReports.length})</h2>
            <SearchBox value={reportSearch} onChange={setReportSearch} placeholder="Search reports..." />
          </div>
          <div className="bg-white border border-gray-200 rounded overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Type</th>
                  <th className={thCls}>Target</th>
                  <th className={thCls}>Reason</th>
                  <th className={thCls}>Reporter</th>
                  <th className={thCls}>Reported</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 align-top">
                    <td className={tdCls}>
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded border bg-gray-50 text-gray-600 border-gray-200 capitalize">
                        {r.kind}
                      </span>
                    </td>
                    <td className={`${tdCls} font-medium`}>
                      {r.kind === "company" ? (
                        <CompanyLink
                          name={r.targetName}
                          slug={companies.find((c) => c.id === r.targetId)?.slug}
                        />
                      ) : (
                        <span className="text-gray-900">{r.targetName}</span>
                      )}
                    </td>
                    <td className={`${tdCls} max-w-[280px]`}>{r.reason}</td>
                    <td className={tdCls}>{r.reporter}</td>
                    <td className={`${tdCls} text-gray-400 whitespace-nowrap`}>{fmtDate(r.createdAt)}</td>
                    <td className={tdCls}><ReportBadge status={r.status} /></td>
                    <td className={`${tdCls} text-right whitespace-nowrap`}>
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => setReportStatusLocal(r, "reviewed")}
                          disabled={r.status !== "pending"}
                          className={`${actionBtn} border-blue-300 text-blue-700 hover:bg-blue-50`}
                        >
                          Mark reviewed
                        </button>
                        <button
                          onClick={() => removeReportedContent(r)}
                          disabled={r.status === "removed"}
                          className={`${actionBtn} border-red-300 text-red-700 hover:bg-red-50`}
                        >
                          Remove content
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-[13px] text-gray-400">No reports.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INTAKE SUBMISSIONS ── */}
      {tab === "submissions" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Intake Submissions ({submissions.length})</h2>
          <p className="text-[11px] text-gray-400 -mt-1">
            Submitted through the public intake form at <span className="font-mono">/intake</span>.
          </p>
          <div className="bg-white border border-gray-200 rounded overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Company</th>
                  <th className={thCls}>Contact</th>
                  <th className={thCls}>Industry</th>
                  <th className={thCls}>Resources</th>
                  <th className={thCls}>Admin Note</th>
                  <th className={thCls}>Submitted</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 align-top">
                    <td className={`${tdCls} font-medium text-gray-900`}>
                      {s.companyName}
                      <div className="text-[11px] text-gray-400 font-normal">{s.location || "—"}</div>
                    </td>
                    <td className={tdCls}>
                      {s.contactName}
                      <div className="text-[11px] text-gray-400">{s.email}</div>
                      {s.phone && <div className="text-[11px] text-gray-400">{s.phone}</div>}
                      <div className="text-[11px] text-gray-400">Prefers: {s.preferredContact}</div>
                    </td>
                    <td className={tdCls}>
                      {s.industry || "—"}
                      {s.subcategory && <div className="text-[11px] text-gray-400">{s.subcategory}</div>}
                    </td>
                    <td className={`${tdCls} max-w-[240px]`}>
                      {s.resourcesOffered && (
                        <div className="text-[12px]"><span className="text-green-600 font-medium">Has: </span>{s.resourcesOffered}</div>
                      )}
                      {s.resourcesSought && (
                        <div className="text-[12px] mt-1"><span className="text-orange-600 font-medium">Seeks: </span>{s.resourcesSought}</div>
                      )}
                    </td>
                    <td className={`${tdCls} max-w-[200px]`}>
                      <textarea
                        defaultValue={s.adminNote ?? ""}
                        placeholder="Add note…"
                        onBlur={(e) => {
                          if (e.target.value !== (s.adminNote ?? "")) saveSubNote(s.id, e.target.value);
                        }}
                        className="w-full text-[12px] border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </td>
                    <td className={`${tdCls} text-gray-400 whitespace-nowrap`}>
                      {new Date(s.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className={tdCls}><SubmissionBadge status={s.status} /></td>
                    <td className={`${tdCls} text-right whitespace-nowrap`}>
                      <div className="inline-flex flex-col items-end gap-1">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => setSubStatus(s.id, "reviewed")}
                            disabled={s.status === "reviewed"}
                            className={`${actionBtn} border-green-300 text-green-700 hover:bg-green-50`}
                          >
                            Reviewed
                          </button>
                          <button
                            onClick={() => setSubStatus(s.id, "archived")}
                            disabled={s.status === "archived"}
                            className={`${actionBtn} border-gray-300 text-gray-600 hover:bg-gray-50`}
                          >
                            Archive
                          </button>
                        </div>
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => convertSub(s.id)}
                            className={`${actionBtn} border-blue-300 text-blue-700 hover:bg-blue-50`}
                          >
                            Convert to company
                          </button>
                          <button
                            onClick={() => removeSub(s.id)}
                            className={`${actionBtn} border-red-300 text-red-700 hover:bg-red-50`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-[13px] text-gray-400">
                      No submissions yet. Try the public form at <span className="font-mono">/intake</span>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MESSAGES METADATA ── */}
      {tab === "messages" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Message Threads ({filteredThreads.length})</h2>
            <SearchBox value={threadSearch} onChange={setThreadSearch} placeholder="Search threads..." />
          </div>
          <p className="text-[11px] text-gray-400 -mt-1">
            Metadata only. Message bodies are hidden unless a thread is flagged for abuse/report review.
          </p>
          <div className="bg-white border border-gray-200 rounded overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Subject</th>
                  <th className={thCls}>Parties</th>
                  <th className={thCls}>Participants</th>
                  <th className={thCls}>Messages</th>
                  <th className={thCls}>Last activity</th>
                  <th className={thCls}>Flag</th>
                  <th className={`${thCls} text-right`}>Bodies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredThreads.map((t) => (
                  <Fragment key={t.id}>
                    <tr className="hover:bg-gray-50/60">
                      <td className={`${tdCls} font-medium text-gray-900`}>{t.subject}</td>
                      <td className={tdCls}>{[t.companyA, t.companyB].filter(Boolean).join(" ↔ ") || "—"}</td>
                      <td className={tdCls}>{t.participants}</td>
                      <td className={tdCls}>{t.messages}</td>
                      <td className={`${tdCls} text-gray-400 whitespace-nowrap`}>{fmtDate(t.lastMessageAt)}</td>
                      <td className={tdCls}>
                        {t.flagged ? (
                          <span className="inline-block text-[11px] font-medium px-1.5 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
                            Flagged
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className={`${tdCls} text-right whitespace-nowrap`}>
                        <button
                          onClick={() => setExpandedThread(expandedThread === t.id ? null : t.id)}
                          disabled={!t.flagged}
                          title={t.flagged ? "View flagged thread bodies" : "Bodies are private unless flagged"}
                          className={`${actionBtn} border-gray-300 text-gray-600 hover:bg-gray-50`}
                        >
                          {expandedThread === t.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {expandedThread === t.id && t.flagged && (
                      <tr className="bg-red-50/30">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="text-[11px] uppercase tracking-wide text-red-600 font-semibold mb-2">
                            Flagged thread — message bodies (abuse review)
                          </div>
                          <div className="space-y-2">
                            {(t.bodies ?? []).map((b, i) => (
                              <div key={i} className="text-[12px] text-gray-700">
                                <span className="font-medium text-gray-900">{b.from}</span>
                                <span className="text-gray-400"> · {fmtDate(b.at)}</span>
                                <div>{b.text}</div>
                              </div>
                            ))}
                            {(t.bodies ?? []).length === 0 && (
                              <div className="text-[12px] text-gray-400">No message bodies available.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {filteredThreads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-[13px] text-gray-400">No threads.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADMIN NOTES ── */}
      {tab === "notes" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Add internal note</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={noteType}
                onChange={(e) => {
                  setNoteType(e.target.value as NoteTargetType);
                  setNoteTargetId("");
                }}
                className={selectCls}
              >
                <option value="company">Company</option>
                <option value="listing">Listing</option>
                <option value="user">User</option>
              </select>
              <select value={noteTargetId} onChange={(e) => setNoteTargetId(e.target.value)} className={`${selectCls} sm:col-span-2`}>
                <option value="">Select {noteType}…</option>
                {noteTargetOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Internal note (visible to admins only)…"
              rows={3}
              className="mt-2 w-full text-[13px] border border-gray-300 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={addNote}
                className="text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded px-3 py-1.5"
              >
                Add note
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Notes ({filteredNotes.length})</h2>
            <SearchBox value={noteSearch} onChange={setNoteSearch} placeholder="Search notes..." />
          </div>
          <div className="bg-white border border-gray-200 rounded overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Target</th>
                  <th className={thCls}>Note</th>
                  <th className={thCls}>Author</th>
                  <th className={thCls}>Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredNotes.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50/60 align-top">
                    <td className={`${tdCls} font-medium text-gray-900`}>
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 block">{n.targetType}</span>
                      {n.targetLabel}
                    </td>
                    <td className={`${tdCls} max-w-[420px]`}>{n.body}</td>
                    <td className={tdCls}>{n.author}</td>
                    <td className={`${tdCls} text-gray-400 whitespace-nowrap`}>{fmtDate(n.createdAt)}</td>
                  </tr>
                ))}
                {filteredNotes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-[13px] text-gray-400">No notes yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
