import Link from "next/link";

const offerExamples = [
  { title: "CNC Machining Capacity", industry: "Manufacturing", hint: "Share open machine hours and tolerances" },
  { title: "Powder Coating Services", industry: "Manufacturing", hint: "Promote finishing capacity and batch sizes" },
  { title: "Warehouse Space Available", industry: "Logistics", hint: "List square footage, racking, and location" },
  { title: "Contract Manufacturing", industry: "Manufacturing", hint: "Describe production lines and MOQ" },
  { title: "Packaging Services", industry: "Packaging", hint: "Kitting, labeling, and fulfillment capacity" },
  { title: "Logistics Capacity", industry: "Logistics", hint: "Transportation lanes, fleet, or cross-dock space" },
];

const needExamples = [
  { title: "Overflow CNC Production", industry: "Manufacturing", hint: "Find partners when demand exceeds capacity" },
  { title: "Powder Coating Partner", industry: "Manufacturing", hint: "Source finishing for upcoming jobs" },
  { title: "Warehouse Storage", industry: "Logistics", hint: "Secure short- or long-term storage" },
  { title: "Contract Manufacturing", industry: "Manufacturing", hint: "Outsource production runs to qualified shops" },
  { title: "Packaging Support", industry: "Packaging", hint: "Find kitting or fulfillment partners" },
  { title: "Regional Freight Capacity", industry: "Logistics", hint: "Cover last-mile or lane-specific moves" },
];

interface MarketplaceEmptyExamplesProps {
  type: "offer" | "need";
}

export default function MarketplaceEmptyExamples({ type }: MarketplaceEmptyExamplesProps) {
  const examples = type === "offer" ? offerExamples : needExamples;
  const headline = type === "offer" ? "No offers posted yet" : "No needs posted yet";
  const sub =
    type === "offer"
      ? "Be the first to share what your business offers. Here are ideas to get started:"
      : "Be the first to post what your business needs. Here are ideas to get started:";

  return (
    <div className="py-8 px-4 sm:px-6">
      <p className="text-sm font-medium text-gray-800">{headline}</p>
      <p className="text-xs text-gray-500 mt-1 mb-5 max-w-lg mx-auto">{sub}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 text-left max-w-4xl mx-auto">
        {examples.map((ex) => (
          <div
            key={ex.title}
            className="rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-4"
          >
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Example idea
            </span>
            <h3 className="text-sm font-semibold text-gray-900 mt-1 leading-snug">{ex.title}</h3>
            <p className="text-[11px] text-blue-700 mt-0.5">{ex.industry}</p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{ex.hint}</p>
          </div>
        ))}
      </div>

      <Link
        href="/request-form"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
      >
        Post a Listing
      </Link>
    </div>
  );
}
