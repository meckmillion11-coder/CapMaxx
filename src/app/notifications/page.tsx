import Link from "next/link";

type ActivityType = "view" | "message" | "saved" | "expiring" | "connection";

type Activity = {
  id: string;
  type: ActivityType;
  text: string;
  time: string;
  unread: boolean;
  href?: string;
};

// Mirrors the items surfaced in the notification bell dropdown.
const activity: Activity[] = [
  { id: "1", type: "view", text: "BlueLine Transport viewed your listing", time: "5m ago", unread: true, href: "/my-business/listings" },
  { id: "2", type: "message", text: "Summit Cold Storage sent a message", time: "1h ago", unread: true, href: "/my-messages" },
  { id: "3", type: "saved", text: "3 companies saved your listing", time: "3h ago", unread: true, href: "/my-business/listings" },
  { id: "4", type: "expiring", text: "Listing expires in 14 days", time: "1d ago", unread: false, href: "/my-business/listings" },
  { id: "5", type: "connection", text: "New connection request from GreenLeaf Bakery", time: "2d ago", unread: false, href: "/my-network" },
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

export default function NotificationsPage() {
  const unreadCount = activity.filter((a) => a.unread).length;

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
        {activity.map((item) => {
          const row = (
            <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColor[item.type]}`}>
                <ActivityIcon type={item.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] leading-snug ${item.unread ? "text-gray-900 font-medium" : "text-gray-600"}`}>{item.text}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
              </div>
              {item.unread && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
            </div>
          );
          return item.href ? (
            <Link key={item.id} href={item.href} className="block">
              {row}
            </Link>
          ) : (
            <div key={item.id}>{row}</div>
          );
        })}
      </div>
    </div>
  );
}
