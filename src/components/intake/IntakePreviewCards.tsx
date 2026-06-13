"use client";

import type { IntakeSubmission } from "@/lib/intakeTypes";
import { PURPOSE_OPTIONS } from "@/lib/intakeFormConfig";

type PreviewData = Pick<
  IntakeSubmission,
  | "companyName"
  | "location"
  | "industry"
  | "listingTitle"
  | "listingDescription"
  | "resourceCategories"
  | "resourcesOffered"
  | "resourcesSought"
  | "purpose"
  | "availabilityNotes"
  | "capacityInfo"
>;

export default function IntakePreviewCards({ data }: { data: PreviewData }) {
  const company = data.companyName.trim() || "Your Company";
  const location = data.location.trim() || "Location";
  const industry = data.industry.trim() || "Industry";
  const title = data.listingTitle.trim() || "Your Resource Listing";
  const desc = data.listingDescription.trim() || data.resourcesOffered.trim() || "Your description will appear here.";
  const seek = data.resourcesSought.trim();
  const purposeLabel = PURPOSE_OPTIONS.find((p) => p.value === data.purpose)?.label ?? "Resource Opportunity";
  const cats = data.resourceCategories.filter(Boolean);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-900">
        See How Your Information May Appear On CapMaxx
      </h2>
      <p className="text-xs text-gray-500 -mt-2">
        Preview only — your submission is reviewed before anything goes live.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Company Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Preview 1 · Company Profile
          </div>
          <div className="p-4 flex-1">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {company[0]?.toUpperCase() ?? "C"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{company}</div>
                <div className="text-[11px] text-gray-500">{location}</div>
                <div className="text-[11px] text-blue-700 mt-0.5">{industry}</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3 leading-relaxed line-clamp-4">
              {data.resourcesOffered.trim() || "Your company capabilities and resource summary."}
            </p>
            {cats.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {cats.slice(0, 4).map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resource Listing Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Preview 2 · Resource Listing
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-green-600 text-white self-start mb-2">
              {data.purpose === "need" ? "WE NEED" : "WE OFFER"}
            </span>
            <h3 className="text-sm font-bold text-gray-900 leading-snug">{title}</h3>
            <p className="text-[11px] text-gray-500 mt-1">{company} · {location}</p>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed flex-1 line-clamp-5">{desc}</p>
            {data.availabilityNotes && (
              <p className="text-[11px] text-amber-700 mt-2 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                {data.availabilityNotes}
              </p>
            )}
          </div>
        </div>

        {/* Business Opportunity Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Preview 3 · Business Opportunity
          </div>
          <div className="p-4 flex-1">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {purposeLabel}
            </span>
            <h3 className="text-sm font-bold text-gray-900 mt-2">{title}</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{desc}</p>
            {seek && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide mb-1">Looking For</p>
                <p className="text-xs text-gray-600 line-clamp-3">{seek}</p>
              </div>
            )}
            {data.capacityInfo && (
              <p className="text-[11px] text-gray-500 mt-2">Capacity: {data.capacityInfo}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
