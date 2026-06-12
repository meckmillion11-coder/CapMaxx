"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/db/auth";

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

function isNavActive(pathname: string, href: string) {
  if (href === "/my-business") return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

type SessionUser = { name: string; email: string };

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Real session awareness via the browser Supabase client. When Supabase is
  // unconfigured getSupabaseBrowserClient() returns null and we stay on the
  // logged-out view (Sign In / Sign Up), preserving the demo behavior.
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
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) void loadProfile(data.user);
      else setSessionUser(null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) void loadProfile(session.user);
      else setSessionUser(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await signOut();
    setSessionUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 h-[52px] flex items-center gap-3">
        {/* Logo: bar-chart mark + wordmark + tagline */}
        <Link href="/" className="shrink-0 flex items-center gap-2 mr-1.5" aria-label="CapMaxx home">
          <span className="flex items-end gap-[2px] h-6" aria-hidden="true">
            <span className="w-1.5 h-2.5 rounded-[2px] bg-green-500" />
            <span className="w-1.5 h-4 rounded-[2px] bg-blue-900" />
            <span className="w-1.5 h-5 rounded-[2px] bg-green-500" />
            <span className="w-1.5 h-6 rounded-[2px] bg-blue-900" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-bold text-base text-blue-900 leading-none">CapMaxx</span>
            <span className="hidden sm:block text-[8px] text-gray-400 leading-none mt-0.5 tracking-tight">
              Maximum Utilization. Maximum Revenue.
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0 flex-1 min-w-0">
          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2 py-1 text-[13px] rounded whitespace-nowrap transition-colors ${
                isNavActive(pathname, item.href)
                  ? "text-blue-700 font-medium bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster: notifications + auth/menu */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Notification bell */}
          <NotificationBell />

          {/* Auth buttons - desktop */}
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

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-1.5 rounded text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden absolute top-[52px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg px-4 py-2 z-50">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-2 py-1.5 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 pb-1">
            {sessionUser ? (
              <>
                <Link href="/profile" className="flex-1 text-center py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:border-blue-500 truncate" onClick={() => setMenuOpen(false)}>
                  {sessionUser.name}
                </Link>
                <button onClick={handleSignOut} className="flex-1 text-center py-1.5 text-sm font-medium text-white bg-blue-700 rounded">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="flex-1 text-center py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:border-blue-500" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/signup" className="flex-1 text-center py-1.5 text-sm font-medium text-white bg-blue-700 rounded" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
