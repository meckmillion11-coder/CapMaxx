import "server-only";

// Shared authorization for the admin API routes. Authorization is twofold and
// mirrors the /admin route's env-based gate:
//   1. The signed-in Supabase session's email must be in ADMIN_EMAILS.
//   2. (DB-side) is_admin() additionally checks admin_users for RLS — but these
//      routes use the service-role client which bypasses RLS, so the email gate
//      below is the trust boundary. Never trust a client-supplied email here.

import { getSupabaseServerClient } from "@/lib/supabase/server";

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Returns the authorized admin email, or null if the request isn't authorized. */
export async function getAuthorizedAdminEmail(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null; // not configured
  const { data } = await supabase.auth.getUser();
  const email = data?.user?.email?.toLowerCase();
  if (!email) return null;
  return getAdminEmails().includes(email) ? email : null;
}
