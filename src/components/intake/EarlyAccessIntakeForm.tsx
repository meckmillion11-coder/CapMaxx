"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { industryMap } from "@/lib/industries";
import {
  mergeFormConfig,
  RESOURCE_CATEGORIES,
  PURPOSE_OPTIONS,
  type IntakeFormConfigPayload,
  type IntakePurpose,
} from "@/lib/intakeFormConfig";
import { addSubmission, type NewSubmissionInput } from "@/lib/intakeSubmissions";
import IntakePreviewCards from "./IntakePreviewCards";
import IntakeValueStory from "./IntakeValueStory";

const inputCls =
  "w-full px-2.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
const selectCls = `${inputCls} bg-white`;

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

const emptyForm: NewSubmissionInput = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  industry: "",
  subcategory: "",
  purpose: "",
  listingTitle: "",
  listingDescription: "",
  resourceCategories: [],
  resourcesOffered: "",
  resourcesSought: "",
  capacityDetails: "",
  moq: "",
  leadTime: "",
  certifications: "",
  teamSize: "",
  capacityInfo: "",
  serviceArea: "",
  equipmentDetails: "",
  industriesServed: [],
  availabilityNotes: "",
  videoUrls: [],
  additionalNotes: "",
  preferredContact: "Email",
  notes: "",
};

