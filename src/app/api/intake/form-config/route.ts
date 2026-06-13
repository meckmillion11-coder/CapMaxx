import { NextResponse } from "next/server";
import { mergeFormConfig, type IntakeFormConfigPayload } from "@/lib/intakeFormConfig";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = getSupabaseAdminClient();
  if (admin) {
    const { data } = await admin.from("intake_form_config").select("config").limit(1).maybeSingle();
    return NextResponse.json(mergeFormConfig((data?.config as Partial<IntakeFormConfigPayload>) ?? null));
  }
  return NextResponse.json(mergeFormConfig(null));
}
