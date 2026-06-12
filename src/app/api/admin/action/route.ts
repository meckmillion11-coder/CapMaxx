import { NextResponse } from "next/server";
import {
  adminConfigured,
  setUserStatus,
  setCompanyStatus,
  setCompanyVerification,
  deleteCompany,
  setListingStatus,
  deleteListing,
  setIntakeStatus,
  deleteIntakeSubmission,
  setIntakeNote,
  convertIntakeToCompany,
  setReportStatus,
  removeReportedContent,
  addAdminNote,
} from "@/lib/db/admin";
import { getAuthorizedAdminEmail } from "../_auth";

// POST /api/admin/action
// Body: { entity, action, id, status?, note?, targetType?, targetId?, body? }
//   entity: "user" | "company" | "listing" | "intake" | "report" | "note"
// Performs a moderation/admin action via the service-role client. Returns
// { configured:false } when Supabase isn't configured so the AdminPanel keeps
// using local state.
export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ configured: false });
  }
  const email = await getAuthorizedAdminEmail();
  if (!email) {
    return NextResponse.json({ configured: true, error: "unauthorized" }, { status: 403 });
  }

  let body: {
    entity?: string;
    action?: string;
    id?: string;
    status?: string;
    note?: string;
    kind?: "company" | "listing";
    targetType?: "user" | "company" | "listing";
    targetId?: string;
    body?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ configured: true, error: "bad request" }, { status: 400 });
  }

  const { entity, action } = body;
  if (!entity || !action) {
    return NextResponse.json({ configured: true, error: "missing fields" }, { status: 400 });
  }

  let result: { ok: boolean; error?: string; companyId?: string; note?: unknown } = { ok: false };

  if (entity === "user") {
    if (!body.id) return NextResponse.json({ configured: true, error: "missing id" }, { status: 400 });
    result = await setUserStatus(body.id, body.status ?? "Approved");
  } else if (entity === "company") {
    if (!body.id) return NextResponse.json({ configured: true, error: "missing id" }, { status: 400 });
    if (action === "delete") {
      result = await deleteCompany(body.id);
    } else if (action === "verify") {
      const vstatus = (body.status ?? "pending") as "unverified" | "pending" | "verified" | "rejected";
      result = await setCompanyVerification(body.id, vstatus, { reason: body.note, adminEmail: email });
    } else {
      result = await setCompanyStatus(body.id, body.status ?? "Approved");
    }
  } else if (entity === "listing") {
    if (!body.id) return NextResponse.json({ configured: true, error: "missing id" }, { status: 400 });
    result = action === "delete" ? await deleteListing(body.id) : await setListingStatus(body.id, body.status ?? "Approved");
  } else if (entity === "intake") {
    if (!body.id) return NextResponse.json({ configured: true, error: "missing id" }, { status: 400 });
    if (action === "delete") result = await deleteIntakeSubmission(body.id);
    else if (action === "note") result = await setIntakeNote(body.id, body.note ?? "");
    else if (action === "convert") result = await convertIntakeToCompany(body.id);
    else result = await setIntakeStatus(body.id, body.status ?? "reviewed");
  } else if (entity === "report") {
    if (!body.id || !body.kind)
      return NextResponse.json({ configured: true, error: "missing id/kind" }, { status: 400 });
    result =
      action === "remove"
        ? await removeReportedContent(body.kind, body.id)
        : await setReportStatus(body.kind, body.id, body.status ?? "reviewed");
  } else if (entity === "note") {
    if (!body.targetType || !body.targetId || !body.body)
      return NextResponse.json({ configured: true, error: "missing note fields" }, { status: 400 });
    result = await addAdminNote({
      authorEmail: email,
      targetType: body.targetType,
      targetId: body.targetId,
      body: body.body,
    });
  } else {
    return NextResponse.json({ configured: true, error: "unknown entity" }, { status: 400 });
  }

  return NextResponse.json({ configured: true, ...result });
}
