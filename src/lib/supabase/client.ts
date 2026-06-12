"use client";

// ──────────────────────────────────────────────────────────────────────────────
// Browser Supabase client (anon key)
//
// Safe to import from client components. Returns `null` when Supabase env vars
// are absent so callers can fall back to demo behavior without crashing.
// ──────────────────────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
  warnOnce,
} from "./config";

let browserClient: SupabaseClient | null = null;

/**
 * Returns a singleton browser Supabase client, or `null` if Supabase is not
 * configured (missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    warnOnce(
      "browser",
      "Browser client unavailable — NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Using demo/local fallback.",
    );
    return null;
  }
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}
