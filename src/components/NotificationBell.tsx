"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { markAllNotificationsRead } from "@/lib/db/notifications";

// Returns false during SSR and the first client render, then true once the app
// has hydrated. Using useSyncExternalStore (instead of a setState-in-effect
// mounted flag) keeps server and first client render identical with no
// cascading re-render, so it is the hydration-safe way to gate client-only UI.
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

type ActivityType = "view" | "message" | "saved" | "expiring" | "connection";

type Activity = {
  id: string;
  type: ActivityType;
  text: string;
  time: string;
  unread: boolean;
};

const initialActivity: Activity[] = [
  { id: "1", type: "view", text: "BlueLine Transport viewed your listing", time: "5m ago", unread: true },
  { id: "2", type: "message", text: "Summit Cold Storage sent a message", time: "1h ago", unread: true },
  { id: "3", type: "saved", text: "3 companies saved your listing", time: "3h ago", unread: true },
  { id: "4", type: "expiring", text: "Listing expires in 14 days", time: "1d ago", unread: false },
  { id: "5", type: "connection", text: "New connection request from GreenLeaf Bakery", time: "2d ago", unread: false },
];

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

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialActivity);
  const ref = useRef<HTMLDivElement>(null);

  // The dropdown panel is client-only interactive UI; gating it behind the
  // hydrated flag guarantees it can never diverge from the server-rendered
  // markup. The bell button + unread badge stay deterministic, so they render
  // identically on both the server and the first client paint.
  const hydrated = useHydrated();

  const unreadCount = items.filter((i) => i.unread).length;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
    void markAllNotificationsRead(); // guarded: no-op without Supabase
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 00-4-5.66V5a2 2 0 10-4 0v.34A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {hydrated && open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            {unreadCount > 0 && <span className="text-[11px] text-gray-400">{unreadCount} unread</span>}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconColor[item.type]}`}>
                  <ActivityIcon type={item.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] leading-snug ${item.unread ? "text-gray-900 font-medium" : "text-gray-600"}`}>{item.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
                {item.unread && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50">
            <button onClick={markAllRead} className="text-xs text-gray-500 hover:text-gray-700">Mark all read</button>
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs font-medium text-blue-700 hover:underline">View all</Link>
          </div>
        </div>
      )}
    </div>
  );
}
