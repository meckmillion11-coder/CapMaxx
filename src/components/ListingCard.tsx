"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Listing } from "@/lib/mockListings";
import { companySlugFromName } from "@/lib/mockCompanies";
import { availabilityBadge, industryServedIcon, opportunityTagStyle } from "@/lib/listingCardHelpers";
import { setSavedListing } from "@/lib/db/social";

function PrimaryImage({ listing }: { listing: Listing }) {
  if (listing.photoBg) {
    return (
      <div className={`w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br ${listing.photoBg}`}>
        <div className="w-full h-full flex items-end">
          <div className="w-full bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
            <span className="text-[8px] text-white/90 font-medium leading-tight line-clamp-2">{listing.photoLabel}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-24 h-24 shrink-0 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 px-2 text-center">
      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-[8px] text-gray-400 leading-tight">No image uploaded</span>
    </div>
  );
}

function MetricCell({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-0.5">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-[11px] font-semibold text-gray-800 leading-tight truncate">{value}</div>
    </div>
  );
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const badge = availabilityBadge(listing.availabilityStatus, listing.type);
  const moqLabel = listing.moqLabel ?? "MOQ";
  const equipLabel = listing.equipmentLabel ?? "Equipment";
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all flex flex-col">

      {/* Header row */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wide ${badge.cls}`}>
          {badge.label}
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {listing.categoryLabel}
        </span>
      </div>

      {/* Title + company */}
      <div className="px-3 pb-1">
        <h3 className="text-[14px] font-bold text-gray-900 leading-snug">{listing.title}</h3>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[11px] text-gray-500">{listing.company}</span>
          {listing.verified && (
            <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Products sub-header */}
      <div className="px-3 pb-2.5 text-[11px] text-gray-500 leading-snug">
        {listing.products.join(" • ")}
      </div>

      {/* Middle: image + metrics */}
      <div className="px-3 pb-2.5 flex gap-3 border-t border-gray-100 pt-2.5">
        <PrimaryImage listing={listing} />

        <div className="flex-1 min-w-0">
          {/* Industries served */}
          <div className="mb-2">
            <div className="text-[9px] text-gray-400 mb-1">Industries Served</div>
            <div className="flex flex-wrap gap-2">
              {listing.industriesServed.map((ind) => (
                <span key={ind} className="flex items-center gap-1 text-[10px] text-gray-600">
                  <span className="text-xs">{industryServedIcon(ind)}</span>
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* 4-column metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MetricCell
              icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" /></svg>}
              label="Capacity"
              value={listing.capacity}
            />
            <MetricCell
              icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
              label={moqLabel}
              value={listing.moq}
            />
            <MetricCell
              icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Lead Time"
              value={listing.leadTime}
            />
            <MetricCell
              icon={<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>}
              label="Location"
              value={listing.location}
            />
          </div>
        </div>
      </div>

      {/* Equipment / Services */}
      <div className="px-3 pb-2 text-[11px] text-gray-600 leading-snug border-t border-gray-100 pt-2">
        <span className="font-semibold text-gray-700">{equipLabel}:</span>{" "}
        {listing.equipment}
      </div>

      {/* Certifications */}
      {listing.certifications.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {listing.certifications.map((cert) => (
            <span key={cert} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-medium">
              {cert}
            </span>
          ))}
        </div>
      )}

      {/* Opportunity tags */}
      <div className="px-3 pb-2.5 flex flex-wrap gap-1 border-t border-gray-100 pt-2">
        {listing.opportunityTags.map((tag) => (
          <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${opportunityTagStyle(tag)}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* Footer actions */}
      <div className="px-3 py-2.5 flex items-center gap-2 border-t border-gray-100 bg-gray-50/50 mt-auto">
        <Link
          href={`/company/${companySlugFromName(listing.company)}`}
          className="px-3 py-1.5 text-xs font-medium border border-blue-600 rounded text-blue-700 hover:bg-blue-50 transition-colors"
        >
          View Company
        </Link>
        <Link href="/my-messages" className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors">
          Message
        </Link>
        <button
          onClick={() =>
            setSaved((s) => {
              const next = !s;
              // Guarded real persistence; no-ops without Supabase. listing.id is
              // a real UUID when listings come from Supabase.
              void setSavedListing(listing.id, next);
              return next;
            })
          }
          aria-pressed={saved}
          className={`ml-auto flex items-center gap-1 text-xs transition-colors ${
            saved ? "text-blue-700" : "text-gray-500 hover:text-gray-700"
          }`}
          title={saved ? "Saved" : "Save listing"}
        >
          <span>{saved ? "Saved" : "Save"}</span>
          <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
