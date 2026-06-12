"use client";

import { useMemo, useState } from "react";
import {
  industries as allIndustries,
  industryMap,
  opportunityTypes as allOpportunityTypes,
} from "@/lib/industries";

/* ──────────────────────────────────────────────────────────────────────────
   Shared, reusable filter system for every CapMaxx listing surface
   (I Offer, I Need, My Network, My Business Listings).

   - `ListingFilterState`     : the shape of all filter values
   - `useListingFilters()`    : hook that owns state + change/reset helpers
   - `filterListings()`       : pure helper that filters any data set
   - `buildFacets()`          : derives dropdown options from the data
   - `<ListingFilters />`      : the compact, professional filter UI
   ────────────────────────────────────────────────────────────────────────── */

export const ALL_INDUSTRIES = "All Industries";
export const ALL_SUBCATEGORIES = "All Subcategories";
export const ALL_CAPABILITIES = "All Capabilities";
export const ALL_LOCATIONS = "All Locations";
export const ALL_OPPORTUNITIES = "All Opportunity Types";
export const ANY_CAPACITY = "Any Capacity";
export const ANY_LEAD_TIME = "Any Lead Time";
export const ANY_AVAILABILITY = "Any Availability";
export const ANY_CERTIFICATION = "Any Certification";

export interface ListingFilterState {
  search: string;
  industry: string;
  subcategory: string;
  capability: string;
  location: string;
  opportunityType: string;
  capacity: string;
  leadTime: string;
  availability: string;
  certification: string;
  sort: string;
}

export const defaultListingFilters: ListingFilterState = {
  search: "",
  industry: ALL_INDUSTRIES,
  subcategory: ALL_SUBCATEGORIES,
  capability: ALL_CAPABILITIES,
  location: ALL_LOCATIONS,
  opportunityType: ALL_OPPORTUNITIES,
  capacity: ANY_CAPACITY,
  leadTime: ANY_LEAD_TIME,
  availability: ANY_AVAILABILITY,
  certification: ANY_CERTIFICATION,
  sort: "newest",
};

/** Normalized view of a single record so one filter engine works everywhere. */
export interface FilterableFields {
  searchText: string;
  industry: string;
  subcategory: string;
  tags: string[];
  location: string;
  opportunityTags: string[];
  capacity?: string;
  leadTime?: string;
  availability?: string;
  certifications?: string[];
}

export interface SelectOption {
  value: string;
  label: string;
}

/* ── State hook ─────────────────────────────────────────────────────────── */

export function useListingFilters(initial?: Partial<ListingFilterState>) {
  const [filters, setFilters] = useState<ListingFilterState>({
    ...defaultListingFilters,
    ...initial,
  });

  const update = (patch: Partial<ListingFilterState>) =>
    setFilters((f) => {
      const next = { ...f, ...patch };
      // Changing industry always resets the dependent subcategory.
      if (patch.industry !== undefined && patch.industry !== f.industry) {
        next.subcategory = ALL_SUBCATEGORIES;
      }
      return next;
    });

  const reset = () => setFilters({ ...defaultListingFilters, ...initial });

  const hasActiveFilters = useMemo(
    () =>
      filters.search.trim() !== "" ||
      filters.industry !== ALL_INDUSTRIES ||
      filters.subcategory !== ALL_SUBCATEGORIES ||
      filters.capability !== ALL_CAPABILITIES ||
      filters.location !== ALL_LOCATIONS ||
      filters.opportunityType !== ALL_OPPORTUNITIES ||
      filters.capacity !== ANY_CAPACITY ||
      filters.leadTime !== ANY_LEAD_TIME ||
      filters.availability !== ANY_AVAILABILITY ||
      filters.certification !== ANY_CERTIFICATION,
    [filters]
  );

  return { filters, update, reset, hasActiveFilters };
}

/* ── Pure filtering helper ──────────────────────────────────────────────── */

export function normalizeLocation(loc: string): string {
  const parts = loc.split(",").map((p) => p.trim());
  return parts.length >= 2 ? `${parts[0]}, ${parts[1]}` : parts[0] ?? loc;
}

