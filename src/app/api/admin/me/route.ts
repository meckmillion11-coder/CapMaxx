import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthorizedAdminEmail } from "../_auth";

export const dynamic = "force-dynamic";

/** Lightweight admin check for nav visibility (same gate as /admin). */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ isAdmin: true, email: null });
  }

  const email = await getAuthorizedAdminEmail();
  if (email) {
    return NextResponse.json({ isAdmin: true, email });
  }

  return NextResponse.json({ isAdmin: false, email: null });
}
