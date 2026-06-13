"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMyBusinessDashboard, type MyBusinessDashboard } from "@/lib/db/reads";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const manageLinks = [
  {
    label: "Company Profile",
    href: "/my-business/company-profile",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: "My Listings",
    href: "/my-business/listings",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: "Preferences",
    href: "/my-business/preferences",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const quickActions = [
  {
    title: "Create Offer",
    description: "Post what your business offers to the marketplace",
    href: "/request-form",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    title: "Create Need",
    description: "Post what your business is looking for",
    href: "/request-form",
    iconBg: "bg-green-100 text-green-600",
  },
  {
    title: "View Messages",
    description: "Respond to messages from businesses",
    href: "/my-messages",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    title: "Manage Listings",
    description: "View and manage all your offer and need listings",
    href: "/my-business/listings",
    iconBg: "bg-orange-100 text-orange-600",
  },
];

function EmptyPanel({
  title,
  message,
  href,
  linkLabel,
}: {
  title: string;
  message: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-8 text-center">
      <p className="text-[13px] font-medium text-gray-800">{title}</p>
      <p className="text-[12px] text-gray-500 mt-1 max-w-sm mx-auto">{message}</p>
      {href && linkLabel && (
        <Link href={href} className="inline-block mt-3 text-[12px] text-blue-700 font-medium hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export default function MyBusinessPage() {
  const [dash, setDash] = useState<MyBusinessDashboard | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchMyBusinessDashboard().then((data) => {
      if (!active) return;
      setDash(data);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const companyName = dash?.companyName || "your company";
  const userName = dash?.userName || "there";

  const needsAttention = [
    {
      label: "Unread Messages",
      value: dash?.unreadMessages ?? 0,
      linkLabel: "View messages",
      href: "/my-messages",
      iconBg: "bg-rose-100 text-rose-600",
      cardBg: "bg-rose-50/60 border-rose-100",
    },
    {
      label: "New Connection Requests",
      value: dash?.connectionRequests ?? 0,
      linkLabel: "View requests",
      href: "/my-network",
      iconBg: "bg-amber-100 text-amber-600",
      cardBg: "bg-amber-50/60 border-amber-100",
    },
    {
      label: "Listing Expiring in 7 Days",
      value: dash?.expiringListings ?? 0,
      linkLabel: "View listings",
      href: "/my-business/listings?filter=expiring",
      iconBg: "bg-blue-100 text-blue-600",
      cardBg: "bg-blue-50/60 border-blue-100",
    },
    {
      label: "Listing Expired",
      value: dash?.expiredListings ?? 0,
      linkLabel: "View listings",
      href: "/my-business/listings?filter=expired",
      iconBg: "bg-red-100 text-red-600",
      cardBg: "bg-red-50/60 border-red-100",
    },
  ];

  const hasAttention = needsAttention.some((item) => item.value > 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-5 min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            {getGreeting()}, {loaded ? companyName : "…"} 👋
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {loaded
              ? `Welcome back, ${userName}. Here's what's happening in your network today.`
              : "Loading your dashboard…"}
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
          {manageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {!loaded ? (
        <EmptyPanel title="Loading dashboard" message="Fetching your latest activity…" />
      ) : (
        <>
          <section className="mb-5">
            <h2 className="text-[13px] font-semibold text-gray-700 mb-2.5">Needs Attention</h2>
            {hasAttention ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {needsAttention
                  .filter((item) => item.value > 0)
                  .map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`border rounded-lg p-3 transition-shadow hover:shadow-sm ${item.cardBg}`}
                    >
                      <div className="text-2xl font-bold text-gray-900 leading-none">{item.value}</div>
                      <div className="text-[12px] text-gray-600 mt-1">{item.label}</div>
                      <div className="text-[12px] text-blue-700 font-medium mt-2 hover:underline">
                        {item.linkLabel} →
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <EmptyPanel
                title="You're all caught up"
                message="No unread messages, connection requests, or listing alerts right now."
                href="/request-form"
                linkLabel="Post your first listing"
              />
            )}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <EmptyPanel
              title="No recent activity yet"
              message="When other businesses view your profile, save listings, or message you, activity will show up here."
              href="/my-business/company-profile"
              linkLabel="Complete your company profile"
            />
            <EmptyPanel
              title="No matches yet"
              message="Set your business preferences and post listings to discover companies that fit what you offer and need."
              href="/my-business/preferences"
              linkLabel="Set preferences"
            />
          </section>

          <section>
            <h2 className="text-[13px] font-semibold text-gray-700 mb-2.5">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${action.iconBg}`}>
                    <span className="text-lg font-bold">+</span>
                  </div>
                  <div className="text-[13px] font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {action.title}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{action.description}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
