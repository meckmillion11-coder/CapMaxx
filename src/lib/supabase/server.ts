import "server-only";

// ──────────────────────────────────────────────────────────────────────────────
// Server Supabase client (cookies, anon key)
//
// Use from Server Components, Route Handlers, and Server Actions. Reads/writes
// the Supabase auth cookies so the signed-in user's session (and therefore RLS)
// is respected. Returns `null` when Supabase is not configured.
//
// NOTE: In Next.js App Router, cookies() is async — hence this factory is async.
// ──────────────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
  warnOnce,
} from "./config";

/**
 * Returns a request-scoped server Supabase client bound to the auth cookies, or
 * `null` if Supabase is not configured.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) {
    warnOnce(
      "server",
      "Server client unavailable — NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Using demo/local fallback.",
    );
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components, setting cookies throws — that's expected and can
        // be ignored. Middleware / Route Handlers / Server Actions can persist
        // refreshed sessions. We swallow the error so reads never crash a page.
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // no-op: read-only context (Server Component render)
        }
      },
    },
  });
}