export default function EarlyAccessIntakeForm({ headline }: { headline?: string }) {
  const [form, setForm] = useState<NewSubmissionInput>(emptyForm);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [formConfig, setFormConfig] = useState<IntakeFormConfigPayload>(mergeFormConfig(null));
  const [videoText, setVideoText] = useState("");
  const [industriesServedText, setIndustriesServedText] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/intake/form-config")
      .then((r) => r.json())
      .then((cfg) => setFormConfig(mergeFormConfig(cfg)))
      .catch(() => {});
  }, []);

  const set = <K extends keyof NewSubmissionInput>(key: K, value: NewSubmissionInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleCategory = (cat: string) => {
    setForm((f) => ({
      ...f,
      resourceCategories: f.resourceCategories.includes(cat)
        ? f.resourceCategories.filter((c) => c !== cat)
        : [...f.resourceCategories, cat],
    }));
  };

  const subcategories = form.industry ? industryMap[form.industry] ?? [] : [];

  const isRequired = (id: string, fallback: boolean) => {
    const field = formConfig.fields.find((f) => f.id === id);
    return field ? field.required : fallback;
  };

  const isVisible = (id: string) => {
    const field = formConfig.fields.find((f) => f.id === id);
    return field ? field.visible : true;
  };

  const handleSubmit = async () => {
    setError("");
    const required: [string, string][] = [
      ["companyName", form.companyName],
      ["contactName", form.contactName],
      ["email", form.email],
      ["location", form.location],
      ["industry", form.industry],
      ["purpose", form.purpose],
      ["listingTitle", form.listingTitle],
      ["listingDescription", form.listingDescription],
    ];
    for (const [key, val] of required) {
      if (isRequired(key, true) && !val.trim()) {
        setError("Please complete all required fields marked with *.");
        return;
      }
    }

    setBusy(true);
    const payload: NewSubmissionInput = {
      ...form,
      industriesServed: industriesServedText.split(",").map((s) => s.trim()).filter(Boolean),
      videoUrls: videoText.split("\n").map((s) => s.trim()).filter(Boolean),
      notes: form.additionalNotes || form.notes,
    };

    try {
      const res = await fetch("/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok && !json.local) {
        setError(json.error ?? "Submission failed.");
        setBusy(false);
        return;
      }
    } catch {
      // fall through to local store
    }

    addSubmission(payload);
    setSubmitted(true);
    setBusy(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-md w-full shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1.5">You&apos;re on the list!</h2>
          <p className="text-[13px] text-gray-500 mb-4">
            Thank you for joining CapMaxx Early Access. We&apos;ll review your information and contact you before the public launch.
          </p>
          <div className="text-left mb-6">
            <IntakeValueStory variant="compact" />
          </div>
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setVideoText("");
              setIndustriesServedText("");
              setLogoPreview(null);
              setImagePreview(null);
              setSubmitted(false);
            }}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded"
          >
            Submit Another Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 min-w-0">
      <div className="mb-4">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-0.5 mb-2">
          Early Access · Founding Companies
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {headline ?? "Join CapMaxx Before Public Launch"}
        </h1>
        <p className="text-[13px] text-gray-500 mt-1 max-w-2xl">
          Apply below to showcase your manufacturing, warehousing, logistics, equipment, labor, or services — and stop letting valuable resources sit underutilized.
        </p>
      </div>

      <IntakeValueStory />

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 text-center sm:text-left">
          Tell us about your company
        </h2>
      </div>

      <div className="space-y-4">
        {/* Company */}
        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isVisible("companyName") && (
              <Field label="Company Name" required={isRequired("companyName", true)}>
                <input className={inputCls} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
              </Field>
            )}
            {isVisible("contactName") && (
              <Field label="Contact Name" required={isRequired("contactName", true)}>
                <input className={inputCls} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
              </Field>
            )}
            {isVisible("email") && (
              <Field label="Email" required={isRequired("email", true)}>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
            )}
            {isVisible("phone") && (
              <Field label="Phone">
                <input type="tel" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            )}
            {isVisible("website") && (
              <Field label="Website">
                <input type="url" className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
              </Field>
            )}
            {isVisible("location") && (
              <Field label="Location" required={isRequired("location", true)}>
                <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, State, Country" />
              </Field>
            )}
            {isVisible("industry") && (
              <Field label="Industry" required={isRequired("industry", true)}>
                <select className={selectCls} value={form.industry} onChange={(e) => { set("industry", e.target.value); set("subcategory", ""); }}>
                  <option value="">Select industry...</option>
                  {Object.keys(industryMap).map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>
        </section>

        {/* Purpose */}
        {isVisible("purpose") && (
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Purpose</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("purpose", opt.value as IntakePurpose)}
                  className={`px-3 py-2.5 text-left text-[13px] rounded-lg border transition-colors ${
                    form.purpose === opt.value
                      ? "border-blue-600 bg-blue-50 text-blue-800 font-medium"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Listing */}
        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Opportunity / Listing</h2>
          <div className="space-y-3">
            {isVisible("listingTitle") && (
              <Field label="Listing Title" required={isRequired("listingTitle", true)}>
                <input className={inputCls} value={form.listingTitle} onChange={(e) => set("listingTitle", e.target.value)} placeholder="e.g. CNC Machining Capacity Available" />
              </Field>
            )}
            {isVisible("listingDescription") && (
              <Field label="Description" required={isRequired("listingDescription", true)}>
                <textarea rows={3} className={`${inputCls} resize-y`} value={form.listingDescription} onChange={(e) => set("listingDescription", e.target.value)} />
              </Field>
            )}
            {isVisible("resourceCategories") && (
              <Field label="Resource Categories" hint="Select all that apply">
                <div className="flex flex-wrap gap-2">
                  {RESOURCE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`text-[12px] px-2.5 py-1 rounded-full border transition-colors ${
                        form.resourceCategories.includes(cat)
                          ? "bg-green-50 border-green-300 text-green-800"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </Field>
            )}
          </div>
        </section>

        {/* Resources */}
        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Resources</h2>
          <div className="space-y-3">
            {isVisible("resourcesOffered") && (
              <Field label="What Do You Offer?" hint="Capacity, equipment, warehouse space, transportation, labor, services, products...">
                <textarea rows={4} className={`${inputCls} resize-y`} value={form.resourcesOffered} onChange={(e) => set("resourcesOffered", e.target.value)} />
              </Field>
            )}
            {isVisible("resourcesSought") && (
              <Field label="What Are You Looking For?" hint="Partners, manufacturing, warehousing, logistics, labor, opportunities...">
                <textarea rows={4} className={`${inputCls} resize-y`} value={form.resourcesSought} onChange={(e) => set("resourcesSought", e.target.value)} />
              </Field>
            )}
          </div>
        </section>

        {/* Advanced optional */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Optional Advanced Details
            <svg className={`w-4 h-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {advancedOpen && (
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-3">
              {isVisible("moq") && (
                <Field label="Minimum Order Quantity (MOQ)">
                  <input className={inputCls} value={form.moq} onChange={(e) => set("moq", e.target.value)} />
                </Field>
              )}
              {isVisible("leadTime") && (
                <Field label="Lead Time">
                  <input className={inputCls} value={form.leadTime} onChange={(e) => set("leadTime", e.target.value)} />
                </Field>
              )}
              {isVisible("certifications") && (
                <Field label="Certifications">
                  <input className={inputCls} value={form.certifications} onChange={(e) => set("certifications", e.target.value)} placeholder="ISO 9001, AS9100..." />
                </Field>
              )}
              {isVisible("teamSize") && (
                <Field label="Team Size">
                  <input className={inputCls} value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} />
                </Field>
              )}
              {isVisible("capacityInfo") && (
                <div className="sm:col-span-2">
                  <Field label="Capacity Information">
                    <textarea rows={2} className={`${inputCls} resize-y`} value={form.capacityInfo} onChange={(e) => set("capacityInfo", e.target.value)} />
                  </Field>
                </div>
              )}
              {isVisible("serviceArea") && (
                <Field label="Service Area">
                  <input className={inputCls} value={form.serviceArea} onChange={(e) => set("serviceArea", e.target.value)} />
                </Field>
              )}
              {isVisible("equipmentDetails") && (
                <div className="sm:col-span-2">
                  <Field label="Equipment Details">
                    <textarea rows={2} className={`${inputCls} resize-y`} value={form.equipmentDetails} onChange={(e) => set("equipmentDetails", e.target.value)} />
                  </Field>
                </div>
              )}
              {isVisible("industriesServed") && (
                <div className="sm:col-span-2">
                  <Field label="Industries Served" hint="Comma-separated">
                    <input className={inputCls} value={industriesServedText} onChange={(e) => setIndustriesServedText(e.target.value)} />
                  </Field>
                </div>
              )}
              {isVisible("availabilityNotes") && (
                <div className="sm:col-span-2">
                  <Field label="Availability Notes" hint="e.g. Available every Friday, idle capacity last week of each month">
                    <textarea rows={2} className={`${inputCls} resize-y`} value={form.availabilityNotes} onChange={(e) => set("availabilityNotes", e.target.value)} />
                  </Field>
                </div>
              )}
              {isVisible("photos") && (
                <div>
                  <Field label="Logo (optional)">
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { set("logoName", f.name); setLogoPreview(URL.createObjectURL(f)); }
                    }} />
                    <button type="button" onClick={() => logoRef.current?.click()} className="text-[13px] text-blue-700 font-medium">
                      {form.logoName ? "Replace logo" : "Choose logo"}
                    </button>
                  </Field>
                </div>
              )}
              {isVisible("photos") && (
                <div>
                  <Field label="Primary Photo (optional)">
                    <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { set("imageName", f.name); setImagePreview(URL.createObjectURL(f)); }
                    }} />
                    <button type="button" onClick={() => imageRef.current?.click()} className="text-[13px] text-blue-700 font-medium">
                      {form.imageName ? "Replace photo" : "Choose photo"}
                    </button>
                  </Field>
                </div>
              )}
              {isVisible("videos") && (
                <div className="sm:col-span-2">
                  <Field label="Video Links" hint="One URL per line">
                    <textarea rows={2} className={`${inputCls} resize-y`} value={videoText} onChange={(e) => setVideoText(e.target.value)} />
                  </Field>
                </div>
              )}
              {isVisible("additionalNotes") && (
                <div className="sm:col-span-2">
                  <Field label="Additional Notes">
                    <textarea rows={2} className={`${inputCls} resize-y`} value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Preview */}
        <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <IntakePreviewCards data={form} />
        </section>

        {error && (
          <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-8">
          <p className="text-[11px] text-gray-400 max-w-md">
            By submitting, you agree that CapMaxx may contact you about early access. Your listing is reviewed before appearing on the public marketplace.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSubmit()}
            className="w-full sm:w-auto px-8 py-2.5 text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Join Early Access"}
          </button>
        </div>
      </div>
    </div>
  );
}