function matchLocation(itemLoc: string, filterLoc: string) {
  const city = filterLoc.split(",")[0]?.trim().toLowerCase() ?? "";
  return city !== "" && itemLoc.toLowerCase().includes(city);
}

export function filterListings<T>(
  items: T[],
  getFields: (item: T) => FilterableFields,
  f: ListingFilterState
): T[] {
  const q = f.search.trim().toLowerCase();
  return items.filter((item) => {
    const x = getFields(item);
    if (q && !x.searchText.toLowerCase().includes(q)) return false;
    if (f.industry !== ALL_INDUSTRIES && x.industry !== f.industry) return false;
    if (f.subcategory !== ALL_SUBCATEGORIES && x.subcategory !== f.subcategory) return false;
    if (f.capability !== ALL_CAPABILITIES && !x.tags.includes(f.capability)) return false;
    if (f.location !== ALL_LOCATIONS && !matchLocation(x.location, f.location)) return false;
    if (f.opportunityType !== ALL_OPPORTUNITIES && !x.opportunityTags.includes(f.opportunityType))
      return false;
    if (f.capacity !== ANY_CAPACITY && x.capacity !== f.capacity) return false;
    if (f.leadTime !== ANY_LEAD_TIME && x.leadTime !== f.leadTime) return false;
    if (f.availability !== ANY_AVAILABILITY && x.availability !== f.availability) return false;
    if (
      f.certification !== ANY_CERTIFICATION &&
      !(x.certifications ?? []).includes(f.certification)
    )
      return false;
    return true;
  });
}

/** Derive unique dropdown options from a set of normalized records. */
export function buildFacets(fieldsList: FilterableFields[]) {
  const tags = new Set<string>();
  const locations = new Set<string>();
  const opportunities = new Set<string>();
  const capacities = new Set<string>();
  const leadTimes = new Set<string>();
  const certifications = new Set<string>();
  const subsByIndustry: Record<string, Set<string>> = {};

  fieldsList.forEach((x) => {
    x.tags.forEach((t) => tags.add(t));
    if (x.location) locations.add(normalizeLocation(x.location));
    x.opportunityTags.forEach((o) => opportunities.add(o));
    if (x.capacity) capacities.add(x.capacity);
    if (x.leadTime) leadTimes.add(x.leadTime);
    (x.certifications ?? []).forEach((c) => certifications.add(c));
    if (x.industry && x.subcategory) {
      (subsByIndustry[x.industry] ??= new Set<string>()).add(x.subcategory);
    }
  });

  const subcategoriesByIndustry: Record<string, string[]> = {};
  Object.entries(subsByIndustry).forEach(([ind, set]) => {
    subcategoriesByIndustry[ind] = Array.from(set).sort();
  });

  return {
    capabilities: Array.from(tags).sort(),
    locations: Array.from(locations).sort(),
    opportunityTypes: Array.from(opportunities).sort(),
    capacities: Array.from(capacities),
    leadTimes: Array.from(leadTimes),
    certifications: Array.from(certifications).sort(),
    subcategoriesByIndustry,
  };
}

/* ── UI ─────────────────────────────────────────────────────────────────── */

const selectCls =
  "py-2 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700";

