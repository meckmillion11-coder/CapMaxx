"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/mockListings";
import { fetchListingsByType } from "@/lib/db/reads";
import ListingCard from "./ListingCard";
import MarketplaceEmptyExamples from "./MarketplaceEmptyExamples";
import ListingFilters, {
  buildFacets,
  filterListings,
  useListingFilters,
  type FilterableFields,
} from "./ListingFilters";

interface ListingDirectoryProps {
  type: "offer" | "need";
}

const ITEMS_PER_PAGE = 6;

function toFields(l: Listing): FilterableFields {
  return {
    searchText: [l.company, l.title, l.industry, l.subcategory, ...l.tags, ...l.products].join(" "),
    industry: l.industry,
    subcategory: l.subcategory,
    tags: l.tags,
    location: l.location,
    opportunityTags: l.opportunityTags,
    capacity: l.capacity,
    leadTime: l.leadTime,
    availability: l.availabilityStatus,
    certifications: l.certifications,
  };
}

function leadTimeDays(value: string): number {
  const match = value.match(/\d+/);
  return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
}

const availabilityOptions = [
  { value: "available", label: "Available Now" },
  { value: "expiring", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "leadtime", label: "Lead Time" },
];

export default function ListingDirectory({ type }: ListingDirectoryProps) {
  const { filters, update, reset, hasActiveFilters } = useListingFilters();
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setRows([]);
    void fetchListingsByType(type).then((data) => {
      if (!active) return;
      if (data !== null) {
        setRows(data);
        setConfigured(true);
      } else {
        setRows([]);
        setConfigured(false);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [type]);

  const typeListings = useMemo(() => rows.filter((l) => l.type === type), [rows, type]);

  const facets = useMemo(() => buildFacets(typeListings.map(toFields)), [typeListings]);

  const filtered = useMemo(() => {
    const items = filterListings(typeListings, toFields, filters);
    const sorted = [...items];
    if (filters.sort === "oldest") sorted.reverse();
    else if (filters.sort === "leadtime") sorted.sort((a, b) => leadTimeDays(a.leadTime) - leadTimeDays(b.leadTime));
    return sorted;
  }, [typeListings, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const title = type === "offer" ? "I Offer" : "I Need";
  const subtitle =
    type === "offer"
      ? "Businesses offering capacity, expertise, and services."
      : "Businesses looking for capacity, expertise, and services.";

  const resultLabel = `${filtered.length} listing${filtered.length !== 1 ? "s" : ""}${
    filters.search ? ` matching "${filters.search}"` : ""
  }`;

  function handleChange(patch: Parameters<typeof update>[0]) {
    update(patch);
    setPage(1);
  }

  function handleReset() {
    reset();
    setPage(1);
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4 min-w-0">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h1 className="text-base font-bold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <Link
          href="/request-form"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Post a Listing
        </Link>
      </div>

      <ListingFilters
        filters={filters}
        onChange={handleChange}
        onReset={handleReset}
        hasActiveFilters={hasActiveFilters}
        searchPlaceholder="Search by company, capability, product..."
        resultLabel={resultLabel}
        options={{
          industries: facets.industries,
          subcategoriesByIndustry: facets.subcategoriesByIndustry,
          capabilities: facets.capabilities,
          locations: facets.locations,
          opportunityTypes: facets.opportunityTypes,
          capacities: facets.capacities,
          leadTimes: facets.leadTimes,
          availabilities: availabilityOptions.filter((o) => facets.availabilities.includes(o.value)),
          certifications: facets.certifications,
          sortOptions,
        }}
      />

      {/* Card grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 bg-white border border-gray-200 rounded-xl">
          <p className="text-sm">Loading listings…</p>
        </div>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          {paginated.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {hasActiveFilters ? (
            <div className="text-center py-16 px-6">
              <p className="text-sm text-gray-600">No listings match your filters.</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : configured ? (
            <MarketplaceEmptyExamples type={type} />
          ) : (
            <div className="text-center py-16 px-6">
              <p className="text-sm text-gray-600">Live listings are unavailable.</p>
              <p className="text-xs text-gray-400 mt-1">Connect Supabase to load marketplace listings.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-2.5 py-1.5 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                safePage === p
                  ? "bg-blue-700 text-white border-blue-700 font-semibold"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          {totalPages > 5 && (
            <>
              <span className="px-1 text-gray-400 text-sm">...</span>
              <button
                onClick={() => setPage(totalPages)}
                className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                  safePage === totalPages
                    ? "bg-blue-700 text-white border-blue-700 font-semibold"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-2.5 py-1.5 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
