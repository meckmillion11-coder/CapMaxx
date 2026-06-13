/**
 * Pre-launch mode: public users see intake only; admins access the full platform.
 * Set NEXT_PUBLIC_PRE_LAUNCH=true (or PRE_LAUNCH=true) to enable.
 */

export function isPreLaunchMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_PRE_LAUNCH === "true" ||
    process.env.PRE_LAUNCH === "true"
  );
}

/** Paths always reachable during pre-launch (non-admin public). */
export const PRE_LAUNCH_PUBLIC_PATHS = [
  "/intake",
  "/join",
  "/founding-companies",
  "/signin",
  "/signup",
  "/privacy-policy",
  "/terms-of-service",
  "/contact",
] as const;

export function isPreLaunchPublicPath(pathname: string): boolean {
  if (PRE_LAUNCH_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (pathname.startsWith("/api/intake")) return true;
  if (pathname.startsWith("/api/admin/me")) return true;
  return false;
}

export function getAdminEmailsFromEnv(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
