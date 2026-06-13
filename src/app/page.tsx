import Link from "next/link";
import type { ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────
   Consistent thin-line icon system.
   Every icon shares the same 24×24 viewBox + stroke so sizing is
   uniform across the page (size is controlled only via className).
   ────────────────────────────────────────────────────────────── */
type IconName =
  | "trendingUp"
  | "gauge"
  | "users"
  | "dollarCircle"
  | "search"
  | "recycle"
  | "handshake"
  | "barChart"
  | "warehouse"
  | "chat"
  | "gear"
  | "truck"
  | "hardHat"
  | "briefcase"
  | "bookmark"
  | "verified"
  | "mapPin"
  | "box"
  | "layers"
  | "package"
  | "clock"
  | "hash"
  | "badgeCheck"
  | "calendar"
  | "factory";

const iconPaths: Record<IconName, ReactNode> = {
  trendingUp: (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  gauge: (
    <>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  dollarCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  recycle: (
    <>
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
      <path d="m14 16-3 3 3 3" />
      <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
      <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
      <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
    </>
  ),
  handshake: (
    <>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </>
  ),
  barChart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </>
  ),
  warehouse: (
    <>
      <path d="M22 8.35V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
      <path d="M6 18h12" />
      <path d="M6 14h12" />
      <path d="M6 10h12" />
    </>
  ),
  chat: (
    <>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
    </>
  ),
  gear: (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  truck: (
    <>
      <path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2" />
      <path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M9 18h6" />
    </>
  ),
  hardHat: (
    <>
      <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z" />
      <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
      <path d="M4 15v-3a6 6 0 0 1 6-6" />
      <path d="M14 6a6 6 0 0 1 6 6v3" />
    </>
  ),
  briefcase: (
    <>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </>
  ),
  bookmark: <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />,
  verified: (
    <>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  box: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  layers: (
    <>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </>
  ),
  package: (
    <>
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  hash: (
    <>
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </>
  ),
  badgeCheck: (
    <>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </>
  ),
  factory: (
    <>
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </>
  ),
};

function Icon({
  name,
  className = "w-6 h-6",
  stroke = 1.5,
  solid = false,
}: {
  name: IconName;
  className?: string;
  stroke?: number;
  solid?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={solid ? "currentColor" : "none"}
      stroke={solid ? "none" : "currentColor"}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

/* ── Section data ── */
const valueStrip: { icon: IconName; title: string; desc: string }[] = [
  { icon: "trendingUp", title: "Generate Revenue", desc: "Monetize what you already have" },
  { icon: "gauge", title: "Maximize Utilization", desc: "Fill idle capacity and reduce waste" },
  { icon: "users", title: "Discover Opportunities", desc: "Connect with ready buyers and partners" },
  { icon: "dollarCircle", title: "Stronger Bottom Line", desc: "Improve efficiency and profitability" },
];

const whyCards: { icon: IconName; title: string; desc: string }[] = [
  { icon: "dollarCircle", title: "Increase Revenue", desc: "Generate new revenue from resources that are not fully utilized." },
  { icon: "gauge", title: "Improve Utilization", desc: "Fill unused capacity, equipment time, warehouse space, and labor availability." },
  { icon: "search", title: "Discover Opportunities", desc: "Find companies actively seeking resources, services, and capabilities." },
  { icon: "recycle", title: "Reduce Waste", desc: "Turn idle assets and unused resources into productive opportunities." },
  { icon: "handshake", title: "Expand Your Network", desc: "Build relationships with suppliers, customers, and strategic partners." },
  { icon: "barChart", title: "Grow Without Major Investment", desc: "Generate more business using the resources you already have." },
];

const howSteps: { icon: IconName; title: string; desc: string }[] = [
  { icon: "warehouse", title: "Showcase Resources", desc: "List available capacity, warehouse space, equipment, labor, transportation resources, or services." },
  { icon: "search", title: "Discover Opportunities", desc: "Companies searching for resources can find and contact you based on their needs." },
  { icon: "chat", title: "Connect Directly", desc: "Discuss requirements, timelines, pricing, and availability directly with interested companies." },
  { icon: "dollarCircle", title: "Create Revenue", desc: "Turn underutilized resources into profitable business opportunities." },
];

const showcaseItems: { icon: IconName; label: string }[] = [
  { icon: "gauge", label: "Available Capacity" },
  { icon: "warehouse", label: "Warehouse Space" },
  { icon: "gear", label: "Equipment & Machinery" },
  { icon: "truck", label: "Transportation Resources" },
  { icon: "hardHat", label: "Skilled Labor" },
  { icon: "briefcase", label: "Business Services" },
  { icon: "handshake", label: "Strategic Partnerships" },
];

const offerDetails: { icon: IconName; label: string; value: string; highlight?: boolean }[] = [
  { icon: "gear", label: "Capability", value: "CNC Milling, CNC Turning" },
  { icon: "box", label: "Part", value: "Precision Aluminum Bracket" },
  { icon: "layers", label: "Material", value: "6061 Aluminum" },
  { icon: "package", label: "Quantity Available", value: "500 Brackets / Week", highlight: true },
  { icon: "clock", label: "Lead Time", value: "3–5 Business Days" },
  { icon: "hash", label: "MOQ", value: "50 Brackets" },
];

const offerMeta: { icon: IconName; label: string; value: string }[] = [
  { icon: "badgeCheck", label: "Certifications", value: "ISO 9001" },
  { icon: "calendar", label: "Available", value: "Jun 15, 2026 – Dec 15, 2026" },
  { icon: "factory", label: "Business Type", value: "Manufacturer" },
  { icon: "mapPin", label: "Location", value: "Chicago, IL, USA" },
];

function CenteredHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center text-sm font-bold text-gray-900 uppercase tracking-[0.15em] mb-8">
      {children}
    </h2>
  );
}

function DetailRow({ icon, label, value, highlight }: { icon: IconName; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-[5px]">
      <span className="text-gray-400 mt-0.5 shrink-0">
        <Icon name={icon} className="w-3.5 h-3.5" stroke={1.6} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-gray-400 leading-tight">{label}</div>
        <div className={`text-[11px] font-semibold leading-tight ${highlight ? "text-green-600" : "text-gray-800"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* ───────────────── Hero ───────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white border-b border-gray-100">
        {/* faint industrial line-art background */}
        <svg
          className="pointer-events-none absolute right-0 bottom-0 w-[520px] max-w-[60%] text-blue-900/[0.04]"
          viewBox="0 0 400 240"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <rect x="40" y="120" width="60" height="100" />
          <rect x="110" y="90" width="70" height="130" />
          <rect x="190" y="140" width="50" height="80" />
          <path d="M40 120l30-30 30 30M110 90l35-35 35 35" />
          <circle cx="300" cy="80" r="34" />
          <path d="M300 60v40M280 80h40" />
          <rect x="250" y="150" width="110" height="70" />
        </svg>

        <div className="max-w-screen-xl mx-auto px-4 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Maximum Capacity. Maximum Capability. Maximum Revenue.
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-blue-950 leading-[1.1] tracking-tight mb-4">
              Turn Underutilized Resources Into{" "}
              <span className="text-green-600">Revenue</span>
            </h1>
            <p className="text-[15px] text-gray-600 leading-relaxed max-w-xl mb-7">
              CapMaxx connects companies that have underutilized capacity, resources, and
              capabilities with businesses actively looking for exactly what they need.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/i-offer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-md transition-colors shadow-sm"
              >
                <Icon name="dollarCircle" className="w-[18px] h-[18px]" stroke={1.8} />
                I Have Resources to Offer
              </Link>
              <Link
                href="/i-need"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-blue-900 bg-white border border-gray-300 hover:border-blue-900 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Icon name="search" className="w-[18px] h-[18px]" stroke={1.8} />
                I Need Resources
              </Link>
            </div>
          </div>

          {/* Right — sample listing card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md">
            {/* header: badges + bookmark */}
            <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide bg-green-100 text-green-700">
                WE OFFER
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                AVAILABLE CAPACITY
              </span>
              <button className="ml-auto text-gray-300 hover:text-blue-700 transition-colors" aria-label="Save listing">
                <Icon name="bookmark" className="w-4 h-4" stroke={1.6} />
              </button>
            </div>

            {/* image + title block */}
            <div className="px-5 pt-4 flex gap-4">
              <div className="w-[88px] h-[88px] shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-slate-500 via-slate-700 to-gray-900 flex items-end">
                <div className="w-full bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                  <span className="text-[8px] text-white/90 font-medium leading-tight">Precision Aluminum Brackets</span>
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 leading-snug">CNC Precision Aluminum Brackets</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[13px] font-medium text-gray-700">Your Company Name</span>
                  <Icon name="verified" className="w-4 h-4 text-blue-600 shrink-0" solid />
                </div>
                <div className="flex items-center gap-1 mt-1 text-gray-500">
                  <Icon name="mapPin" className="w-3.5 h-3.5" stroke={1.6} />
                  <span className="text-[12px]">Chicago, IL, USA</span>
                </div>
              </div>
            </div>

            {/* two-column detail rows */}
            <div className="px-5 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <div>
                {offerDetails.map((row) => (
                  <DetailRow key={row.label} {...row} />
                ))}
              </div>
              <div>
                {offerMeta.map((row) => (
                  <DetailRow key={row.label} {...row} />
                ))}
              </div>
            </div>

            {/* footer actions */}
            <div className="px-5 py-3.5 mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100">
              <Link href="/company/midwest-precision-parts" className="text-[12px] font-medium text-blue-700 hover:underline">
                View Profile
              </Link>
              <Link href="/my-messages" className="text-[12px] font-medium text-blue-700 hover:underline">
                Message
              </Link>
              <span className="text-[12px] font-medium text-blue-700 hover:underline cursor-pointer">Save</span>
              <Link
                href="/company/midwest-precision-parts"
                className="w-full sm:w-auto sm:ml-auto px-5 py-2 text-center text-[12px] font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-md transition-colors"
              >
                Connect
              </Link>
            </div>
          </div>
        </div>

        {/* Value strip */}
        <div className="max-w-screen-xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {valueStrip.map((v) => (
              <div key={v.title} className="flex flex-col items-center text-center px-2">
                <span className="text-green-600 mb-3">
                  <Icon name={v.icon} className="w-8 h-8" />
                </span>
                <div className="text-[13px] font-bold text-gray-900 leading-tight">{v.title}</div>
                <div className="text-xs text-gray-500 leading-snug mt-1">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Why companies use CapMaxx ───────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 py-14">
        <CenteredHeading>Why Companies Use CapMaxx</CenteredHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
          {whyCards.map((c) => (
            <div key={c.title} className="flex flex-col items-center text-center">
              <span className="text-green-600 mb-3">
                <Icon name={c.icon} className="w-8 h-8" />
              </span>
              <div className="text-[13px] font-bold text-gray-900 mb-1.5">{c.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── How CapMaxx works ───────────────── */}
      <section className="bg-slate-50 border-y border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 py-14">
          <CenteredHeading>How CapMaxx Works</CenteredHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {howSteps.map((s, i) => (
              <div key={s.title} className="relative flex flex-col items-center text-center px-2">
                {/* connecting line */}
                {i < howSteps.length - 1 && (
                  <span className="hidden lg:block absolute top-5 left-1/2 w-full h-px bg-gray-300" aria-hidden="true" />
                )}
                <div className="relative z-10 w-10 h-10 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center mb-4 shadow-sm">
                  {i + 1}
                </div>
                <span className="text-blue-900 mb-3">
                  <Icon name={s.icon} className="w-8 h-8" />
                </span>
                <div className="text-[13px] font-bold text-gray-900 mb-1.5">{s.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── What can you showcase ───────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* left: heading + items */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-6">
              What Can You<br className="hidden sm:block" /> Showcase
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-5">
              {showcaseItems.map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center gap-2">
                  <span className="text-green-600">
                    <Icon name={item.icon} className="w-7 h-7" />
                  </span>
                  <div className="text-[11px] font-medium text-gray-600 leading-tight">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right: dark CTA box */}
          <div className="rounded-xl bg-blue-950 px-6 py-7 flex flex-col gap-4">
            <div>
              <div className="text-lg font-bold text-white leading-snug">
                Maximum Utilization.<br />Maximum Revenue.
              </div>
              <p className="text-[13px] text-blue-200 mt-2 leading-relaxed">
                Better for your business. Better for the economy.
              </p>
            </div>
            <Link
              href="/signup"
              className="self-start px-5 py-2.5 text-sm font-bold text-blue-950 bg-white hover:bg-blue-50 rounded-md transition-colors shadow-sm"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
