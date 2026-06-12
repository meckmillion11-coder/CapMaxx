"use client";

// Notification helpers (per-user, RLS-protected). Client-safe with fallback.

import {
  getSupabaseBrowserClient,
  resolveCurrentUserId,
  notConfigured,
  type DbResult,
} from "./client-helpers";

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  text: string;
  read: boolean;
  created_at?: string;
}

export async function listNotifications(): Promise<NotificationRow[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return null;
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as NotificationRow[]) ?? null;
}

export async function markAllNotificationsRead(): Promise<DbResult<null>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<null>();
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return { ok: false, configured: true, error: "not signed in" };
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true, data: null };
}
