"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { industryMap } from "@/lib/industries";
import { addSubmission, contactMethods, type ContactMethod } from "@/lib/intakeSubmissions";

const inputCls =
  "w-full px-2.5 py-1.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
const selectCls = `${inputCls} bg-white`;

function FormField({
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

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

interface FilePreview {
  name: string;
  preview?: string;
}

export default function IntakePage() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [resourcesOffered, setResourcesOffered] = useState("");
  const [resourcesSought, setResourcesSought] = useState("");
  const [capacityDetails, setCapacityDetails] = useState("");
  const [preferredContact, setPreferredContact] = useState<ContactMethod>("Email");
  const [notes, setNotes] = useState("");
  const [logo, setLogo] = useState<FilePreview | null>(null);
  const [image, setImage] = useState<FilePreview | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const logoRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const subcategories = industry ? industryMap[industry] ?? [] : [];

  const resetForm = () => {
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setLocation("");
    setIndustry("");
    setSubcategory("");
    setResourcesOffered("");
    setResourcesSought("");
    setCapacityDetails("");
    setPreferredContact("Email");
    setNotes("");
    setLogo(null);
    setImage(null);
    setError("");
  };

  const handleSubmit = () => {
    if (!companyName.trim() || !contactName.trim() || !email.trim()) {
      setError("Company name, contact name, and email are required.");
      return;
    }
    addSubmission({
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      website: website.trim(),
      location: location.trim(),
      industry,
      subcategory,
      resourcesOffered: resourcesOffered.trim(),
      resourcesSought: resourcesSought.trim(),
      capacityDetails: capacityDetails.trim(),
      preferredContact,
      logoName: logo?.name,
      imageName: image?.name,
      notes: notes.trim(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md w-full shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1.5">Thank you!</h2>
          <p className="text-[13px] text-gray-500 mb-6">
            Your submission has been received. Our team will review your business resources and reach
            out via your preferred contact method. Welcome to CapMaxx.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-4 py-2 text-[13px] border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
            >
              Back to Home
            </Link>
            <button
              onClick={() => {
                resetForm();
                setSubmitted(false);
              }}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-0.5 mb-2">
          Free B2B Listing
        </span>
        <h1 className="text-xl font-bold text-gray-900">List your business on CapMaxx</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Tell us about the underutilized resources you have and the resources you&apos;re looking for.
          It&apos;s free, and we&apos;ll help you connect with the right partners.
        </p>
      </div>

      <div className="space-y-4">
        {/* Company & contact */}
        <div className="bg-white border border-gray-200 rounded p-4">
          <SectionHeader title="Company & Contact" subtitle="How partners and our team can reach you" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Company Name" required>
              <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Manufacturing Co." />
            </FormField>
            <FormField label="Contact Name" required>
              <input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Doe" />
            </FormField>
            <FormField label="Email" required>
              <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@acme.com" />
            </FormField>
            <FormField label="Phone">
              <input type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" />
            </FormField>
            <FormField label="Website">
              <input type="url" className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" />
            </FormField>
            <FormField label="Location">
              <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State, Country" />
            </FormField>
          </div>
        </div>

        {/* Industry */}
        <div className="bg-white border border-gray-200 rounded p-4">
          <SectionHeader title="Industry & Category" subtitle="Used to match you with the right buyers, suppliers, and partners" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Industry">
              <select
                className={selectCls}
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value);
                  setSubcategory("");
                }}
              >
                <option value="">Select industry...</option>
                {Object.keys(industryMap).map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Subcategory">
              <select className={selectCls} value={subcategory} onChange={(e) => setSubcategory(e.target.value)} disabled={!industry}>
                <option value="">Select subcategory...</option>
                {subcategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white border border-gray-200 rounded p-4">
          <SectionHeader title="Your Resources" subtitle="The heart of your CapMaxx listing" />
          <div className="space-y-3">
            <FormField label="What underutilized resources do you have?">
              <textarea
                rows={3}
                className={`${inputCls} resize-y`}
                value={resourcesOffered}
                onChange={(e) => setResourcesOffered(e.target.value)}
                placeholder="e.g. Spare CNC capacity, warehouse space, equipment, expertise, distribution reach..."
              />
            </FormField>
            <FormField label="What resources do you usually seek?">
              <textarea
                rows={3}
                className={`${inputCls} resize-y`}
                value={resourcesSought}
                onChange={(e) => setResourcesSought(e.target.value)}
                placeholder="e.g. Contract manufacturing partners, cold storage, freight capacity, new customers..."
              />
            </FormField>
            <FormField label="Available capacity / resource details">
              <textarea
                rows={3}
                className={`${inputCls} resize-y`}
                value={capacityDetails}
                onChange={(e) => setCapacityDetails(e.target.value)}
                placeholder="Quantities, timelines, equipment specs, certifications, service area..."
              />
            </FormField>
          </div>
        </div>

        {/* Preferences & uploads */}
        <div className="bg-white border border-gray-200 rounded p-4">
          <SectionHeader title="Preferences & Media" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <FormField label="Preferred contact method">
              <select className={selectCls} value={preferredContact} onChange={(e) => setPreferredContact(e.target.value as ContactMethod)}>
                {contactMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Logo upload */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Upload logo <span className="text-gray-400">(optional)</span></label>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setLogo({ name: f.name, preview: URL.createObjectURL(f) });
                  e.target.value = "";
                }}
              />
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded border border-gray-200 bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {logo?.preview ? (
                    <img src={logo.preview} alt={logo.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    className="text-[13px] text-blue-700 hover:text-blue-800 font-medium"
                  >
                    {logo ? "Replace logo" : "Choose logo"}
                  </button>
                  {logo && (
                    <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{logo.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Primary image upload */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Upload primary image <span className="text-gray-400">(optional)</span></label>
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImage({ name: f.name, preview: URL.createObjectURL(f) });
                  e.target.value = "";
                }}
              />
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded border border-gray-200 bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {image?.preview ? (
                    <img src={image.preview} alt={image.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => imageRef.current?.click()}
                    className="text-[13px] text-blue-700 hover:text-blue-800 font-medium"
                  >
                    {image ? "Replace image" : "Choose image"}
                  </button>
                  {image && (
                    <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{image.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <FormField label="Notes">
              <textarea
                rows={2}
                className={`${inputCls} resize-y`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything else you'd like us to know..."
              />
            </FormField>
          </div>
        </div>

        {error && (
          <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pb-8">
          <p className="text-[11px] text-gray-400">Your information is saved to CapMaxx and reviewed by our team.</p>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
