"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { externalHref, type CompanyContact } from "@/lib/companyContact";
import { industryMap } from "@/lib/industries";
import type { CompanyProfile } from "@/lib/mockCompanies";
import { fetchMyCompanyProfileForm } from "@/lib/db/reads";
// Supabase persistence (all guarded — no-ops when Supabase isn't configured).
import { saveCurrentUserCompany, setCompanyImage } from "@/lib/db/companies";
import { saveCompanyProfile } from "@/lib/db/profiles";
import { uploadCompanyLogo, uploadCompanyCover } from "@/lib/supabase/storage";

// ── Shared styles ───────────────────────────────────────────────────────────
const inputCls =
  "w-full px-2.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
const selectCls = `${inputCls} bg-white`;
const labelCls = "block text-[11px] font-medium text-gray-500 mb-1";

let idCounter = 1;
const uid = () => `cp-${idCounter++}`;

// ── Editable row models (extend the read-only shapes with a stable id) ───────
interface EditableLocation {
  id: string;
  name: string;
  address: string;
  type: string;
  contact: string;
}
interface EditableCert {
  id: string;
  name: string;
  description: string;
}
interface EditableMarket {
  id: string;
  country: string;
  flag: string;
}
interface EditablePhoto {
  id: string;
  label: string;
  gradient: string;
  preview?: string;
}
interface EditableVideo {
  id: string;
  title: string;
  duration: string;
  gradient: string;
  preview?: string;
  url?: string;
}
interface EditableDoc {
  id: string;
  name: string;
  size: string;
}

// ── Contact / communication link fields (preserved from prior implementation)─
type LinkField = {
  key: keyof CompanyContact;
  label: string;
  placeholder: string;
  type?: string;
};

const LINK_FIELDS: LinkField[] = [
  { key: "website", label: "Website", placeholder: "www.yourcompany.com" },
  { key: "email", label: "Email", placeholder: "sales@yourcompany.com", type: "email" },
  { key: "phone", label: "Phone", placeholder: "+1 (312) 555-0147", type: "tel" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/company/your-company" },
  { key: "teams", label: "Microsoft Teams link", placeholder: "https://teams.microsoft.com/l/meetup-join/..." },
  { key: "zoom", label: "Zoom link", placeholder: "https://zoom.us/j/..." },
  { key: "meet", label: "Google Meet link", placeholder: "https://meet.google.com/..." },
  { key: "calendly", label: "Calendly / Booking link", placeholder: "https://calendly.com/your-company" },
];

const LOCATION_TYPES = ["Headquarters", "Plant", "Office", "Warehouse"];
const GRADIENTS = [
  "from-slate-500 to-slate-800",
  "from-blue-400 to-blue-700",
  "from-gray-400 to-gray-700",
  "from-indigo-400 to-indigo-700",
  "from-teal-400 to-teal-700",
];

// ── Small presentational helpers ─────────────────────────────────────────────
function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 border-b border-gray-100 bg-gray-50/50">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
          {hint && <p className="text-[11px] text-gray-400 leading-tight">{hint}</p>}
        </div>
        <span className="p-1 text-gray-300" title="Editable section" aria-hidden>
          <PencilIcon />
        </span>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 flex items-center gap-1.5 text-[13px] text-blue-700 hover:text-blue-800 font-medium transition-colors"
    >
      <PlusIcon />
      {label}
    </button>
  );
}

function RemoveButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Remove"
      className={`p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0 ${className}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

// ── Editable chip list (Capabilities / Tags) ──────────────────────────────────
function ChipEditor({
  chips,
  setChips,
  placeholder,
  accent = "blue",
}: {
  chips: string[];
  setChips: (next: string[]) => void;
  placeholder: string;
  accent?: "blue" | "gray";
}) {
  const [input, setInput] = useState("");
  const add = (val: string) => {
    const v = val.trim();
    if (v && !chips.includes(v)) setChips([...chips, v]);
    setInput("");
  };
  const chipCls =
    accent === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-gray-100 text-gray-600 border-gray-200";
  const xCls = accent === "blue" ? "text-blue-400 hover:text-blue-700" : "text-gray-400 hover:text-gray-700";
  return (
    <div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className={`inline-flex items-center gap-1 text-[11px] border px-2 py-0.5 rounded-full font-medium ${chipCls}`}
            >
              {chip}
              <button
                type="button"
                onClick={() => setChips(chips.filter((c) => c !== chip))}
                className={`leading-none ${xCls}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder={placeholder}
          className={`flex-1 ${inputCls}`}
        />
        <button
          type="button"
          onClick={() => add(input)}
          className="px-3 py-1.5 text-[13px] font-medium border border-blue-300 text-blue-700 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

// ── Read-only (View mode) presentational helpers ─────────────────────────────
function ViewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-3.5 py-2 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

function ViewDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-100 last:border-b-0 text-[12px]">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 text-right font-medium">{value || "—"}</span>
    </div>
  );
}

