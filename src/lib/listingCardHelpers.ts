export type AvailabilityStatus = "available" | "expiring" | "expired";

export function availabilityBadge(status: AvailabilityStatus, type: "offer" | "need") {
  if (status === "expired") return { label: "EXPIRED", cls: "bg-gray-400 text-white" };
  if (status === "expiring") return { label: "EXPIRING SOON", cls: "bg-amber-500 text-white" };
  return type === "need"
    ? { label: "SEEKING NOW", cls: "bg-orange-500 text-white" }
    : { label: "AVAILABLE NOW", cls: "bg-green-600 text-white" };
}

const opportunityTagStyles: Record<string, string> = {
  "Overflow Production": "bg-green-50 text-green-700 border-green-200",
  "Contract Manufacturing": "bg-blue-50 text-blue-700 border-blue-200",
  "Prototype Work": "bg-purple-50 text-purple-700 border-purple-200",
  "Private Label": "bg-teal-50 text-teal-700 border-teal-200",
  "Warehousing": "bg-slate-50 text-slate-700 border-slate-200",
  "Distribution": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Strategic Partnership": "bg-violet-50 text-violet-700 border-violet-200",
  "New Customers": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "New Suppliers": "bg-sky-50 text-sky-700 border-sky-200",
  "Joint Venture": "bg-rose-50 text-rose-700 border-rose-200",
  "Cold Chain": "bg-blue-50 text-blue-700 border-blue-200",
  "Food Service": "bg-amber-50 text-amber-700 border-amber-200",
  "Retail": "bg-pink-50 text-pink-700 border-pink-200",
  "National Coverage": "bg-gray-50 text-gray-700 border-gray-200",
};

export function opportunityTagStyle(tag: string) {
  return opportunityTagStyles[tag] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

export function industryServedIcon(name: string) {
  const key = name.toLowerCase();
  if (key.includes("aero")) return "✈";
  if (key.includes("auto")) return "🚗";
  if (key.includes("medical") || key.includes("health")) return "❤";
  if (key.includes("food")) return "🍽";
  if (key.includes("retail") || key.includes("grocery")) return "🛒";
  if (key.includes("e-commerce") || key.includes("ecommerce")) return "📦";
  if (key.includes("national") || key.includes("regional")) return "🌎";
  if (key.includes("industrial")) return "🏭";
  if (key.includes("construction")) return "🏗";
  if (key.includes("electronics")) return "🔌";
  return "🏢";
}
