import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import {
  isMissingIntakeColumnError,
  submissionToDbRow,
  submissionToLegacyDbRow,
} from "@/lib/intakeTypes";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const companyName = String(body.companyName ?? "").trim();
  const contactName = String(body.contactName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const location = String(body.location ?? "").trim();
  const industry = String(body.industry ?? "").trim();
  const listingTitle = String(body.listingTitle ?? "").trim();
  const listingDescription = String(body.listingDescription ?? "").trim();
  const purpose = String(body.purpose ?? "").trim();

  if (!companyName || !contactName || !email || !location || !industry || !purpose || !listingTitle || !listingDescription) {
    return NextResponse.json({ ok: false, error: "Please complete all required fields." }, { status: 400 });
  }

  const row = submissionToDbRow(body as never);
  row.status = "new";

  if (isSupabaseAdminConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      let { data, error } = await supabase.from("intake_submissions").insert(row).select("id").single();
      if (error && isMissingIntakeColumnError(error.message)) {
        const legacy = submissionToLegacyDbRow(body as never);
        ({ data, error } = await supabase.from("intake_submissions").insert(legacy).select("id").single());
      }
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      if (!data?.id) return NextResponse.json({ ok: false, error: "Insert failed." }, { status: 500 });
      return NextResponse.json({ ok: true, id: data.id });
    }
  }

  return NextResponse.json({ ok: true, id: `local-${Date.now()}`, local: true });
}
