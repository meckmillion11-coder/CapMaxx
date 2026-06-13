"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { industryServedIcon, opportunityTagStyle } from "@/lib/listingCardHelpers";
import { companySlugFromName } from "@/lib/mockCompanies";
import { setSavedCompany, setFollowCompany, setSavedListing } from "@/lib/db/social";
import { fetchNetworkData } from "@/lib/db/reads";
import ListingFilters, {
  buildFacets,
  filterListings,
  useListingFilters,
  type FilterableFields,
} from "@/components/ListingFilters";

type FilterTab = "all" | "following" | "saved-companies" | "saved-listings" | "connections";

interface Company {
  id: string;
  type: "offer" | "need";
  name: string;
  location: string;
  industry: string;
  subcategory: string;
  categoryLabel: string;
  summary: string;
  capabilities: string[];
  industriesServed: string[];
  certifications: string[];
  equipment: string;
  equipmentLabel?: string;
  opportunityTags: string[];
  verified: boolean;
  tabs: Exclude<FilterTab, "all" | "saved-listings">[];
  logoBg: string;
  logoIcon: string;
  photoBg: string;
  photoLabel: string;
}

function companyToFields(c: Company): FilterableFields {
  return {
    searchText: [c.name, c.industry, c.subcategory, c.summary, ...c.capabilities].join(" "),
    industry: c.industry,
    subcategory: c.subcategory,
    tags: c.capabilities,
    location: c.location,
    opportunityTags: c.opportunityTags,
    certifications: c.certifications,
  };
}

const networkSortOptions = [
  { value: "newest", label: "Recommended" },
  { value: "name", label: "Company A–Z" },
];

interface SavedListing {
  id: string;
  company: string;
  title: string;
  industry: string;
  type: "offer" | "need";
  saved: string;
  status: "active" | "expired";
}

