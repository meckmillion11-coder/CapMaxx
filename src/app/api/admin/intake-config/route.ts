import { NextResponse } from "next/server";
import { fetchIntakeFormConfig, saveIntakeFormConfig } from "@/lib/db/admin";
import { getAuthorizedAdminEmail } from "../../admin/_auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getAuthorizedAdminEmail();
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  const config = await fetchIntakeFormConfig();
  return NextResponse.json({ config: config ?? {} });
}

export async function PUT(req: Request) {
  const email = await getAuthorizedAdminEmail();
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  const body = await req.json();
  const result = await saveIntakeFormConfig(body.config ?? body, email);
  return NextResponse.json(result);
}
