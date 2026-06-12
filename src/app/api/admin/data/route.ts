import { NextResponse } from "next/server";
import {
  adminConfigured,
  seedAdminUsers,
  fetchUsers,
  fetchCompanies,
  fetchListings,
  fetchIntakeSubmissions,
  fetchMessagesMeta,
  fetchReportedCompanies,
  fetchReportedListings,
  fetchThreadsMeta,
  fetchAdminNotes,
  getPlatformStats,
} from "@/lib/db/admin";
import { getAuthorizedAdminEmail } from "../_auth";
import { withTimeout } from "@/lib/withTimeout";

// Force the route to be dynamic (it depends on the request's auth cookies).
export const dynamic = "force-dynamic";

// Per-await guards so a slow/hung Supabase call can never make the route (and
// therefore the /admin page that fetches it) hang. The page already treats a
// failed/empty response as "keep mock data", so timing out degrades gracefully.
const AUTH_TIMEOUT_MS = 8000;
const QUERY_TIMEOUT_MS = 12000;

// GET /api/admin/data
// Returns all admin datasets from Supabase (service-role). When Supabase is not
// configured, responds with { configured: false } so the AdminPanel falls back
// to its existing mock data without error.
export async function GET() {
  if (!adminConfigured()) {
    return NextResponse.json({ configured: false });
  }
  const email = await withTimeout(getAuthorizedAdminEmail(), AUTH_TIMEOUT_MS, null);
  if (!email) {
    return NextResponse.json({ configured: true, error: "unauthorized" }, { status: 403 });
  }

  // Keep admin_users in sync with ADMIN_EMAILS so is_admin() RLS works too.
  await withTimeout(seedAdminUsers(), QUERY_TIMEOUT_MS, { ok: false, count: 0 });

  const [
    users,
    companies,
    listings,
    submissions,
    messagesMeta,
    reportedCompanies,
    reportedListings,
    threads,
    notes,
    stats,
  ] = await Promise.all([
    withTimeout(fetchUsers(), QUERY_TIMEOUT_MS, null),
    withTimeout(fetchCompanies(), QUERY_TIMEOUT_MS, null),
    withTimeout(fetchListings(), QUERY_TIMEOUT_MS, null),
    withTimeout(fetchIntakeSubmissions(), QUERY_TIMEOUT_MS, null),
    withTimeout(fetchMessagesMeta(), QUERY_TIMEOUT_MS, null),
    withTimeout(fetchReportedCompanies(), QUERY_TIMEOUT_MS, null),
    withTimeout(fetchReportedListings(), QUERY_TIMEOUT_MS, null),
    withTimeout(fetchThreadsMeta(), QUERY_TIMEOUT_MS, null),
    withTimeout(fetchAdminNotes(), QUERY_TIMEOUT_MS, null),
    withTimeout(getPlatformStats(), QUERY_TIMEOUT_MS, null),
  ]);

  return NextResponse.json({
    configured: true,
    users: users ?? [],
    companies: companies ?? [],
    listings: listings ?? [],
    submissions: submissions ?? [],
    messagesMeta: messagesMeta ?? [],
    reportedCompanies: reportedCompanies ?? [],
    reportedListings: reportedListings ?? [],
    threads: threads ?? [],
    notes: notes ?? [],
    stats: stats ?? null,
  });
}
