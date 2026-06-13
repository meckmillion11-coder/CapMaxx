/** Shared CapMaxx early-access value messaging — used on intake, footer, and CTAs. */

export const CAPMAXX_MISSION =
  "CapMaxx helps companies use their existing resources to full capability — so nothing sits idle, empty, or underutilized.";

export const CAPMAXX_TAGLINE =
  "Maximum utilization. Maximum capability. Maximum revenue.";

export const CAPMAXX_INTRO =
  "Most businesses already own the capacity, equipment, warehouse space, transportation, labor, and services they need to grow. The problem is visibility — those resources often go unused while other companies search for exactly that capability. CapMaxx connects both sides.";

export const CAPMAXX_BENEFITS = [
  {
    title: "Monetize what you already have",
    body: "Turn idle CNC shifts, empty dock doors, return-trip miles, and bench time into revenue — without buying new assets.",
  },
  {
    title: "Fill gaps instead of wasting them",
    body: "List availability when capacity opens up. Companies looking for manufacturing, warehousing, logistics, or services can find you fast.",
  },
  {
    title: "Build partnerships that last",
    body: "Go beyond one-off transactions. Discover suppliers, customers, and strategic partners who need what you already offer.",
  },
] as const;

export const CAPMAXX_EXAMPLES = [
  {
    kind: "visual" as const,
    label: "Manufacturing",
    title: "Idle CNC capacity becomes billable production",
    stat: "40% → 92%",
    statLabel: "utilization after listing on CapMaxx",
    body: "A precision shop runs CNC machines at less than half capacity between major orders. They list weekly open hours on CapMaxx — and nearby manufacturers book that time for overflow work.",
    tags: ["Manufacturing Capacity", "Equipment", "Skilled Labor"],
  },
  {
    kind: "descriptive" as const,
    label: "Warehousing",
    title: "Weekend pallet space that was sitting empty",
    body: "A regional warehouse has 12,000 sq ft available every Friday through Sunday — too short for a long-term lease, perfect for a company needing surge storage during a product launch. CapMaxx makes that visible to the right buyers.",
    tags: ["Warehouse Space", "Distribution Network"],
  },
  {
    kind: "descriptive" as const,
    label: "Logistics",
    title: "Return-trip trucks running half empty",
    body: "A freight carrier regularly drives Dallas → Houston with a partial load, then returns nearly empty. They list return-trip capacity on CapMaxx so shippers on that lane fill the remaining space — revenue on miles that were already being driven.",
    tags: ["Transportation Capacity", "Professional Services"],
  },
] as const;
