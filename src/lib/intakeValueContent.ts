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

export const CAPMAXX_SITUATIONS_TITLE = "Turn Existing Resources Into Opportunity";

export const CAPMAXX_SITUATIONS_INTRO =
  "Most companies already own valuable resources, capabilities, equipment, facilities, and expertise. CapMaxx helps make them visible so the right opportunities can find them.";

export const CAPMAXX_SITUATIONS_SUMMARY =
  "Whether you want to generate additional revenue, find more work, support overflow production, showcase specialized capabilities, or access resources without major investment — CapMaxx helps connect the right companies.";

export type SituationIconName =
  | "calendar"
  | "season"
  | "plant"
  | "overflow"
  | "support"
  | "capability";

export const CAPMAXX_SITUATIONS = [
  {
    icon: "calendar" as const,
    title: "Available Every Friday",
    lines: [
      "Production runs Monday–Thursday.",
      "Machine hours sit unused every Friday.",
    ],
    outcome: "CapMaxx makes that capacity visible to companies needing production support.",
  },
  {
    icon: "season" as const,
    title: "Slow Season Capacity",
    lines: [
      "Business slows during certain months.",
      "Equipment, facilities, and skilled workers stay available.",
    ],
    outcome: "CapMaxx connects those resources with new opportunities.",
  },
  {
    icon: "plant" as const,
    title: "New Plant, Existing Equipment",
    lines: [
      "You upgraded or expanded operations.",
      "Older equipment and facilities still have value.",
    ],
    outcome: "CapMaxx helps others discover and use what already exists.",
  },
  {
    icon: "overflow" as const,
    title: "Overflow Production",
    lines: [
      "Orders exceed your available capacity.",
      "You need support without new equipment or another facility.",
    ],
    outcome: "CapMaxx connects you with companies ready to help.",
  },
  {
    icon: "support" as const,
    title: "Need Production Support",
    lines: [
      "You need manufacturing, equipment, labor, warehousing, logistics, or services.",
    ],
    outcome: "CapMaxx helps you find businesses already equipped for your project.",
  },
  {
    icon: "capability" as const,
    title: "Capability Nobody Knows About",
    lines: [
      "Specialized equipment, certifications, expertise, or processes — with limited visibility.",
    ],
    outcome: "CapMaxx showcases those capabilities to companies actively searching for them.",
  },
] as const;