function VerifiedBadge() {
  return (
    <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function CompanyPhoto({ c }: { c: Company }) {
  if (c.photoBg) {
    return (
      <div className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br ${c.photoBg}`}>
        <div className="w-full h-full flex items-end">
          <div className="w-full bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
            <span className="text-[8px] text-white/90 font-medium leading-tight">{c.photoLabel}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-20 h-20 shrink-0 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 px-1 text-center">
      <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-[8px] text-gray-400 leading-tight">No image</span>
    </div>
  );
}

function CompanyCard({ c }: { c: Company }) {
  const equipLabel = c.equipmentLabel ?? "Capabilities";
  const displayCaps = c.capabilities.slice(0, 4);
  const overflow = c.capabilities.length - displayCaps.length;
  const [saved, setSaved] = useState(c.tabs.includes("saved-companies"));
  const [following, setFollowing] = useState(c.tabs.includes("following"));

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm hover:border-gray-300 transition-all flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wide ${
          c.type === "offer" ? "bg-green-600 text-white" : "bg-orange-500 text-white"
        }`}>
          {c.type === "offer" ? "CONNECTED" : "SEEKING"}
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {c.categoryLabel}
        </span>
      </div>

      {/* Company identity */}
      <div className="px-3 pb-1 flex items-start gap-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${c.logoBg}`}>
          {c.logoIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-bold text-gray-900 truncate">{c.name}</span>
            {c.verified && <VerifiedBadge />}
          </div>
          <div className="text-[11px] text-gray-500 truncate">{c.industry} › {c.subcategory}</div>
        </div>
      </div>

      <div className="px-3 pb-2 text-[11px] text-gray-500 leading-snug">{c.summary}</div>

      {/* Image + industries */}
      <div className="px-3 pb-2.5 flex gap-3 border-t border-gray-100 pt-2.5">
        <CompanyPhoto c={c} />
        <div className="flex-1 min-w-0">
          <div className="text-[9px] text-gray-400 mb-1">Industries Served</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {c.industriesServed.map((ind) => (
              <span key={ind} className="flex items-center gap-1 text-[10px] text-gray-600">
                <span className="text-xs">{industryServedIcon(ind)}</span>{ind}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <svg className="w-3 h-3 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {c.location}
          </div>
        </div>
      </div>

      {/* Capability tags */}
      <div className="px-3 pb-2 flex flex-wrap gap-1">
        {displayCaps.map((cap) => (
          <span key={cap} className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">
            {cap}
          </span>
        ))}
        {overflow > 0 && <span className="text-[10px] text-gray-400 self-center">+{overflow}</span>}
      </div>

      {/* Equipment line */}
      <div className="px-3 pb-2 text-[11px] text-gray-600 leading-snug border-t border-gray-100 pt-2">
        <span className="font-semibold text-gray-700">{equipLabel}:</span> {c.equipment}
      </div>

      {/* Certifications */}
      {c.certifications.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {c.certifications.map((cert) => (
            <span key={cert} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-medium">
              {cert}
            </span>
          ))}
        </div>
      )}

      {/* Opportunity tags */}
      <div className="px-3 pb-2.5 flex flex-wrap gap-1 border-t border-gray-100 pt-2">
        {c.opportunityTags.map((tag) => (
          <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${opportunityTagStyle(tag)}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="px-3 py-2.5 flex flex-wrap items-center gap-2 border-t border-gray-100 bg-gray-50/50 mt-auto">
        <Link
          href={`/company/${companySlugFromName(c.name)}`}
          className="px-3 py-1.5 text-xs font-medium border border-blue-600 rounded text-blue-700 hover:bg-blue-50 transition-colors"
        >
          View Profile
        </Link>
        <Link href="/my-messages" className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors">
          Message
        </Link>
        <button
          onClick={() =>
            setFollowing((v) => {
              const next = !v;
              void setFollowCompany(c.id, next);
              return next;
            })
          }
          aria-pressed={following}
          className={`sm:ml-auto px-2.5 py-1.5 text-xs font-medium border rounded transition-colors ${
            following
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {following ? "Following" : "Follow"}
        </button>
        <button
          onClick={() =>
            setSaved((v) => {
              const next = !v;
              void setSavedCompany(c.id, next); // guarded: no-op without Supabase
              return next;
            })
          }
          aria-pressed={saved}
          className={`flex items-center gap-1 text-xs transition-colors ${
            saved ? "text-blue-700" : "text-gray-500 hover:text-gray-700"
          }`}
          title={saved ? "Saved" : "Save company"}
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

export default function MyNetworkPage() {
  const [activeTab, setActiveTab]     = useState<FilterTab>("all");
  const { filters, update, reset, hasActiveFilters } = useListingFilters();
  const [listingStatus, setListingStatus] = useState<"all" | "active" | "expired">("all");
  const [savedRows, setSavedRows] = useState<SavedListing[]>([]);
  const [companyRows, setCompanyRows] = useState<Company[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchNetworkData().then((data) => {
      if (!active) return;
      if (data === null) {
        setLoaded(true);
        return;
      }
      const savedSet = new Set(data.savedCompanyIds);
      const followSet = new Set(data.followedCompanyIds);
      const mapped: Company[] = data.companies.map((c) => {
        const id = String(c.id ?? "");
        const name = String(c.name ?? "");
        const tabs: Company["tabs"] = [];
        if (followSet.has(id)) tabs.push("following");
        if (savedSet.has(id)) tabs.push("saved-companies");
        const caps = Array.isArray(c.capabilities) ? (c.capabilities as unknown[]).map(String) : [];
        const tags = Array.isArray(c.tags) ? (c.tags as unknown[]).map(String) : [];
        const certs = data.profileCertsByCompany[id] ?? [];
        const oppTags = data.opportunityTagsByCompany[id] ?? [];
        return {
          id,
          type: "offer",
          name,
          location: String(c.location ?? ""),
          industry: String(c.industry ?? ""),
          subcategory: String(c.subcategory ?? ""),
          categoryLabel: String(c.industry ?? ""),
          summary: String(c.about ?? c.tagline ?? ""),
          capabilities: caps,
          industriesServed: tags,
          certifications: certs,
          equipment: "",
          equipmentLabel: "Capabilities",
          opportunityTags: oppTags,
          verified:
            c.verification_status === "verified" || (!c.verification_status && Boolean(c.verified)),
          tabs,
          logoBg: String(c.logo_color ?? "bg-blue-700 text-white"),
          logoIcon: String(c.logo_initials ?? (name[0] ?? "C").toUpperCase()),
          photoBg: "",
          photoLabel: "",
        };
      });
      setCompanyRows(mapped);

      const mappedSaved: SavedListing[] = data.savedListings.flatMap((r) => {
        const l = (r.listings ?? null) as Record<string, unknown> | null;
        if (!l) return [];
        const companyObj = (l.companies ?? null) as Record<string, unknown> | null;
        return [{
          id: String(l.id ?? r.listing_id ?? ""),
          company: String(companyObj?.name ?? ""),
          title: String(l.title ?? ""),
          industry: String(l.industry ?? ""),
          type: l.type === "need" ? "need" : "offer",
          saved: "",
          status: l.availability_status === "expired" ? "expired" : "active",
        }];
      });
      setSavedRows(mappedSaved);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const isSavedListings = activeTab === "saved-listings";

  const facets = useMemo(() => buildFacets(companyRows.map(companyToFields)), [companyRows]);

  const filteredCompanies = useMemo(() => {
    const tabFiltered = companyRows.filter(
      (c) => activeTab === "all" || c.tabs.includes(activeTab as Exclude<FilterTab, "all" | "saved-listings">)
    );
    const result = filterListings(tabFiltered, companyToFields, filters);
    if (filters.sort === "name") {
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [companyRows, activeTab, filters]);

  const filteredListings = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return savedRows.filter((l) =>
      (listingStatus === "all" || l.status === listingStatus) &&
      (!q || l.title.toLowerCase().includes(q) || l.company.toLowerCase().includes(q))
    );
  }, [listingStatus, filters.search, savedRows]);

  const removeSavedRow = (id: string) => {
    setSavedRows((rows) => rows.filter((l) => l.id !== id));
    void setSavedListing(id, false); // guarded: no-op without Supabase
  };

  const followingCount = companyRows.filter((c) => c.tabs.includes("following")).length;
  const savedCompanyCount = companyRows.filter((c) => c.tabs.includes("saved-companies")).length;
  const connectionCount = companyRows.filter((c) => c.tabs.includes("connections")).length;

  const kpis = [
    {
      tab: "following" as FilterTab,
      label: "Following", value: followingCount,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V19a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
      ),
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      tab: "saved-companies" as FilterTab,
      label: "Saved Companies", value: savedCompanyCount,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      iconBg: "bg-green-100 text-green-600",
    },
    {
      tab: "saved-listings" as FilterTab,
      label: "Saved Listings", value: savedRows.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      iconBg: "bg-orange-100 text-orange-500",
    },
    {
      tab: "connections" as FilterTab,
      label: "Connections", value: connectionCount,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4 min-w-0">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-base font-bold text-gray-900">My Network</h1>
        <p className="text-xs text-gray-400 mt-0.5">Discover and connect with companies in your network.</p>
      </div>

      {/* KPI row — clickable tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-0 bg-white border border-gray-200 rounded-xl mb-4 lg:overflow-hidden">
        {kpis.map((kpi, i) => (
          <button key={kpi.tab} onClick={() => setActiveTab(activeTab === kpi.tab ? "all" : kpi.tab)}
            className={`flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3 px-3 py-4 lg:px-5 lg:py-3.5 transition-colors text-left rounded-xl lg:rounded-none border border-gray-200 lg:border-0 ${
              i < kpis.length - 1 ? "lg:border-r lg:border-gray-200" : ""
            } ${activeTab === kpi.tab ? "bg-blue-50" : "hover:bg-gray-50"}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
              {kpi.icon}
            </div>
            <div>
              <div className={`text-lg lg:text-base font-bold leading-tight ${activeTab === kpi.tab ? "text-blue-700" : "text-gray-900"}`}>
                {kpi.value}
              </div>
              <div className="text-xs text-gray-500 leading-snug">{kpi.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Unified filter row */}
      <ListingFilters
        filters={filters}
        onChange={update}
        onReset={reset}
        hasActiveFilters={hasActiveFilters}
        searchPlaceholder="Search companies, capabilities..."
        resultLabel={
          isSavedListings
            ? `${filteredListings.length} saved listing${filteredListings.length !== 1 ? "s" : ""}`
            : `${filteredCompanies.length} compan${filteredCompanies.length !== 1 ? "ies" : "y"}`
        }
        options={{
          industries: facets.industries,
          subcategoriesByIndustry: facets.subcategoriesByIndustry,
          capabilities: facets.capabilities,
          locations: facets.locations,
          opportunityTypes: facets.opportunityTypes,
          certifications: facets.certifications,
          sortOptions: networkSortOptions,
        }}
      />

      {/* Company grid */}
      {!isSavedListings && (
        filteredCompanies.length === 0 ? (
          <div className="py-12 text-center bg-white border border-gray-200 rounded-xl px-6">
            {!loaded ? (
              <p className="text-sm text-gray-400">Loading network…</p>
            ) : companyRows.length === 0 ? (
              <>
                <p className="text-sm text-gray-600">No approved companies on CapMaxx yet.</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  As businesses join and get approved, you can follow and connect with them here.
                </p>
                <Link href="/i-offer" className="text-xs font-medium text-blue-700 hover:underline">
                  Browse marketplace listings →
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-400">No companies match your filters.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredCompanies.map((c) => <CompanyCard key={c.id} c={c} />)}
          </div>
        )
      )}

      {/* Saved listings */}
      {isSavedListings && (
        <>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs text-gray-500 mr-1">Status:</span>
            {(["all", "active", "expired"] as const).map((f) => (
              <button key={f} onClick={() => setListingStatus(f)}
                className={`text-xs px-2.5 py-1 rounded-full border capitalize transition-colors ${
                  listingStatus === f
                    ? "border-blue-700 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}>
                {f}
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {filteredListings.length === 0 ? (
              <div className="py-8 text-center px-6">
                {!loaded ? (
                  <p className="text-sm text-gray-400">Loading saved listings…</p>
                ) : savedRows.length === 0 ? (
                  <>
                    <p className="text-sm text-gray-600">No saved listings yet.</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      Save listings from I Offer or I Need to revisit them here.
                    </p>
                    <Link href="/i-offer" className="text-xs font-medium text-blue-700 hover:underline">
                      Browse listings →
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No listings match your filters.</p>
                )}
              </div>
            ) : (
              filteredListings.map((l) => (
                <div key={l.id} className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${l.status === "expired" ? "opacity-60" : ""}`}>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 self-start ${
                    l.type === "offer" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}>
                    {l.type === "offer" ? "Offer" : "Need"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${l.status === "expired" ? "text-gray-400 line-through" : "text-gray-900"}`}>{l.title}</div>
                    <div className="text-xs text-gray-400 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>{l.company}</span>
                      <span className="hidden sm:inline text-gray-300">·</span>
                      <span>{l.industry}</span>
                      {l.saved && (
                        <>
                          <span className="hidden sm:inline text-gray-300">·</span>
                          <span>Saved {l.saved}</span>
                        </>
                      )}
                      {l.status === "expired" && <span className="text-red-400 font-medium">Expired</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs shrink-0 items-center">
                    {l.status === "active" ? (
                      <>
                        <Link href={`/company/${companySlugFromName(l.company)}`} className="text-blue-700 hover:underline">View</Link>
                        <Link href="/my-messages" className="text-blue-700 hover:underline">Message</Link>
                      </>
                    ) : <span className="text-gray-400 text-[11px]">Expired</span>}
                    <button onClick={() => removeSavedRow(l.id)} className="text-gray-400 hover:text-red-500 ml-1">Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