function PillList({ items, accent = "blue" }: { items: string[]; accent?: "blue" | "gray" }) {
  if (items.length === 0) return <p className="text-[12px] text-gray-400">None added.</p>;
  const cls =
    accent === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span key={it} className={`text-[11px] border px-2 py-0.5 rounded-full font-medium ${cls}`}>
          {it}
        </span>
      ))}
    </div>
  );
}

function contactHref(key: keyof CompanyContact, value: string): string {
  if (key === "email") return `mailto:${value}`;
  if (key === "phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  return externalHref(value);
}

// ── Snapshot of all editable state (captured on entering edit, restored on Cancel)
interface ProfileSnapshot {
  name: string;
  tagline: string;
  location: string;
  founded: string;
  employeeRange: string;
  cageCode: string;
  coverLabel: string;
  coverPreview: string | null;
  logoPreview: string | null;
  about: string;
  aboutExtended: string;
  contact: CompanyContact;
  details: CompanyProfile["details"];
  capabilities: string[];
  tags: string[];
  locations: EditableLocation[];
  certifications: EditableCert[];
  markets: EditableMarket[];
  gallery: EditablePhoto[];
  videos: EditableVideo[];
  documents: EditableDoc[];
}

// ──────────────────────────────────────────────────────────────────────────────
export default function CompanyProfilePage() {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [verified, setVerified] = useState(false);
  const [location, setLocation] = useState("");
  const [founded, setFounded] = useState("");
  const [employeeRange, setEmployeeRange] = useState("");
  const [cageCode, setCageCode] = useState("");
  const [coverLabel, setCoverLabel] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [about, setAbout] = useState("");
  const [aboutExtended, setAboutExtended] = useState("");

  const [contact, setContact] = useState<CompanyContact>({});

  const [details, setDetails] = useState({
    industry: "",
    subcategory: "",
    businessType: "",
    naicsCode: "",
    dunsNumber: "",
    taxId: "",
  });

  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [locations, setLocations] = useState<EditableLocation[]>([]);
  const [certifications, setCertifications] = useState<EditableCert[]>([]);
  const [markets, setMarkets] = useState<EditableMarket[]>([]);
  const [gallery, setGallery] = useState<EditablePhoto[]>([]);
  const [videos, setVideos] = useState<EditableVideo[]>([]);
  const [documents, setDocuments] = useState<EditableDoc[]>([]);

  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchMyCompanyProfileForm().then((data) => {
      if (!active || !data) {
        if (active) setLoaded(true);
        return;
      }
      setName(data.name);
      setTagline(data.tagline);
      setVerified(data.verified);
      setLocation(data.location);
      setFounded(data.founded);
      setEmployeeRange(data.employeeRange);
      setCageCode(data.cageCode);
      setCoverLabel(data.coverLabel);
      setCoverPreview(data.coverPreview);
      setLogoPreview(data.logoPreview);
      setAbout(data.about);
      setAboutExtended(data.aboutExtended);
      setContact({ ...data.contact });
      setDetails({ ...data.details });
      setCapabilities([...data.capabilities]);
      setTags([...data.tags]);
      setLocations(data.locations.map((l) => ({ id: uid(), ...l })));
      setCertifications(data.certifications.map((c) => ({ id: uid(), ...c })));
      setMarkets(data.markets.map((m) => ({ id: uid(), ...m })));
      setGallery(data.gallery.map((g) => ({ id: uid(), ...g })));
      setVideos(data.videos.map((v) => ({ id: uid(), ...v })));
      setDocuments(data.documents.map((d) => ({ id: uid(), ...d })));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // View / Edit mode — default View (read-only). Snapshot captured on entering edit.
  const [mode, setMode] = useState<"view" | "edit">("view");
  const snapshot = useRef<ProfileSnapshot | null>(null);

  // Upload refs
  const coverRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const touch = () => setSaved(false);

  const subcategories = details.industry ? industryMap[details.industry] ?? [] : [];
  const logoInitials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "CO";
  const coverGradient = "from-slate-600 via-slate-700 to-gray-900";
  const logoColor = "bg-blue-700 text-white";

  // ── Field updaters ─────────────────────────────────────────────────────────
  const updateLink = (key: keyof CompanyContact, value: string) => {
    setContact((prev) => ({ ...prev, [key]: value }));
    touch();
  };
  const updateDetail = (key: keyof typeof details, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
    touch();
  };

  // ── Uploads ─────────────────────────────────────────────────────────────────
  const onCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      touch();
      // Guarded: upload to Supabase Storage + persist URL when configured. The
      // object-URL preview above is the fallback when Supabase is absent.
      void (async () => {
        const res = await uploadCompanyCover(file);
        if (res.persisted) {
          setCoverPreview(res.url);
          await setCompanyImage("cover_url", res.url);
        }
      })();
    }
    e.target.value = "";
  };
  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      touch();
      void (async () => {
        const res = await uploadCompanyLogo(file);
        if (res.persisted) {
          setLogoPreview(res.url);
          await setCompanyImage("logo_url", res.url);
        }
      })();
    }
    e.target.value = "";
  };
  const onGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      setGallery((prev) => [
        ...prev,
        ...files.map((f, i) => ({
          id: uid(),
          label: f.name.replace(/\.[^.]+$/, ""),
          gradient: GRADIENTS[(prev.length + i) % GRADIENTS.length],
          preview: URL.createObjectURL(f),
        })),
      ]);
      touch();
    }
    e.target.value = "";
  };
  const onVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      setVideos((prev) => [
        ...prev,
        ...files.map((f, i) => ({
          id: uid(),
          title: f.name.replace(/\.[^.]+$/, ""),
          duration: "0:00",
          gradient: GRADIENTS[(prev.length + i) % GRADIENTS.length],
          preview: URL.createObjectURL(f),
        })),
      ]);
      touch();
    }
    e.target.value = "";
  };
  const onDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      setDocuments((prev) => [
        ...prev,
        ...files.map((f) => ({
          id: uid(),
          name: f.name,
          size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
        })),
      ]);
      touch();
    }
    e.target.value = "";
  };

  const enterEdit = () => {
    snapshot.current = {
      name,
      tagline,
      location,
      founded,
      employeeRange,
      cageCode,
      coverLabel,
      coverPreview,
      logoPreview,
      about,
      aboutExtended,
      contact: { ...contact },
      details: { ...details },
      capabilities: [...capabilities],
      tags: [...tags],
      locations: locations.map((l) => ({ ...l })),
      certifications: certifications.map((c) => ({ ...c })),
      markets: markets.map((m) => ({ ...m })),
      gallery: gallery.map((g) => ({ ...g })),
      videos: videos.map((v) => ({ ...v })),
      documents: documents.map((d) => ({ ...d })),
    };
    setSaved(false);
    setMode("edit");
  };

  const cancelEdit = () => {
    const s = snapshot.current;
    if (s) {
      setName(s.name);
      setTagline(s.tagline);
      setLocation(s.location);
      setFounded(s.founded);
      setEmployeeRange(s.employeeRange);
      setCageCode(s.cageCode);
      setCoverLabel(s.coverLabel);
      setCoverPreview(s.coverPreview);
      setLogoPreview(s.logoPreview);
      setAbout(s.about);
      setAboutExtended(s.aboutExtended);
      setContact({ ...s.contact });
      setDetails({ ...s.details });
      setCapabilities([...s.capabilities]);
      setTags([...s.tags]);
      setLocations(s.locations.map((l) => ({ ...l })));
      setCertifications(s.certifications.map((c) => ({ ...c })));
      setMarkets(s.markets.map((m) => ({ ...m })));
      setGallery(s.gallery.map((g) => ({ ...g })));
      setVideos(s.videos.map((v) => ({ ...v })));
      setDocuments(s.documents.map((d) => ({ ...d })));
    }
    setSaved(false);
    setMode("view");
  };

  const handleSave = () => {
    setSaved(true);
    setMode("view");
    window.setTimeout(() => setSaved(false), 2500);
    // Guarded persistence: writes the profile to Supabase when configured;
    // otherwise this is a no-op and the in-memory demo state is the source of
    // truth (UI/markup unchanged either way).
    void saveCurrentUserCompany({
      name,
      tagline,
      location,
      founded,
      employee_range: employeeRange,
      cover_label: coverLabel,
      about,
      about_extended: aboutExtended,
      industry: details.industry,
      subcategory: details.subcategory,
      business_type: details.businessType,
      naics_code: details.naicsCode,
      duns_number: details.dunsNumber,
      tax_id: details.taxId,
      website: contact.website ?? null,
      email: contact.email ?? null,
      phone: contact.phone ?? null,
      linkedin: contact.linkedin ?? null,
      capabilities,
      tags,
    });
    void saveCompanyProfile({
      markets_served: markets.map((m) => ({ country: m.country, flag: m.flag })),
      certifications: certifications.map((c) => ({ name: c.name, description: c.description })),
      documents: documents.map((d) => ({ name: d.name, size: d.size })),
    });
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4 pb-24">
      <div className="mb-4">
        <Link href="/my-business" className="text-[12px] text-blue-700 hover:underline mb-1 inline-block">
          ← Back to dashboard
        </Link>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Company Profile</h1>
            <p className="text-xs text-gray-400">
              {!loaded
                ? "Loading your company profile…"
                : mode === "edit"
                  ? "Editing — make your changes, then Save or Cancel."
                  : name
                    ? "Manage how your business appears to other companies on CapMaxx."
                    : "Add your company details so other businesses can find and connect with you."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-green-600 font-medium">Changes saved</span>}
            {mode === "view" ? (
              <button
                onClick={enterEdit}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
              >
                <PencilIcon />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-1.5 text-[13px] font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {mode === "edit" && (
        <>
      {/* ── Header / Banner ── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-3">
        <div className={`relative h-40 sm:h-48 bg-gradient-to-br ${coverGradient}`}>
          {coverPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.35)_100%)]" />
          <input ref={coverRef} type="file" accept="image/*" onChange={onCover} className="hidden" />
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-white/90 hover:bg-white text-gray-700 rounded border border-white/50 shadow-sm transition-colors"
          >
            <PencilIcon />
            {coverPreview ? "Change Cover Photo" : "Edit Cover Photo"}
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <input
              value={coverLabel}
              onChange={(e) => {
                setCoverLabel(e.target.value);
                touch();
              }}
              placeholder="Cover caption"
              className="bg-black/20 text-white placeholder-white/60 text-[11px] font-medium px-2 py-0.5 rounded border border-white/20 focus:outline-none focus:bg-black/30 max-w-xs"
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4">
          <div className="flex items-end gap-4 -mt-10">
            <div className="relative shrink-0">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-20 h-20 rounded-lg border-4 border-white shadow-md object-cover bg-white"
                />
              ) : (
                <div
                  className={`w-20 h-20 rounded-lg border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold ${logoColor}`}
                >
                  {logoInitials}
                </div>
              )}
              <input ref={logoRef} type="file" accept="image/*" onChange={onLogo} className="hidden" />
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                title="Change logo"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center shadow border-2 border-white"
              >
                <PencilIcon />
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  touch();
                }}
                placeholder="Company name"
                className="text-base sm:text-lg font-bold text-gray-900 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 focus:outline-none min-w-0 flex-1"
              />
              {verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded shrink-0">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <input
              value={tagline}
              onChange={(e) => {
                setTagline(e.target.value);
                touch();
              }}
              placeholder="Company tagline"
              className={inputCls}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className={labelCls}>Location</label>
                <input value={location} onChange={(e) => { setLocation(e.target.value); touch(); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Founded</label>
                <input value={founded} onChange={(e) => { setFounded(e.target.value); touch(); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Employees</label>
                <input value={employeeRange} onChange={(e) => { setEmployeeRange(e.target.value); touch(); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>CAGE Code</label>
                <input value={cageCode} onChange={(e) => { setCageCode(e.target.value); touch(); }} className={inputCls} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-3">
          <SectionCard title="About Us">
            <label className={labelCls}>Short description</label>
            <textarea
              rows={3}
              value={about}
              onChange={(e) => { setAbout(e.target.value); touch(); }}
              className={`${inputCls} resize-none`}
            />
            <label className={`${labelCls} mt-2.5`}>Extended description</label>
            <textarea
              rows={4}
              value={aboutExtended}
              onChange={(e) => { setAboutExtended(e.target.value); touch(); }}
              className={`${inputCls} resize-y`}
            />
          </SectionCard>

          <SectionCard
            title="Contact Information"
            hint="These power the Call, Video Call, and Schedule Meeting buttons on your public profile. Leave a field blank to hide its button."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LINK_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className={labelCls}>{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    value={contact[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => updateLink(f.key, e.target.value)}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Company Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Industry</label>
                <select
                  value={details.industry}
                  onChange={(e) => {
                    setDetails((p) => ({ ...p, industry: e.target.value, subcategory: "" }));
                    touch();
                  }}
                  className={selectCls}
                >
                  <option value="">Select industry...</option>
                  {Object.keys(industryMap).map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Subcategory</label>
                <select
                  value={details.subcategory}
                  onChange={(e) => updateDetail("subcategory", e.target.value)}
                  className={selectCls}
                  disabled={!details.industry}
                >
                  <option value="">Select subcategory...</option>
                  {subcategories.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Business Type</label>
                <input value={details.businessType} onChange={(e) => updateDetail("businessType", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>NAICS Code</label>
                <input value={details.naicsCode} onChange={(e) => updateDetail("naicsCode", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>DUNS Number</label>
                <input value={details.dunsNumber} onChange={(e) => updateDetail("dunsNumber", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tax ID</label>
                <input value={details.taxId} onChange={(e) => updateDetail("taxId", e.target.value)} className={inputCls} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Core Capabilities" hint="Add or remove the capabilities your company offers.">
            <ChipEditor
              chips={capabilities}
              setChips={(next) => { setCapabilities(next); touch(); }}
              placeholder="Add a capability and press Enter..."
            />
          </SectionCard>

          <SectionCard title="Locations">
            <div className="space-y-3">
              {locations.map((loc, idx) => (
                <div key={loc.id} className="border border-gray-200 rounded p-3 bg-gray-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Location {idx + 1}
                    </span>
                    <RemoveButton onClick={() => { setLocations((p) => p.filter((l) => l.id !== loc.id)); touch(); }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelCls}>Name</label>
                      <input
                        value={loc.name}
                        onChange={(e) => { setLocations((p) => p.map((l) => l.id === loc.id ? { ...l, name: e.target.value } : l)); touch(); }}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Type</label>
                      <select
                        value={loc.type}
                        onChange={(e) => { setLocations((p) => p.map((l) => l.id === loc.id ? { ...l, type: e.target.value } : l)); touch(); }}
                        className={selectCls}
                      >
                        {LOCATION_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Address</label>
                      <input
                        value={loc.address}
                        onChange={(e) => { setLocations((p) => p.map((l) => l.id === loc.id ? { ...l, address: e.target.value } : l)); touch(); }}
                        className={inputCls}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Primary Contact</label>
                      <input
                        value={loc.contact}
                        onChange={(e) => { setLocations((p) => p.map((l) => l.id === loc.id ? { ...l, contact: e.target.value } : l)); touch(); }}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <AddButton
              label="Add Location"
              onClick={() => {
                setLocations((p) => [...p, { id: uid(), name: "", address: "", type: "Office", contact: "" }]);
                touch();
              }}
            />
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <SectionCard title="Company Gallery" hint="Upload facility and product photos.">
            <input ref={galleryRef} type="file" multiple accept="image/*" onChange={onGallery} className="hidden" />
            {gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {gallery.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className={`aspect-square rounded bg-gradient-to-br ${photo.gradient} relative overflow-hidden`}>
                      {photo.preview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.preview} alt={photo.label} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-gradient-to-t from-black/60 to-transparent">
                        <span className="text-[8px] text-white/90 leading-tight line-clamp-2">{photo.label}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setGallery((p) => p.filter((g) => g.id !== photo.id)); touch(); }}
                      title="Remove photo"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <input
                      value={photo.label}
                      onChange={(e) => { setGallery((p) => p.map((g) => g.id === photo.id ? { ...g, label: e.target.value } : g)); touch(); }}
                      placeholder="Caption"
                      className="mt-1 w-full px-1.5 py-0.5 text-[10px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[13px] text-blue-700 hover:text-blue-800 font-medium border border-dashed border-gray-300 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <PlusIcon />
              Upload Photos
            </button>
          </SectionCard>

          <SectionCard title="Certifications">
            <div className="space-y-2.5">
              {certifications.map((cert) => (
                <div key={cert.id} className="border border-gray-200 rounded p-2.5 bg-gray-50/40">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        value={cert.name}
                        onChange={(e) => { setCertifications((p) => p.map((c) => c.id === cert.id ? { ...c, name: e.target.value } : c)); touch(); }}
                        placeholder="Certification name (e.g. ISO 9001:2015)"
                        className={`${inputCls} font-medium`}
                      />
                      <textarea
                        rows={2}
                        value={cert.description}
                        onChange={(e) => { setCertifications((p) => p.map((c) => c.id === cert.id ? { ...c, description: e.target.value } : c)); touch(); }}
                        placeholder="Short description"
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                    <RemoveButton onClick={() => { setCertifications((p) => p.filter((c) => c.id !== cert.id)); touch(); }} />
                  </div>
                </div>
              ))}
            </div>
            <AddButton
              label="Add Certification"
              onClick={() => { setCertifications((p) => [...p, { id: uid(), name: "", description: "" }]); touch(); }}
            />
          </SectionCard>

          <SectionCard title="Tags">
            <ChipEditor
              chips={tags}
              setChips={(next) => { setTags(next); touch(); }}
              placeholder="Add a tag and press Enter..."
              accent="gray"
            />
          </SectionCard>

          <SectionCard title="Markets Served">
            <div className="space-y-2">
              {markets.map((market) => (
                <div key={market.id} className="flex items-center gap-2">
                  <input
                    value={market.flag}
                    onChange={(e) => { setMarkets((p) => p.map((m) => m.id === market.id ? { ...m, flag: e.target.value } : m)); touch(); }}
                    placeholder="🇺🇸"
                    className="w-12 text-center px-1.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    value={market.country}
                    onChange={(e) => { setMarkets((p) => p.map((m) => m.id === market.id ? { ...m, country: e.target.value } : m)); touch(); }}
                    placeholder="Country / region"
                    className={`flex-1 ${inputCls}`}
                  />
                  <RemoveButton onClick={() => { setMarkets((p) => p.filter((m) => m.id !== market.id)); touch(); }} />
                </div>
              ))}
            </div>
            <AddButton
              label="Add Market"
              onClick={() => { setMarkets((p) => [...p, { id: uid(), country: "", flag: "🌐" }]); touch(); }}
            />
          </SectionCard>

          <SectionCard title="Videos" hint="Upload a video file or paste a link.">
            <input ref={videoRef} type="file" multiple accept="video/*" onChange={onVideoUpload} className="hidden" />
            <div className="space-y-2.5">
              {videos.map((video) => (
                <div key={video.id} className="border border-gray-200 rounded p-2.5 bg-gray-50/40">
                  <div className="flex items-start gap-2.5">
                    <div className={`relative w-20 h-14 rounded bg-gradient-to-br ${video.gradient} shrink-0 overflow-hidden flex items-center justify-center`}>
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow">
                        <svg className="w-3 h-3 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      {video.preview && (
                        <span className="absolute bottom-0.5 left-1 right-1 text-[8px] text-white/90 truncate">file added</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        value={video.title}
                        onChange={(e) => { setVideos((p) => p.map((v) => v.id === video.id ? { ...v, title: e.target.value } : v)); touch(); }}
                        placeholder="Video title"
                        className={`${inputCls} font-medium`}
                      />
                      <input
                        value={video.url ?? ""}
                        onChange={(e) => { setVideos((p) => p.map((v) => v.id === video.id ? { ...v, url: e.target.value } : v)); touch(); }}
                        placeholder="Video link (YouTube, Vimeo...)"
                        className={inputCls}
                      />
                    </div>
                    <RemoveButton onClick={() => { setVideos((p) => p.filter((v) => v.id !== video.id)); touch(); }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                className="flex items-center gap-1.5 text-[13px] text-blue-700 hover:text-blue-800 font-medium"
              >
                <PlusIcon />
                Upload Video
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={() => { setVideos((p) => [...p, { id: uid(), title: "", duration: "0:00", gradient: GRADIENTS[p.length % GRADIENTS.length], url: "" }]); touch(); }}
                className="flex items-center gap-1.5 text-[13px] text-blue-700 hover:text-blue-800 font-medium"
              >
                <PlusIcon />
                Add Link
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Documents" hint="Upload brochures, capability statements, and policies.">
            <input ref={docRef} type="file" multiple onChange={onDocUpload} className="hidden" />
            <div className="space-y-1.5">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 py-1.5 px-2 -mx-1 rounded hover:bg-gray-50">
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h5v2H8v-2z" />
                  </svg>
                  <input
                    value={doc.name}
                    onChange={(e) => { setDocuments((p) => p.map((d) => d.id === doc.id ? { ...d, name: e.target.value } : d)); touch(); }}
                    placeholder="Document name"
                    className="flex-1 min-w-0 px-2 py-1 text-[12px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    value={doc.size}
                    onChange={(e) => { setDocuments((p) => p.map((d) => d.id === doc.id ? { ...d, size: e.target.value } : d)); touch(); }}
                    placeholder="Size"
                    className="w-16 px-1.5 py-1 text-[11px] text-gray-500 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <RemoveButton onClick={() => { setDocuments((p) => p.filter((d) => d.id !== doc.id)); touch(); }} />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => docRef.current?.click()}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-[13px] text-blue-700 hover:text-blue-800 font-medium border border-dashed border-gray-300 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <PlusIcon />
              Upload Document
            </button>
          </SectionCard>
        </div>
      </div>

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-200 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Changes saved
            </span>
          )}
          <Link href="/my-business" className="px-4 py-1.5 text-[13px] text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            className="px-5 py-1.5 text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
        </>
      )}

      {mode === "view" && (
        <>
          {/* ── Read-only banner ── */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-3">
            <div className={`relative h-40 sm:h-48 bg-gradient-to-br ${coverGradient}`}>
              {coverPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPreview} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.35)_100%)]" />
              {coverLabel && (
                <div className="absolute bottom-3 left-4 text-[11px] text-white/90 font-medium">{coverLabel}</div>
              )}
            </div>

            <div className="px-4 sm:px-6 pb-4">
              <div className="flex items-end gap-4 -mt-10">
                <div className="relative shrink-0">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-20 h-20 rounded-lg border-4 border-white shadow-md object-cover bg-white"
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-lg border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold ${logoColor}`}
                    >
                      {logoInitials}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900">{name}</h1>
                  {verified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-gray-600 mt-1">{tagline}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 mt-2">
                  <span>{location}</span>
                  <span className="text-gray-300">|</span>
                  <span>Founded {founded}</span>
                  <span className="text-gray-300">|</span>
                  <span>{employeeRange}</span>
                  <span className="text-gray-300">|</span>
                  <span>CAGE Code: {cageCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Read-only content grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-3">
              <ViewCard title="About Us">
                <p className="text-[12px] text-gray-700 leading-relaxed">{about}</p>
                {aboutExtended && (
                  <p className="text-[12px] text-gray-700 leading-relaxed mt-2">{aboutExtended}</p>
                )}
              </ViewCard>

              <ViewCard title="Contact Information">
                {LINK_FIELDS.some((f) => (contact[f.key] ?? "").trim()) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {LINK_FIELDS.filter((f) => (contact[f.key] ?? "").trim()).map((f) => {
                      const value = (contact[f.key] ?? "").trim();
                      return (
                        <a
                          key={f.key}
                          href={contactHref(f.key, value)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:bg-gray-50 -mx-1 px-1 py-1 rounded"
                        >
                          <div className="text-[10px] text-gray-400 leading-tight">{f.label}</div>
                          <div className="text-[12px] text-blue-700 truncate">{value}</div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-400">No contact information added.</p>
                )}
              </ViewCard>

              <ViewCard title="Company Details">
                <ViewDetailRow label="Industry" value={details.industry} />
                <ViewDetailRow label="Subcategory" value={details.subcategory} />
                <ViewDetailRow label="Business Type" value={details.businessType} />
                <ViewDetailRow label="NAICS Code" value={details.naicsCode} />
                <ViewDetailRow label="DUNS Number" value={details.dunsNumber} />
                <ViewDetailRow label="Tax ID" value={details.taxId} />
              </ViewCard>

              <ViewCard title="Core Capabilities">
                <PillList items={capabilities} />
              </ViewCard>

              <ViewCard title="Locations">
                {locations.length > 0 ? (
                  <div className="space-y-2.5">
                    {locations.map((loc) => (
                      <div key={loc.id} className="border border-gray-200 rounded p-3 bg-gray-50/40">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-semibold text-gray-900">{loc.name || "—"}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded shrink-0">
                            {loc.type}
                          </span>
                        </div>
                        {loc.address && <p className="text-[12px] text-gray-600 mt-1">{loc.address}</p>}
                        {loc.contact && <p className="text-[11px] text-gray-500 mt-0.5">{loc.contact}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-400">No locations added.</p>
                )}
              </ViewCard>
            </div>

            {/* Right column */}
            <div className="space-y-3">
              <ViewCard title="Company Gallery">
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {gallery.map((photo) => (
                      <div
                        key={photo.id}
                        className={`aspect-square rounded bg-gradient-to-br ${photo.gradient} relative overflow-hidden`}
                      >
                        {photo.preview && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo.preview} alt={photo.label} className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-gradient-to-t from-black/60 to-transparent">
                          <span className="text-[8px] text-white/90 leading-tight line-clamp-2">{photo.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-400">No photos uploaded.</p>
                )}
              </ViewCard>

              <ViewCard title="Certifications">
                {certifications.length > 0 ? (
                  <div className="space-y-2.5">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex gap-2">
                        <div className="w-7 h-7 rounded bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold text-gray-900">{cert.name || "—"}</div>
                          {cert.description && (
                            <div className="text-[11px] text-gray-500 leading-snug">{cert.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-400">No certifications added.</p>
                )}
              </ViewCard>

              <ViewCard title="Tags">
                <PillList items={tags} accent="gray" />
              </ViewCard>

              <ViewCard title="Markets Served">
                {markets.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {markets.map((market) => (
                      <span
                        key={market.id}
                        className="inline-flex items-center gap-1 text-[11px] bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full"
                      >
                        <span>{market.flag}</span>
                        {market.country || "—"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-400">No markets added.</p>
                )}
              </ViewCard>

              <ViewCard title="Videos">
                {videos.length > 0 ? (
                  <div className="space-y-2">
                    {videos.map((video) => {
                      const inner = (
                        <div className="flex gap-2 group">
                          <div
                            className={`relative w-24 h-14 rounded bg-gradient-to-br ${video.gradient} shrink-0 overflow-hidden flex items-center justify-center`}
                          >
                            <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow">
                              <svg className="w-3 h-3 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-[12px] font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                              {video.title || "Untitled video"}
                            </span>
                          </div>
                        </div>
                      );
                      return video.url ? (
                        <a
                          key={video.id}
                          href={externalHref(video.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {inner}
                        </a>
                      ) : (
                        <div key={video.id}>{inner}</div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-400">No videos added.</p>
                )}
              </ViewCard>

              <ViewCard title="Documents">
                {documents.length > 0 ? (
                  <div className="space-y-1.5">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between gap-2 py-1.5 px-2 -mx-2 rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h5v2H8v-2z" />
                          </svg>
                          <div className="min-w-0">
                            <div className="text-[12px] text-gray-800 truncate">{doc.name || "—"}</div>
                            <div className="text-[10px] text-gray-400">{doc.size}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-400">No documents added.</p>
                )}
              </ViewCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