function FilterSelect({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${selectCls} ${className}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const toOpts = (values: string[]): SelectOption[] => values.map((v) => ({ value: v, label: v }));

export interface ListingFiltersOptions {
  industries?: string[];
  subcategoriesByIndustry?: Record<string, string[]>;
  capabilities?: string[];
  locations?: string[];
  opportunityTypes?: string[];
  capacities?: string[];
  leadTimes?: string[];
  availabilities?: SelectOption[];
  certifications?: string[];
  sortOptions?: SelectOption[];
}

export interface ListingFiltersProps {
  filters: ListingFilterState;
  onChange: (patch: Partial<ListingFilterState>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  options: ListingFiltersOptions;
  searchPlaceholder?: string;
  resultLabel?: string;
}

export default function ListingFilters({
  filters,
  onChange,
  onReset,
  hasActiveFilters,
  options,
  searchPlaceholder = "Search by company, capability, product...",
  resultLabel,
}: ListingFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const industryOpts = toOpts(options.industries ?? allIndustries);
  const subcategoryValues =
    filters.industry !== ALL_INDUSTRIES
      ? options.subcategoriesByIndustry?.[filters.industry] ?? industryMap[filters.industry] ?? []
      : [];
  const subcategoryOpts = toOpts([ALL_SUBCATEGORIES, ...subcategoryValues]);
  const capabilityOpts = toOpts([ALL_CAPABILITIES, ...(options.capabilities ?? [])]);
  const locationOpts = toOpts([ALL_LOCATIONS, ...(options.locations ?? [])]);
  const opportunityOpts = toOpts([
    ALL_OPPORTUNITIES,
    ...(options.opportunityTypes ?? allOpportunityTypes),
  ]);

  const hasCapacity = (options.capacities?.length ?? 0) > 0;
  const hasLeadTime = (options.leadTimes?.length ?? 0) > 0;
  const hasAvailability = (options.availabilities?.length ?? 0) > 0;
  const hasCertification = (options.certifications?.length ?? 0) > 0;
  const hasAdvanced = hasCapacity || hasLeadTime || hasAvailability || hasCertification;

  return (
    <div className="mb-3">
      {/* Main filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <FilterSelect value={filters.industry} onChange={(v) => onChange({ industry: v })} options={industryOpts} />
        <FilterSelect value={filters.subcategory} onChange={(v) => onChange({ subcategory: v })} options={subcategoryOpts} />
        <FilterSelect value={filters.capability} onChange={(v) => onChange({ capability: v })} options={capabilityOpts} />
        <FilterSelect value={filters.location} onChange={(v) => onChange({ location: v })} options={locationOpts} />
        <FilterSelect value={filters.opportunityType} onChange={(v) => onChange({ opportunityType: v })} options={opportunityOpts} />

        {hasAdvanced && (
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={`flex items-center gap-1.5 py-2 px-3 text-sm border rounded-lg transition-colors whitespace-nowrap ${
              showAdvanced
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            }`}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            More Filters
            <svg className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Advanced filter row */}
      {hasAdvanced && showAdvanced && (
        <div className="flex items-center gap-2 flex-wrap mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
          {hasCapacity && (
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              Capacity
              <FilterSelect value={filters.capacity} onChange={(v) => onChange({ capacity: v })} options={toOpts([ANY_CAPACITY, ...(options.capacities ?? [])])} />
            </label>
          )}
          {hasLeadTime && (
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              Lead Time
              <FilterSelect value={filters.leadTime} onChange={(v) => onChange({ leadTime: v })} options={toOpts([ANY_LEAD_TIME, ...(options.leadTimes ?? [])])} />
            </label>
          )}
          {hasAvailability && (
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              Availability
              <FilterSelect value={filters.availability} onChange={(v) => onChange({ availability: v })} options={[{ value: ANY_AVAILABILITY, label: ANY_AVAILABILITY }, ...(options.availabilities ?? [])]} />
            </label>
          )}
          {hasCertification && (
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              Certification
              <FilterSelect value={filters.certification} onChange={(v) => onChange({ certification: v })} options={toOpts([ANY_CERTIFICATION, ...(options.certifications ?? [])])} />
            </label>
          )}
        </div>
      )}

      {/* Meta row: result count + clear + sort */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="text-xs text-gray-400">{resultLabel}</div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button type="button" onClick={onReset} className="text-xs text-blue-700 hover:underline whitespace-nowrap">
              Clear filters
            </button>
          )}
          {options.sortOptions && options.sortOptions.length > 0 && (
            <>
              <span className="text-xs text-gray-400 whitespace-nowrap">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(e) => onChange({ sort: e.target.value })}
                className="py-1 px-2 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
              >
                {options.sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
