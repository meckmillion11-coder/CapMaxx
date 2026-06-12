import Link from "next/link";
import AdminPanel from "@/components/admin/AdminPanel";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthorizedAdminEmail } from "../api/admin/_auth";
import { withTimeout } from "@/lib/withTimeout";

// ──────────────────────────────────────────────────────────────────────────────
// Admin Panel access gating (real session)
//
// Authorization is derived from the signed-in Supabase session, not a hardcoded
// email. The allowed-admins list comes from process.env.ADMIN_EMAILS.
//
//   - Supabase NOT configured → render the panel on mock data with a clear
//     "Supabase not configured" notice (dev keeps working).
//   - Configured + session email in ADMIN_EMAILS → full panel (live data).
//   - Configured + not authorized → access denied. (Unauthenticated users never
//     reach here: middleware redirects them to /signin first.)
// ──────────────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

function AccessDenied() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md w-full shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-1.5">Access denied</h1>
        <p className="text-[13px] text-gray-500 mb-6">
          You are not authorized to view the CapMaxx admin panel. This area is restricted to platform
          owners.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function NotConfiguredNotice() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 pt-5">
      <div className="flex items-start gap-2 text-[12px] bg-amber-50 border border-amber-200 text-amber-800 rounded px-3 py-2">
        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span>
          Supabase is not configured — showing demo data. Add{" "}
          <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span>,{" "}
          <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> and{" "}
          <span className="font-mono">ADMIN_EMAILS</span> to <span className="font-mono">.env.local</span>{" "}
          to enable live admin access and persistence.
        </span>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  // Dev fallback: no Supabase → keep the panel usable on mock data, but make it
  // explicit that this isn't a real authenticated owner session.
  if (!isSupabaseConfigured()) {
    return (
      <>
        <NotConfiguredNotice />
        <AdminPanel adminEmail="demo@capmaxx.com (mock)" />
      </>
    );
  }

  const email = await withTimeout(getAuthorizedAdminEmail(), 8000, null);
  if (!email) {
    return <AccessDenied />;
  }
  return <AdminPanel adminEmail={email} />;
}
