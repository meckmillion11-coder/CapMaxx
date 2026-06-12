"use client";

import { useEffect, useState, useRef } from "react";
import { industryMap, opportunityTypes } from "@/lib/industries";
import { createListing } from "@/lib/db/listings";
import { fetchMyCompanyPrefill } from "@/lib/db/reads";

// ── Mock "My Business" profile ──────────────────────────────────────────────
// In production this would come from the authenticated user's saved profile.
const myProfile = {
  name:        "Midwest Precision Parts Co.",
  website:     "midwestprecision.com",
  location:    "Chicago, IL",
  industry:    "Manufacturing",
  subcategory: "CNC Machining",
  description: "Family-owned precision machining company serving aerospace and automotive industries since 1998. ISO 9001 and AS9100D certified.",
  logoLetter:  "M",
  logoColor:   "bg-blue-100 text-blue-800",
  contacts: [
    { id: "0", name: "James Hartley", position: "Operations Manager", phone: "(312) 555-0182", email: "james@midwestprecision.com", linkedin: "linkedin.com/in/james-hartley" },
  ],
};

// ── Tag suggestions per industry/subcategory ─────────────────────────────────
const tagSuggestions: Record<string, Record<string, string[]>> = {
  "Food & Beverage": {
    "Bakery":         ["Bread", "Cookies", "Muffins", "Croissants", "Private Label", "Frozen Bakery", "Wholesale"],
    "Dairy":          ["Cheese", "Yogurt", "Butter", "Cream", "Private Label Dairy"],
    "Co-Packing":     ["Filling & Sealing", "Private Label", "Dry Goods", "Wet Fill", "Flexible Packaging"],
    "Beverage":       ["Still Water", "Carbonated", "Juice", "Energy Drinks", "Private Label Beverage"],
    "Meat Processing":["Slaughter", "Fabrication", "Grinding", "Co-Packing", "USDA Inspected"],
    "Frozen Food":    ["Frozen Meals", "IQF", "Blast Freezing", "Co-Packing", "Private Label"],
    "Poultry":        ["Whole Bird", "Cut Parts", "Deboning", "Marinating", "USDA Inspected"],
  },
  "Manufacturing": {
    "CNC Machining":     ["CNC Turning", "CNC Milling", "5-Axis", "Precision Parts", "Prototype", "Aerospace", "Automotive"],
    "Metal Fabrication": ["Laser Cutting", "Welding", "Powder Coating", "Sheet Metal", "Structural", "Assembly"],
    "Injection Molding": ["Plastic Parts", "Tooling Design", "ABS", "Polypropylene", "High-Volume Runs"],
    "Assembly":          ["Sub-Assembly", "Final Assembly", "Kitting", "Testing", "Packaging", "Rework"],
    "Welding":           ["MIG", "TIG", "Structural", "Stainless Steel", "Aluminum", "AWS D1.1"],
    "Fabrication":       ["Shearing", "Bending", "Forming", "Punching", "Rolling", "Cutting"],
    "Powder Coating":    ["Electrostatic", "Wet Paint", "Sandblasting", "Primer", "Custom Colors"],
  },
  "Logistics": {
    "Cold Storage":    ["Frozen Storage", "Refrigerated", "Cross-Docking", "Distribution", "Blast Freezing", "FDA"],
    "Warehousing":     ["Dry Storage", "Pick & Pack", "Fulfillment", "Cross-Dock", "Overflow Storage"],
    "Transportation":  ["Dry Van", "Flatbed", "Refrigerated", "LTL", "Full Truckload"],
    "Distribution":    ["Last-Mile", "Regional Distribution", "Wholesale", "E-Commerce", "Retail Distribution"],
  },
  "Freight": {
    "Dry Van":       ["OTR", "LTL", "Full Truckload", "Regional", "Midwest Routes", "Southeast Routes"],
    "Refrigerated":  ["Frozen", "Fresh Produce", "Dairy", "Pharma Cold Chain", "FDA Compliant"],
    "Flatbed":       ["Oversized", "Heavy Haul", "Construction Equipment", "Steel Coils", "Machinery"],
    "LTL":           ["Less Than Truckload", "Pallet Shipping", "Regional LTL", "National Coverage"],
  },
  "Electronics": {
    "PCB Assembly":          ["SMT", "Through-Hole", "BGA", "Prototype", "Volume Production", "IPC-A-610"],
    "Contract Manufacturing":["Box Build", "Cable Harness", "Testing", "NPI", "Firmware Loading"],
    "Testing & Inspection":  ["ICT", "Functional Test", "AOI", "X-Ray", "Environmental Testing"],
  },
  "Construction": {
    "General Contractor": ["Commercial", "Industrial", "Renovation", "Ground-Up", "Design-Build"],
    "Concrete":           ["Foundations", "Flatwork", "Tilt-Up", "Precast", "Structural"],
    "Steel & Structural": ["Erection", "Fabrication", "Welding", "Design", "Miscellaneous Metals"],
  },
};

