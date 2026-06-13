"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  type ListingStatus,
  type MyBusinessListing,
} from "@/lib/myBusinessListings";
import {
  closeListing as dbCloseListing,
  renewListing as dbRenewListing,
  deleteListing as dbDeleteListing,
} from "@/lib/db/listings";
import { fetchMyBusinessListings } from "@/lib/db/reads";
import ListingFilters, {
  buildFacets,
  filterListings,
  useListingFilters,
  type FilterableFields,
} from "@/components/ListingFilters";

type TypeTab = "all" | "offer" | "need";
type StatusTab = "active" | "expiring" | "expired";

function mbToFields(l: MyBusinessListing): FilterableFields {
  return {
    searchText: [l.title, l.industry, l.subcategory, l.location, l.listingId, ...l.tags].join(" "),
    industry: l.industry,
    subcategory: l.subcategory,
    tags: l.tags,
    location: l.location,
    opportunityTags: l.opportunityTags ?? [],
    capacity: l.capacity,
    leadTime: l.leadTime,
    availability: l.availabilityStatus,
    certifications: l.certifications ?? [],
  };
}

const mbSortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "views", label: "Most Viewed" },
];

function listedTime(value: string): number {
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

const statusBadgeStyle: Record<ListingStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  expiring: "bg-orange-50 text-orange-700 border-orange-200",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusLabel: Record<ListingStatus, string> = {
  active: "Active",
  expiring: "Expiring Soon",
  expired: "Expired",
};

function ListingPhoto({ listing }: { listing: MyBusinessListing }) {
  const typeBadge =
    listing.type === "offer"
      ? "bg-green-600 text-white"
      : "bg-blue-600 text-white";

  if (listing.photoBg) {
    return (
      <div className="relative w-28 h-24 shrink-0 rounded-lg overflow-hidden">
        <div className={`w-full h-full bg-gradient-to-br ${listing.photoBg}`}>
          <div className="w-full h-full flex items-end">
            <div className="w-full bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
              <span className="text-[8px] text-white/90 font-medium leading-tight line-clamp-2">
                {listing.photoLabel}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide ${typeBadge}`}
        >
          {listing.type === "offer" ? "OFFER" : "NEED"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-28 h-24 shrink-0 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 px-2 text-center">
      <svg
        className="w-6 h-6 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="text-[8px] text-gray-400 leading-tight">No image</span>
      <span
        className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide ${typeBadge}`}
      >
        {listing.type === "offer" ? "OFFER" : "NEED"}
      </span>
    </div>
  );
}

function StatusBox({ listing }: { listing: MyBusinessListing }) {
  if (listing.status === "active") {
    return (
      <div className="text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 rounded px-2.5 py-1.5 text-center leading-snug">
        Active until {listing.expiresDate}
      </div>
    );
  }
  if (listing.status === "expiring") {
    return (
      <div className="text-[11px] font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded px-2.5 py-1.5 text-center leading-snug">
        Expires in {listing.daysUntilExpiry ?? 6} days
      </div>
    );
  }
  return (
    <div className="text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded px-2.5 py-1.5 text-center leading-snug">
      Expired {listing.expiresDate}
    </div>
  );
}

function ListingRowCard({
  listing,
  onDelete,
  onRenew,
  onClose,
}: {
  listing: MyBusinessListing;
  onDelete: (id: string) => void;
  onRenew: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const displayTags = listing.tags.slice(0, 3);
  const overflow = listing.tags.length - displayTags.length;

  return (
    <div
      className={`relative bg-white border border-gray-200 rounded-xl p-3 flex gap-3 hover:border-gray-300 hover:shadow-sm transition-all ${
        listing.status === "expired" ? "opacity-80" : ""
      }`}
    >
      <ListingPhoto listing={listing} />

      {/* Center-left: title, status, category, location, tags */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <h3
            className={`text-sm font-bold leading-snug ${
              listing.status === "expired" ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {listing.title}
          </h3>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${statusBadgeStyle[listing.status]}`}
          >
            {statusLabel[listing.status]}
          </span>
        </div>
        <div className="text-[11px] text-gray-500 mb-1">
          {listing.industry} › {listing.subcategory}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1.5">
          <svg
            className="w-3 h-3 text-gray-400 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          {listing.location}
        </div>
        <div className="flex flex-wrap gap-1">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {overflow > 0 && (
            <span className="text-[10px] text-gray-400 self-center">+{overflow}</span>
          )}
        </div>
      </div>

      {/* Center-right: stats */}
      <div className="hidden md:flex flex-col justify-center gap-1.5 shrink-0 w-32 border-l border-gray-100 pl-3">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="font-semibold text-gray-900">{listing.views}</span>
          <span className="text-gray-400">views</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="font-semibold text-gray-900">{listing.connections}</span>
          <span className="text-gray-400">connections</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-semibold text-gray-900">{listing.messages}</span>
          <span className="text-gray-400">messages</span>
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          Listed on {listing.listedDate}
        </div>
        <div className="text-[10px] text-gray-400">ID: {listing.listingId}</div>
      </div>

      {/* Right: status box + actions */}
      <div className="flex flex-col justify-between shrink-0 w-36 border-l border-gray-100 pl-3">
        <StatusBox listing={listing} />
        <div className="flex flex-col gap-1.5 mt-2">
          <Link
            href="/my-business/company-profile"
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View
          </Link>
          <Link
            href="/request-form"
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
          {listing.status === "active" ? (
            <button
              onClick={() => onClose(listing.id)}
              className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline transition-colors py-0.5"
            >
              Close
            </button>
          ) : (
            <button
              onClick={() => onRenew(listing.id)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Renew
            </button>
          )}
          <button
            onClick={() => onDelete(listing.id)}
            className="text-xs font-medium text-gray-400 hover:text-red-500 hover:underline transition-colors py-0.5"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter");

  const [typeTab, setTypeTab] = useState<TypeTab>("all");
  const [statusTab, setStatusTab] = useState<StatusTab | null>(
    initialFilter === "expiring" || initialFilter === "expired"
      ? initialFilter
      : initialFilter === "active"
        ? "active"
        : null
  );
  const [liveOnly, setLiveOnly] = useState(false);
  const [listings, setListings] = useState<MyBusinessListing[]>([]);
  const { filters, update, reset, hasActiveFilters } = useListingFilters();

  // Load the current company's real listings when Supabase is configured.
  useEffect(() => {
    let active = true;
    void fetchMyBusinessListings().then((data) => {
      if (active && data !== null) setListings(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const facets = useMemo(() => buildFacets(listings.map(mbToFields)), [listings]);
  const expiringCount = listings.filter((l) => l.status === "expiring").length;
  const activeCount = listings.filter((l) => l.status !== "expired").length;
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
  const totalConnections = listings.reduce((sum, l) => sum + l.connections, 0);

  const deleteListing = (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Delete this listing? This cannot be undone.")) return;
    setListings((rows) => rows.filter((l) => l.id !== id));
    void dbDeleteListing(id); // guarded: no-op when Supabase isn't configured
  };
  const renewListing = (id: string) => {
    setListings((rows) =>
      rows.map((l) => (l.id === id ? { ...l, status: "active", daysUntilExpiry: undefined } : l))
    );
    void dbRenewListing(id);
  };
  const closeListing = (id: string) => {
    setListings((rows) => rows.map((l) => (l.id === id ? { ...l, status: "expired" } : l)));
    void dbCloseListing(id);
  };

  const filteredListings = useMemo(() => {
    const tabbed = listings.filter((l) => {
      if (typeTab === "offer" && l.type !== "offer") return false;
      if (typeTab === "need" && l.type !== "need") return false;
      if (liveOnly && l.status === "expired") return false;
      if (statusTab && l.status !== statusTab) return false;
      return true;
    });
    const result = filterListings(tabbed, mbToFields, filters);
    const sorted = [...result];
    if (filters.sort === "oldest") sorted.sort((a, b) => listedTime(a.listedDate) - listedTime(b.listedDate));
    else if (filters.sort === "newest") sorted.sort((a, b) => listedTime(b.listedDate) - listedTime(a.listedDate));
    else if (filters.sort === "views") sorted.sort((a, b) => b.views - a.views);
    return sorted;
  }, [listings, typeTab, statusTab, liveOnly, filters]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">Listings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage all your offer and need listings in one place.
          </p>
        </div>
        <Link
          href="/request-form"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shrink-0"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create New Listing
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        <button
          onClick={() => {
            setTypeTab("all");
            setStatusTab(null);
            setLiveOnly(true);
          }}
          className="bg-white border border-gray-200 rounded-xl p-3.5 text-left hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="text-2xl font-bold text-gray-900 leading-none">
            {activeCount}
          </div>
          <div className="text-xs text-gray-600 mt-1">Active Listings</div>
          <div className="text-[11px] text-blue-700 font-medium mt-2">View all active →</div>
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-3.5">
          <div className="text-2xl font-bold text-gray-900 leading-none">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">Total Views</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3.5">
          <div className="text-2xl font-bold text-gray-900 leading-none">
            {totalConnections}
          </div>
          <div className="text-xs text-gray-600 mt-1">Total Connections</div>
        </div>

        <Link
          href="/my-messages"
          className="bg-white border border-gray-200 rounded-xl p-3.5 text-left hover:border-gray-300 hover:shadow-sm transition-all block"
        >
          <div className="text-2xl font-bold text-gray-900 leading-none">0</div>
          <div className="text-xs text-gray-600 mt-1">Unread Messages</div>
          <div className="text-[11px] text-blue-700 font-medium mt-2">View messages →</div>
        </Link>
      </div>

      {/* Primary tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200 mb-0">
        {(
          [
            ["all", "All Listings"],
            ["offer", "We Offer"],
            ["need", "We Need"],
          ] as [TypeTab, string][]
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => {
              setTypeTab(tab);
              setLiveOnly(false);
            }}
            className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
              typeTab === tab
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Secondary status tabs */}
      <div className="flex items-center gap-1.5 py-2.5 mb-3">
        {(
          [
            ["active", "Active"],
            ["expiring", `Expiring Soon (${expiringCount})`],
            ["expired", "Expired"],
          ] as [StatusTab, string][]
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => {
              setLiveOnly(false);
              setStatusTab(statusTab === tab ? null : tab);
            }}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              statusTab === tab
                ? "border-blue-700 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Unified filter row */}
      <ListingFilters
        filters={filters}
        onChange={update}
        onReset={reset}
        hasActiveFilters={hasActiveFilters}
        searchPlaceholder="Search listings by title, tag, location, ID..."
        resultLabel={`${filteredListings.length} listing${filteredListings.length !== 1 ? "s" : ""}`}
        options={{
          industries: facets.industries,
          subcategoriesByIndustry: facets.subcategoriesByIndustry,
          capabilities: facets.capabilities,
          locations: facets.locations,
          opportunityTypes: facets.opportunityTypes,
          capacities: facets.capacities,
          leadTimes: facets.leadTimes,
          certifications: facets.certifications,
          sortOptions: mbSortOptions,
        }}
      />

      {/* Listing rows */}
      {filteredListings.length === 0 ? (
        <div className="py-12 text-center bg-white border border-gray-200 rounded-xl px-6">
          {listings.length === 0 ? (
            <>
              <p className="text-sm text-gray-600">You haven&apos;t posted any listings yet.</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Create an offer or need to appear in the marketplace.</p>
              <Link
                href="/request-form"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
              >
                Create your first listing
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-400">No listings match your filters.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredListings.map((l) => (
            <ListingRowCard
              key={l.id}
              listing={l}
              onDelete={deleteListing}
              onRenew={renewListing}
              onClose={closeListing}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-screen-xl mx-auto px-4 py-8 text-sm text-gray-400">
          Loading listings…
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
