"use client";

// Messaging helpers (threads + messages). Client-safe with graceful fallback.

import {
  getSupabaseBrowserClient,
  resolveCurrentUserId,
  notConfigured,
  type DbResult,
} from "./client-helpers";

/**
 * Get-or-create a 1:1 thread with a company, then send a message into it.
 * No-ops gracefully when Supabase isn't configured.
 */
export async function sendMessageToCompany(
  companyId: string,
  body: string,
  attachment?: { url?: string; name?: string },
): Promise<DbResult<{ threadId: string }>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return notConfigured<{ threadId: string }>();
  const userId = await resolveCurrentUserId(supabase);
  if (!userId) return { ok: false, configured: true, error: "not signed in" };

  // Find an existing thread the user participates in for this company.
  const { data: existing } = await supabase
    .from("message_threads")
    .select("id")
    .eq("company_id", companyId)
    .contains("participant_user_ids", [userId])
    .limit(1)
    .maybeSingle();

  let threadId = existing?.id as string | undefined;

  if (!threadId) {
    const { data: created, error: tErr } = await supabase
      .from("message_threads")
      .insert({
        company_id: companyId,
        created_by_user_id: userId,
        participant_user_ids: [userId],
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (tErr) return { ok: false, configured: true, error: tErr.message };
    threadId = created!.id as string;
  }

  const { error: mErr } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_user_id: userId,
    body,
    attachment_url: attachment?.url ?? null,
    attachment_name: attachment?.name ?? null,
  });
  if (mErr) return { ok: false, configured: true, error: mErr.message };

  await supabase
    .from("message_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", threadId);

  return { ok: true, configured: true, data: { threadId } };
}
