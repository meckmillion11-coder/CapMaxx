import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

// ──────────────────────────────────────────────────────────────────────────────
// Route protection + Supabase session refresh
//
// Standard @supabase/ssr Next.js middleware: it reads the auth cookies from the
// request, refreshes the session if needed, and writes the refreshed cookies
// back onto the response. Protected routes redirect unauthenticated users to
// /signin?redirect=<path>.
//
// IMPORTANT: when Supabase is NOT configured (env vars absent) we let every
// request through so the dev app keeps working against the mock fallback.
// ──────────────────────────────────────────────────────────────────────────────

const PROTECTED_PREFIXES = [
  "/admin",
  "/my-business",
  "/profile",
  "/my-messages",
  "/my-network",
  "/request-form",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  // Dev fallback: Supabase unconfigured → never gate, never break the app.
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  // Start with a pass-through response we can attach refreshed cookies to.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() refreshes the session (and triggers setAll above) when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/signin";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/my-business/:path*",
    "/profile/:path*",
    "/my-messages/:path*",
    "/my-network/:path*",
    "/request-form/:path*",
  ],
};