// ──────────────────────────────────────────────────────────────────────────────

interface Contact { id: string; name: string; position: string; phone: string; email: string; linkedin: string; }
interface CertItem { id: string; value: string; }
interface PhotoItem { id: string; name: string; size: string; preview?: string; title: string; description: string; }
interface VideoItem { id: string; name: string; size: string; title: string; description: string; }

let idCounter = 1;
function uid() { return String(idCounter++); }
function newCert(): CertItem { return { id: uid(), value: "" }; }

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
const selectCls = `${inputCls} bg-white`;

export default function RequestFormPage() {
  // Listing type
  const [listingType, setListingType] = useState<"offer" | "need">("offer");

  // Company info — pre-filled from profile; toggled editable
  const [companyExpanded, setCompanyExpanded] = useState(false);
  const [companyName, setCompanyName]         = useState(myProfile.name);
  const [website, setWebsite]                 = useState(myProfile.website);
  const [location, setLocation]               = useState(myProfile.location);
  const [companyDesc, setCompanyDesc]         = useState(myProfile.description);

  // Industry + subcategory + tags
  const [industry, setIndustry]           = useState(myProfile.industry);
  const [subcategory, setSubcategory]     = useState(myProfile.subcategory);
  const [tags, setTags]                   = useState<string[]>([]);
  const [tagInput, setTagInput]           = useState("");

  // Capability / service title for the listing.
  const [capability, setCapability]       = useState("");

  // Certifications
  const [certifications, setCertifications] = useState<CertItem[]>([newCert()]);

  // Opportunity preferences
  const [opportunities, setOpportunities] = useState<string[]>([]);

  // Contacts — pre-filled from profile
  const [contacts, setContacts] = useState<Contact[]>(myProfile.contacts.map((c) => ({ ...c })));

  // Media
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  // Prefill company info from the signed-in user's real company when Supabase
  // is configured. Falls back to the mock `myProfile` defaults otherwise.
  useEffect(() => {
    let active = true;
    void fetchMyCompanyPrefill().then((c) => {
      if (!active || !c) return;
      if (c.name) setCompanyName(c.name);
      if (c.website) setWebsite(c.website);
      if (c.location) setLocation(c.location);
      if (c.description) setCompanyDesc(c.description);
      if (c.industry) setIndustry(c.industry);
      if (c.subcategory) setSubcategory(c.subcategory);
    });
    return () => {
      active = false;
    };
  }, []);

  // Computed
  const subcategories = industry ? (industryMap[industry] ?? []) : [];
  const suggestedTags: string[] = (tagSuggestions[industry]?.[subcategory] ?? []).filter((t) => !tags.includes(t));
  const filledCerts = certifications.filter((c) => c.value.trim());

  // Tag helpers
  const addTag = (val: string) => {
    const v = val.trim();
    if (v && !tags.includes(v)) setTags((p) => [...p, v]);
  };
  const removeTag = (t: string) => setTags((p) => p.filter((x) => x !== t));
  const handleTagKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); setTagInput(""); }
  };

  // Cert helpers
  const updateCert = (id: string, val: string) => setCertifications((p) => p.map((c) => c.id === id ? { ...c, value: val } : c));
  const removeCert = (id: string) => setCertifications((p) => p.filter((c) => c.id !== id));

  // Opportunity helpers
  const toggleOp = (op: string) => setOpportunities((p) => p.includes(op) ? p.filter((o) => o !== op) : [...p, op]);

  // Contact helpers
  const updateContact = (id: string, field: keyof Contact, val: string) =>
    setContacts((p) => p.map((c) => c.id === id ? { ...c, [field]: val } : c));
  const removeContact = (id: string) => setContacts((p) => p.filter((c) => c.id !== id));
  const addContact = () => setContacts((p) => [...p, { id: uid(), name: "", position: "", phone: "", email: "", linkedin: "" }]);

  // Photo/Video helpers
  const updatePhoto = (id: string, field: keyof PhotoItem, val: string) => setPhotos((p) => p.map((ph) => ph.id === id ? { ...ph, [field]: val } : ph));
  const removePhoto = (id: string) => setPhotos((p) => p.filter((ph) => ph.id !== id));
  const updateVideo = (id: string, field: keyof VideoItem, val: string) => setVideos((p) => p.map((v) => v.id === id ? { ...v, [field]: val } : v));
  const removeVideo = (id: string) => setVideos((p) => p.filter((v) => v.id !== id));

  if (submitted) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-1">Listing Submitted</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Your listing is under review and will be published shortly.</p>
        <div className="flex gap-3 justify-center">
          <a href="/i-offer" className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700">Browse Listings</a>
          <button onClick={() => setSubmitted(false)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded">Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-bold text-gray-900">My Request Form</h1>
          <p className="text-xs text-gray-400">Post a new listing — what you offer or what you need</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">

          {/* ── LISTING TYPE ── */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <SectionHeader title="Listing Type" />
            <div className="flex gap-3">
              {(["offer", "need"] as const).map((t) => (
                <button key={t} onClick={() => setListingType(t)}
                  className={`flex-1 py-2.5 rounded border-2 text-sm font-semibold transition-colors ${
                    listingType === t
                      ? t === "offer" ? "border-green-600 bg-green-50 text-green-700" : "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}>
                  {t === "offer" ? "We Offer" : "We Need"}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {listingType === "offer"
                ? "Advertise capacity, services, products, or expertise your business can provide."
                : "Find businesses that can provide capacity, services, products, or expertise you need."}
            </p>
          </div>

          {/* ── COMPANY PROFILE (pre-filled) ── */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            {/* Collapsed summary */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${myProfile.logoColor}`}>
                {myProfile.logoLetter}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900">{companyName}</div>
                <div className="text-xs text-gray-400">{location} · <span className="text-blue-600">Profile auto-filled</span></div>
              </div>
              <button onClick={() => setCompanyExpanded((v) => !v)}
                className="text-xs text-blue-700 hover:text-blue-800 font-medium shrink-0 flex items-center gap-1 transition-colors">
                {companyExpanded ? "Collapse" : "Edit Company Info"}
                <svg className={`w-3.5 h-3.5 transition-transform ${companyExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Expanded editable fields */}
            {companyExpanded && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                <p className="text-xs text-gray-400 mb-3">These fields are pre-filled from your company profile. Edit if this listing uses different company details.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Company Name" required>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Website">
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputCls} placeholder="https://yourcompany.com" />
                  </FormField>
                  <FormField label="Location" required>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField label="Company Description">
                      <textarea rows={3} value={companyDesc} onChange={(e) => setCompanyDesc(e.target.value)} className={`${inputCls} resize-none`} />
                    </FormField>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── INDUSTRY + SUBCATEGORY + TAGS ── */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <SectionHeader
              title="Industry & Capabilities"
              subtitle="Used for matching your listing with the right buyers, suppliers, and partners"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <FormField label="Industry" required>
                <select value={industry} onChange={(e) => { setIndustry(e.target.value); setSubcategory(""); setTags([]); }} className={selectCls}>
                  <option value="">Select industry...</option>
                  {Object.keys(industryMap).map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </FormField>
              <FormField label="Subcategory" required>
                <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setTags([]); }} className={selectCls} disabled={!industry}>
                  <option value="">Select subcategory...</option>
                  {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tags <span className="text-gray-400 font-normal">(specific capabilities, products, or services)</span>
              </label>

              {/* Tag chips */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-700 leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag input */}
              <div className="flex gap-2">
                <input
                  type="text" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  placeholder="Type a tag and press Enter or comma..."
                  className={`flex-1 ${inputCls}`}
                />
                <button onClick={() => { addTag(tagInput); setTagInput(""); }}
                  className="px-3 py-1.5 text-sm font-medium border border-blue-300 text-blue-700 hover:bg-blue-50 rounded transition-colors whitespace-nowrap">
                  + Add Tag
                </button>
              </div>

              {/* Suggested tags */}
              {subcategory && suggestedTags.length > 0 && (
                <div className="mt-2">
                  <p className="text-[11px] text-gray-400 mb-1.5">
                    Suggested for <span className="font-medium text-gray-500">{industry} › {subcategory}</span>:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTags.slice(0, 8).map((tag) => (
                      <button key={tag} onClick={() => addTag(tag)}
                        className="text-xs px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Example hint (only shown when no industry selected yet) */}
              {!industry && (
                <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-100 text-xs text-gray-400 space-y-1">
                  <p><span className="font-medium text-gray-500">Example — Food &amp; Beverage › Bakery:</span> Bread, Cookies, Muffins, Croissants, Private Label</p>
                  <p><span className="font-medium text-gray-500">Example — Manufacturing › Metal Fabrication:</span> Laser Cutting, CNC Machining, Welding, Powder Coating</p>
                  <p><span className="font-medium text-gray-500">Example — Logistics › Cold Storage:</span> Frozen Storage, Cross-Docking, Distribution, Blast Freezing</p>
                </div>
              )}
            </div>
          </div>

          {/* ── CAPABILITY ── */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <SectionHeader
              title="Opportunity Details"
              subtitle={listingType === "offer" ? "Describe this specific offer — capacity, timeline, and details" : "Describe exactly what you are looking for"}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <FormField label="Capability / Service" required>
                  <input type="text" value={capability} onChange={(e) => setCapability(e.target.value)} className={inputCls}
                    placeholder={listingType === "offer" ? "e.g. CNC Machining – Precision Aerospace Parts" : "e.g. Looking for Cold Storage Partner, 10,000 sq ft"} />
                </FormField>
              </div>
              <FormField label="Capacity">
                <input type="text" className={inputCls} placeholder="e.g. 500 units/week, 10,000 sq ft, 15 trucks" />
              </FormField>
              <FormField label="Lead Time">
                <input type="text" className={inputCls} placeholder="e.g. 3–5 business days, Same day" />
              </FormField>
              <FormField label="Minimum Order Quantity (MOQ)">
                <input type="text" className={inputCls} placeholder="e.g. 50 units, 100 pallets, 1 project" />
              </FormField>
              <div />
              <FormField label="Available From" required hint="When this opportunity becomes available">
                <input type="date" className={inputCls} />
              </FormField>
              <FormField label="Available Until" hint="Leave blank for ongoing availability">
                <input type="date" className={inputCls} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Details & Notes">
                  <textarea rows={5} className={`${inputCls} resize-y`}
                    placeholder={listingType === "offer"
                      ? "Equipment, materials, product specs, production limits, service area, certifications required, or any other relevant details..."
                      : "Specifications, requirements, volume, timeline, location preferences, certifications required..."} />
                </FormField>
              </div>
            </div>
          </div>

          {/* ── CERTIFICATIONS ── */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <SectionHeader title="Certifications" subtitle="Enter each certification separately. Verification happens later." />
            <div className="space-y-2">
              {certifications.map((cert, idx) => (
                <div key={cert.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">
                      {idx === 0 ? "Certification" : `Certification ${idx + 1}`}
                    </label>
                    <input type="text" value={cert.value} onChange={(e) => updateCert(cert.id, e.target.value)}
                      className={inputCls} placeholder="e.g. ISO 9001, HACCP, SQF Level 2, FMCSA" />
                  </div>
                  {certifications.length > 1 && (
                    <button onClick={() => removeCert(cert.id)}
                      className="mt-5 p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setCertifications((p) => [...p, newCert()])}
              className="mt-3 flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              + Add Certification
            </button>
          </div>

          {/* ── OPPORTUNITY PREFERENCES ── */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <SectionHeader title="Opportunity Preferences" subtitle="Select the types of business opportunities you are open to" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {opportunityTypes.map((op) => (
                <label key={op}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded border cursor-pointer transition-colors select-none ${
                    opportunities.includes(op) ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}>
                  <input type="checkbox" checked={opportunities.includes(op)} onChange={() => toggleOp(op)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-700 cursor-pointer" />
                  <span className={`text-sm ${opportunities.includes(op) ? "text-blue-800 font-medium" : "text-gray-700"}`}>{op}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── PHOTOS ── */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <SectionHeader title="Photos" />
            <input ref={photoRef} type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setPhotos((p) => [...p, ...files.map((f) => ({
                  id: uid(), name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
                  preview: URL.createObjectURL(f), title: "", description: "",
                }))]);
                e.target.value = "";
              }} />
            {photos.length > 0 && (
              <div className="space-y-3 mb-3">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="border border-gray-200 rounded p-3 bg-gray-50/40">
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-16 rounded border border-gray-200 bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {photo.preview
                          ? <img src={photo.preview} alt={photo.name} className="w-full h-full object-cover" />
                          : <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        }
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Photo {idx + 1}</span>
                          <button onClick={() => removePhoto(photo.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                        </div>
                        <input type="text" value={photo.title} onChange={(e) => updatePhoto(photo.id, "title", e.target.value)}
                          className={inputCls} placeholder="Label / Title (optional)" />
                        <textarea rows={2} value={photo.description} onChange={(e) => updatePhoto(photo.id, "description", e.target.value)}
                          className={`${inputCls} resize-none`} placeholder="Description — shown when viewer opens the photo (optional)" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => photoRef.current?.click()}
              className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors py-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {photos.length === 0 ? "Add Photo" : "Add Another Photo"}
              <span className="text-xs text-gray-400 font-normal">(PNG, JPG up to 10 MB)</span>
            </button>
          </div>

          {/* ── VIDEOS ── */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <SectionHeader title="Videos" />
            <input ref={videoRef} type="file" multiple accept="video/*" className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setVideos((p) => [...p, ...files.map((f) => ({
                  id: uid(), name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB`, title: "", description: "",
                }))]);
                e.target.value = "";
              }} />
            {videos.length > 0 && (
              <div className="space-y-3 mb-3">
                {videos.map((video, idx) => (
                  <div key={video.id} className="border border-gray-200 rounded p-3 bg-gray-50/40">
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-16 rounded border border-gray-200 bg-gray-100 shrink-0 flex flex-col items-center justify-center gap-1">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                        <span className="text-[9px] text-gray-400 truncate max-w-[72px] px-1">{video.name}</span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Video {idx + 1}</span>
                          <button onClick={() => removeVideo(video.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                        </div>
                        <input type="text" value={video.title} onChange={(e) => updateVideo(video.id, "title", e.target.value)}
                          className={inputCls} placeholder="Label / Title (optional)" />
                        <textarea rows={2} value={video.description} onChange={(e) => updateVideo(video.id, "description", e.target.value)}
                          className={`${inputCls} resize-none`} placeholder="Description — shown when viewer opens the video (optional)" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => videoRef.current?.click()}
              className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors py-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {videos.length === 0 ? "Add Video" : "Add Another Video"}
              <span className="text-xs text-gray-400 font-normal">(MP4, MOV up to 100 MB)</span>
            </button>
          </div>

          {/* ── CONTACTS ── */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <SectionHeader title="Contacts" subtitle="Pre-filled from your company profile. Add or edit contacts for this listing." />
            <div className="space-y-4">
              {contacts.map((contact, idx) => (
                <div key={contact.id} className="border border-gray-200 rounded p-3 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {idx === 0 ? "Primary Contact" : `Additional Contact ${idx + 1}`}
                    </span>
                    {idx > 0 && (
                      <button onClick={() => removeContact(contact.id)} className="text-xs text-red-500 hover:text-red-700 hover:underline">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name{idx === 0 && <span className="text-red-400 ml-0.5">*</span>}</label>
                      <input type="text" value={contact.name} onChange={(e) => updateContact(contact.id, "name", e.target.value)} className={inputCls} placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Position / Title</label>
                      <input type="text" value={contact.position} onChange={(e) => updateContact(contact.id, "position", e.target.value)} className={inputCls} placeholder="e.g. Operations Manager" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Phone</label>
                      <input type="tel" value={contact.phone} onChange={(e) => updateContact(contact.id, "phone", e.target.value)} className={inputCls} placeholder="(555) 000-0000" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Email{idx === 0 && <span className="text-red-400 ml-0.5">*</span>}</label>
                      <input type="email" value={contact.email} onChange={(e) => updateContact(contact.id, "email", e.target.value)} className={inputCls} placeholder="contact@company.com" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                      <input type="url" value={contact.linkedin} onChange={(e) => updateContact(contact.id, "linkedin", e.target.value)} className={inputCls} placeholder="https://linkedin.com/in/username" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addContact}
              className="mt-3 flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              + Add Contact
            </button>
          </div>

          {/* ── SUBMIT ── */}
          <div className="flex justify-end items-center gap-3 pb-6">
            {draftSaved && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Draft saved
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setDraftSaved(true);
                window.setTimeout(() => setDraftSaved(false), 2500);
              }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            {submitError && <span className="text-xs text-red-600 font-medium">{submitError}</span>}
            <button type="button" disabled={submitting} onClick={async () => {
                // Guarded persistence: awaits the real Supabase insert when
                // configured (and the user has a company). When unconfigured the
                // helper returns { configured:false } and we keep the demo flow.
                setSubmitError("");
                setSubmitting(true);
                const res = await createListing({
                  type: listingType,
                  title: capability.trim() || "Untitled Listing",
                  capability: capability.trim(),
                  industry,
                  subcategory,
                  tags,
                });
                setSubmitting(false);
                if (res.configured && !res.ok) {
                  setSubmitError(res.error ?? "Could not publish listing. Please try again.");
                  return;
                }
                setSubmitted(true);
              }}
              className="px-6 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit Listing"}
            </button>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">How It Works</h3>
            <ol className="space-y-2">
              {["Fill out this form", "We review your listing", "Listing goes live on CapMaxx", "Businesses discover and connect with you"].map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-blue-800">
                  <span className="w-4 h-4 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* Live summary */}
          <div className="bg-white border border-gray-200 rounded p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Listing Summary</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className={`font-semibold ${listingType === "offer" ? "text-green-700" : "text-orange-700"}`}>
                  {listingType === "offer" ? "We Offer" : "We Need"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Industry</span>
                <span className="text-gray-700 font-medium">{industry || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Subcategory</span>
                <span className="text-gray-700 font-medium">{subcategory || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tags</span>
                <span className="text-gray-700 font-medium">{tags.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Certifications</span>
                <span className="text-gray-700 font-medium">{filledCerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Photos</span>
                <span className="text-gray-700 font-medium">{photos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Videos</span>
                <span className="text-gray-700 font-medium">{videos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contacts</span>
                <span className="text-gray-700 font-medium">{contacts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Opportunities</span>
                <span className="text-gray-700 font-medium">{opportunities.length} selected</span>
              </div>
            </div>
            {tags.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => <span key={t} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium">{t}</span>)}
                </div>
              </div>
            )}
            {filledCerts.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Certifications</p>
                <div className="flex flex-wrap gap-1">
                  {filledCerts.map((c) => <span key={c.id} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium">{c.value}</span>)}
                </div>
              </div>
            )}
            {opportunities.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Opportunity Prefs</p>
                <div className="flex flex-wrap gap-1">
                  {opportunities.map((op) => <span key={op} className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">{op}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Tips</h3>
            <ul className="space-y-1.5">
              {[
                "Add specific tags — they improve match quality",
                "Upload real photos — 3× more responses",
                "Add a video tour of your facility",
                "Select all relevant opportunity types",
                "Add multiple contacts for faster replies",
              ].map((tip) => (
                <li key={tip} className="flex gap-2 text-xs text-gray-600">
                  <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
