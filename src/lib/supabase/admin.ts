import "server-only";

// ──────────────────────────────────────────────────────────────────────────────
// Admin / service-role Supabase client (SERVER-ONLY)
//
// ⚠️  This client uses the SERVICE ROLE key, which bypasses Row Level Security.
//     It must NEVER be imported into a client component or shipped to the
//     browser. The `import "server-only"` above makes Next.js throw at build
//     time if this module is ever pulled into a client bundle.
//
// Use it only for trusted server-side admin operations (the /admin panel reads,
// moderation actions, seeding admin_users, etc.). Returns `null` when the
// service-role env vars are absent so callers fall back to mock data.
// ──────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  isSupabaseAdminConfigured,
  warnOnce,
} from "./config";

let adminClient: SupabaseClient | null = null;

/**
 * Returns a singleton service-role Supabase client, or `null` if the
 * service-role env vars are not configured. SERVER-ONLY.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) {
    warnOnce(
      "admin",
      "Admin (service-role) client unavailable — NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Using mock data fallback.",
    );
    return null;
  }
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
