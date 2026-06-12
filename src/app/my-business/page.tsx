"use client";

import Link from "next/link";

const COMPANY_NAME = "Midwest Precision Parts";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const needsAttention = [
  {
    label: "Unread Messages",
    value: 2,
    linkLabel: "View messages",
    href: "/my-messages",
    iconBg: "bg-rose-100 text-rose-600",
    cardBg: "bg-rose-50/60 border-rose-100",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: "New Connection Requests",
    value: 3,
    linkLabel: "View requests",
    href: "/my-network",
    iconBg: "bg-amber-100 text-amber-600",
    cardBg: "bg-amber-50/60 border-amber-100",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    label: "Listing Expiring in 7 Days",
    value: 1,
    linkLabel: "View listings",
    href: "/my-business/listings?filter=expiring",
    iconBg: "bg-blue-100 text-blue-600",
    cardBg: "bg-blue-50/60 border-blue-100",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Listing Expired Yesterday",
    value: 1,
    linkLabel: "View listings",
    href: "/my-business/listings?filter=expired",
    iconBg: "bg-red-100 text-red-600",
    cardBg: "bg-red-50/60 border-red-100",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
];

const recentActivity = [
  {
    text: "Summit Cold Storage viewed your profile",
    time: "2h ago",
    iconBg: "bg-purple-100 text-purple-600",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    text: "GreenLeaf Bakery saved your listing",
    time: "3h ago",
    iconBg: "bg-green-100 text-green-600",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    text: "BlueLine Transport sent a message",
    time: "5h ago",
    iconBg: "bg-sky-100 text-sky-600",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    text: "Apex Fabrication connected with you",
    time: "1d ago",
    iconBg: "bg-indigo-100 text-indigo-600",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    text: 'Your listing "Warehouse Space Available" expires in 6 days',
    time: "1d ago",
    iconBg: "bg-yellow-100 text-yellow-600",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const newMatches = [
  {
    title: "Companies match your preferences",
    description: "New companies that fit what you offer and seek",
    count: 5,
    href: "/my-network",
    iconBg: "bg-blue-100 text-blue-600",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: "New needs match your capabilities",
    description: "Businesses are looking for what you offer",
    count: 3,
    href: "/i-need",
    iconBg: "bg-orange-100 text-orange-600",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: "New offers match what you seek",
    description: "Businesses offer what you are looking for",
    count: 2,
    href: "/i-offer",
    iconBg: "bg-green-100 text-green-600",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

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
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    title: "Create Need",
    description: "Post what your business is looking for",
    href: "/request-form",
    iconBg: "bg-green-100 text-green-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: "View Messages",
    description: "Respond to messages from businesses",
    href: "/my-messages",
    iconBg: "bg-purple-100 text-purple-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: "Manage Listings",
    description: "View and manage all your offer and need listings",
    href: "/my-business/listings",
    iconBg: "bg-orange-100 text-orange-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export default function MyBusinessPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-5">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            {getGreeting()}, {COMPANY_NAME} 👋
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Here&apos;s what&apos;s happening in your network today.
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

      {/* Section 1: Needs Attention */}
      <section className="mb-5">
        <h2 className="text-[13px] font-semibold text-gray-700 mb-2.5">Needs Attention</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {needsAttention.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`border rounded-lg p-3 transition-shadow hover:shadow-sm ${item.cardBg}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  {item.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 leading-none">{item.value}</div>
              <div className="text-[12px] text-gray-600 mt-1">{item.label}</div>
              <div className="text-[12px] text-blue-700 font-medium mt-2 hover:underline">
                {item.linkLabel} →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: Recent Activity + New Matches */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div>
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-100 last:border-b-0"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  {item.icon}
                </div>
                <p className="text-[12px] text-gray-800 flex-1 min-w-0 leading-snug">{item.text}</p>
                <span className="text-[11px] text-gray-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100">
            <Link href="/my-network" className="text-[12px] text-blue-700 font-medium hover:underline">
              View all activity →
            </Link>
          </div>
        </div>

        {/* New Matches */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">New Matches</h2>
          </div>
          <div>
            {newMatches.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-gray-900 leading-snug">{item.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{item.description}</div>
                </div>
                <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full shrink-0">
                  {item.count}
                </span>
                <svg
                  className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100">
            <Link href="/i-offer" className="text-[12px] text-blue-700 font-medium hover:underline">
              View all matches →
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Quick Actions */}
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
                {action.icon}
              </div>
              <div className="text-[13px] font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {action.title}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
