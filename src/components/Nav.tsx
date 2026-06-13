"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/db/auth";

import { isPreLaunchMode } from "@/lib/preLaunch";

const navItems = [
  { label: "Home", href: "/" },
  { label: "I Offer", href: "/i-offer" },
  { label: "I Need", href: "/i-need" },
  { label: "My Request Form", href: "/request-form" },
  { label: "My Business", href: "/my-business" },
  { label: "My Messages", href: "/my-messages" },
  { label: "My Network", href: "/my-network" },
  { label: "Profile", href: "/profile" },
];

const preLaunchPublicNav = [
  { label: "Early Access", href: "/intake" },
  { label: "Join", href: "/join" },
  { label: "Founding Companies", href: "/founding-companies" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/my-business") return pathname === href || pathname.startsWith(`${href}/`);
  if (href === "/admin") return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

const adminNavItem = { label: "Admin", href: "/admin" };

type SessionUser = { name: string; email: string };

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex items-end gap-[2px] h-6" aria-hidden="true">
        <span className="w-1.5 h-2.5 rounded-[2px] bg-green-500" />
        <span className="w-1.5 h-4 rounded-[2px] bg-blue-900" />
        <span className="w-1.5 h-5 rounded-[2px] bg-green-500" />
        <span className="w-1.5 h-6 rounded-[2px] bg-blue-900" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-bold text-base text-blue-900 leading-none">CapMaxx</span>
          <span className="hidden lg:block text-[8px] text-gray-400 leading-none mt-0.5 tracking-tight">
            Maximum Utilization. Maximum Revenue.
          </span>
        </span>
      )}
    </span>
  );
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;

    async function loadProfile(authUser: { id: string; email?: string }) {
      let name = authUser.email ?? "";
      const { data } = await supabase!
        .from("users")
        .select("full_name, first_name")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();
      if (data?.full_name) name = String(data.full_name);
      else if (data?.first_name) name = String(data.first_name);
      if (active) setSessionUser({ name, email: authUser.email ?? "" });

      try {
        const res = await fetch("/api/admin/me");
        if (active && res.ok) {
          const body = (await res.json()) as { isAdmin?: boolean };
          setIsAdmin(Boolean(body.isAdmin));
        } else if (active) {
          setIsAdmin(false);
        }
      } catch {
        if (active) setIsAdmin(false);
      }
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) void loadProfile(data.user);
      else {
        setSessionUser(null);
        setIsAdmin(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) void loadProfile(session.user);
      else {
        setSessionUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleSignOut() {
    await signOut();
    setSessionUser(null);
    setIsAdmin(false);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const preLaunch = isPreLaunchMode();
  const showFullNav = !preLaunch || isAdmin;
  const homeHref = showFullNav ? "/" : "/intake";
  const desktopNavItems = showFullNav
    ? (isAdmin ? [...navItems.slice(1), adminNavItem] : navItems.slice(1))
    : preLaunchPublicNav;
  const mobileNavItems = showFullNav
    ? (isAdmin ? [...navItems, adminNavItem] : navItems)
    : preLaunchPublicNav;

  function navLinkClass(href: string, admin = false) {
    const active = isNavActive(pathname, href);
    if (admin) {
      return active
        ? "text-amber-800 font-medium bg-amber-50"
        : "text-amber-700 hover:text-amber-900 hover:bg-amber-50";
    }
    return active
      ? "text-blue-700 font-medium bg-blue-50"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 h-[52px] flex items-center gap-3">
          <Link href={homeHref} className="shrink-0 flex items-center mr-1.5 min-w-0" aria-label="CapMaxx home">
            <LogoMark />
          </Link>

          {/* Desktop nav — unchanged */}
          <nav className="hidden lg:flex items-center gap-0 flex-1 min-w-0">
            {desktopNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1 text-[13px] rounded whitespace-nowrap transition-colors ${navLinkClass(item.href, item.href === "/admin")}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <NotificationBell />

            <div className="hidden lg:flex items-center gap-1.5">
              {sessionUser ? (
                <>
                  <Link
                    href="/profile"
                    className="px-2 py-1 text-[13px] text-gray-700 hover:text-blue-700 rounded hover:bg-gray-100 transition-colors max-w-[160px] truncate"
                    title={sessionUser.email}
                  >
                    {sessionUser.name}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" className="px-3 py-1 text-[13px] text-gray-600 hover:text-blue-700 rounded hover:bg-gray-100 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/signup" className="px-3 py-1 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="lg:hidden p-1.5 rounded text-gray-500 hover:bg-gray-100"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 h-[52px] border-b border-gray-200 shrink-0">
            <Link href={homeHref} className="min-w-0" onClick={() => setMenuOpen(false)} aria-label="CapMaxx home">
              <LogoMark compact />
            </Link>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <button
                type="button"
                className="p-1.5 rounded text-gray-500 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-3">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-3 text-base rounded-lg mb-1 transition-colors ${
                  item.href === "/admin"
                    ? `border border-amber-200 ${navLinkClass(item.href, true)}`
                    : navLinkClass(item.href)
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-200 px-4 py-4 shrink-0">
            {sessionUser ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="block w-full text-center py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 truncate"
                  onClick={() => setMenuOpen(false)}
                >
                  {sessionUser.name}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  className="text-center py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-center py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
