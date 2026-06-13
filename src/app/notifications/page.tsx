"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMyNotifications, type NotificationItem } from "@/lib/db/reads";

type ActivityType = "view" | "message" | "saved" | "expiring" | "connection";

function ActivityIcon({ type }: { type: ActivityType }) {
  const base = "w-4 h-4";
  switch (type) {
    case "view":
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.04 12.32a1 1 0 010-.64C3.42 7.51 7.36 4.5 12 4.5s8.58 3.01 9.96 7.18a1 1 0 010 .64C20.58 16.49 16.64 19.5 12 19.5s-8.58-3.01-9.96-7.18z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "message":
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      );
    case "saved":
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      );
    case "expiring":
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
        </svg>
      );
    case "connection":
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" />
        </svg>
      );
  }
}

const iconColor: Record<ActivityType, string> = {
  view: "bg-blue-50 text-blue-600",
  message: "bg-indigo-50 text-indigo-600",
  saved: "bg-amber-50 text-amber-600",
  expiring: "bg-red-50 text-red-600",
  connection: "bg-green-50 text-green-600",
};

function asActivityType(value: string): ActivityType {
  if (value === "message" || value === "saved" || value === "expiring" || value === "connection") {
    return value;
  }
  return "view";
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchMyNotifications().then((data) => {
      if (!active) return;
      setItems(data ?? []);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = items.filter((a) => a.unread).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-bold text-gray-900">Notifications</h1>
          <p className="text-xs text-gray-400 mt-0.5">Recent activity across your listings and network.</p>
        </div>
        {unreadCount > 0 && (
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2.5 py-1 rounded-full shrink-0">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {!loaded ? (
          <div className="px-4 py-12 text-center text-sm text-gray-400">Loading notifications…</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-800">No notifications yet</p>
            <p className="text-xs text-gray-500 mt-1">
              You&apos;ll see updates here when businesses interact with your listings or send messages.
            </p>
            <Link href="/my-business" className="inline-block mt-4 text-xs font-medium text-blue-700 hover:underline">
              Go to My Business →
            </Link>
          </div>
        ) : (
          items.map((item) => {
            const type = asActivityType(item.type);
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColor[type]}`}>
                  <ActivityIcon type={type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] leading-snug ${item.unread ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                    {item.text}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
                {item.unread && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
