// ──────────────────────────────────────────────────────────────────────────────
// Supabase configuration / env detection
//
// CapMaxx is designed to run with OR without Supabase configured. When the env
// vars below are missing, every Supabase client factory returns `null` and the
// app falls back to its existing demo / mock / localStorage behavior. This file
// centralizes the "is Supabase configured?" checks so the rest of the codebase
// can guard cleanly and we only warn once per process.
// ──────────────────────────────────────────────────────────────────────────────

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
// Service-role key is server-only. NEVER reference this from client components.
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** True when the public (browser/anon) Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** True when the server-only service-role key is present (admin operations). */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

// Warn-once helpers so a missing config logs a single, clear message instead of
// spamming the console on every render / request.
const warned = new Set<string>();
export function warnOnce(key: string, message: string): void {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[CapMaxx · Supabase] ${message}`);
}
