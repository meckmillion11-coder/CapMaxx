"use client";

// Small client-side helpers shared by the db/* modules. Every helper degrades
// gracefully: when Supabase is not configured, getSupabaseBrowserClient()
// returns null and callers should fall back to demo behavior.

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Generic guarded result. `ok:false` with no error means "not configured". */
export interface DbResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  configured: boolean;
}

export function notConfigured<T>(): DbResult<T> {
  return { ok: false, configured: false };
}

/**
 * Resolves the public.users.id for the currently signed-in auth user, creating
 * the row on first use. Returns null when not signed in or not configured.
 */
export async function resolveCurrentUserId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  const authUser = auth?.user;
  if (!authUser) return null;

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created } = await supabase
    .from("users")
    .insert({ auth_user_id: authUser.id, email: authUser.email ?? "" })
    .select("id")
    .single();

  return (created?.id as string) ?? null;
}

export { getSupabaseBrowserClient };
