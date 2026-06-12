"use client";

// Auth helpers (client-safe). Wrap Supabase email/password auth and provision
// the app-level user + company rows on sign-up. Every function degrades to
// notConfigured when Supabase env vars are absent, so the demo sign-in/up forms
// stay functional (they simply navigate without a real backend).

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notConfigured, type DbResult } from "./client-helpers";

export interface SignUpInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

/**
 * Sign up: creates the auth user, a matching public.users row, and (when a
 * company name is given) the owned company. Returns notConfigured when Supabase
 * is absent so the UI can fall back to the demo flow.
 */
export async function signUp(input: SignUpInput): Promise<DbResult<{ userId: string }>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<{ userId: string }>();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });
  if (signUpError) return { ok: false, configured: true, error: signUpError.message };

  const authUser = signUpData.user;
  if (!authUser) {
    // Email confirmation likely required — no session yet. Treat as success.
    return { ok: true, configured: true, data: { userId: "" } };
  }

  const fullName = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();
  const { data: userRow } = await supabase
    .from("users")
    .insert({
      auth_user_id: authUser.id,
      email: input.email,
      first_name: input.firstName ?? null,
      last_name: input.lastName ?? null,
      full_name: fullName || null,
      role: "Owner",
    })
    .select("id")
    .single();

  if (userRow?.id && input.companyName?.trim()) {
    await supabase.from("companies").insert({
      owner_id: userRow.id,
      name: input.companyName.trim(),
      status: "Pending",
    });
  }

  return { ok: true, configured: true, data: { userId: (userRow?.id as string) ?? "" } };
}

export async function signIn(email: string, password: string): Promise<DbResult<null>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<null>();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true, data: null };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
