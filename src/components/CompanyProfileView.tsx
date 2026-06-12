"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CompanyProfile } from "@/lib/mockCompanies";
import { externalHref, resolveCommButtons, type VideoLink } from "@/lib/companyContact";
import { requestConnectionBySlug } from "@/lib/db/social";

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  );
}

function EditPencil() {
  return (
    <Link
      href="/my-business/company-profile"
      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
      title="Edit section"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </Link>
  );
}

function VideoIcon({ type }: { type: VideoLink["type"] }) {
  const map: Record<VideoLink["type"], { bg: string; label: string }> = {
    teams: { bg: "bg-indigo-700", label: "T" },
    zoom: { bg: "bg-blue-600", label: "Z" },
    meet: { bg: "bg-green-600", label: "M" },
  };
  const { bg, label } = map[type];
  return (
    <span className={`w-4 h-4 shrink-0 inline-flex items-center justify-center rounded text-[9px] font-bold text-white leading-none ${bg}`}>
      {label}
    </span>
  );
}

function SectionCard({
  title,
  editable,
  children,
  className = "",
}: {
  title: string;
  editable?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
        {editable && <EditPencil />}
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-100 last:border-b-0 text-[12px]">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 text-right font-medium">{value}</span>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-2.5 py-1.5 text-[12px] group">
      <span className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-400 leading-tight">{label}</div>
        <div className="text-gray-800 truncate">{value}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 -mx-1 px-1 rounded">
        {content}
      </a>
    );
  }
  return content;
}

export default function CompanyProfileView({
  company,
  editable = false,
}: {
  company: CompanyProfile;
  editable?: boolean;
}) {
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [videoMenuOpen, setVideoMenuOpen] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  const { call, video, schedule } = resolveCommButtons(company.contact);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (videoRef.current && !videoRef.current.contains(e.target as Node)) setVideoMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const btn =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors";

  return (
    <div className="pb-6">
      {/* Cover + Header */}
      <div className="relative mb-14">
        <div className={`relative h-36 sm:h-44 bg-gradient-to-br ${company.coverGradient} rounded-lg overflow-hidden`}>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.35)_100%)]" />
          <div className="absolute bottom-3 left-4 text-[10px] text-white/80 font-medium">{company.coverLabel}</div>
          {editable && (
            <Link
              href="/my-business/company-profile"
              className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-medium bg-white/90 hover:bg-white text-gray-700 rounded border border-white/50 shadow-sm transition-colors"
            >
              Edit Cover Photo
            </Link>
          )}
        </div>

        {/* Logo + identity */}
        <div className="absolute -bottom-10 left-4 sm:left-6 flex items-end gap-3 sm:gap-4">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-4 border-white shadow-md flex items-center justify-center text-xl sm:text-2xl font-bold ${company.logoColor}`}>
            {company.logoInitials}
          </div>
        </div>
      </div>

      {/* Name row + actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 pl-0 sm:pl-24">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h1 className="text-base sm:text-lg font-bold text-gray-900">{company.name}</h1>
            {(company.verificationStatus ? company.verificationStatus === "verified" : company.verified) && <VerifiedBadge />}
          </div>
          <p className="text-[12px] text-gray-600 mb-2">{company.tagline}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {company.location}
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Founded {company.founded}
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {company.employeeRange}
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CAGE Code: {company.cageCode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {editable ? (
            <Link
              href="/my-business/company-profile"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
            >
              Edit Profile
            </Link>
          ) : (
            <>
              {/* Message — always available (internal CapMaxx messages) */}
              <Link
                href="/my-messages"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Message
              </Link>

              {/* Call — phone only; hidden when no phone */}
              {call && (
                <a href={call} className={btn} title="Call">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </a>
              )}

              {/* Video Call — Teams / Zoom / Meet; one opens directly, multiple shows a menu; hidden when none */}
              {video.length === 1 && (
                <a href={video[0].url} target="_blank" rel="noopener noreferrer" className={btn} title={`Video Call · ${video[0].label}`}>
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Video Call
                </a>
              )}
              {video.length > 1 && (
                <div className="relative" ref={videoRef}>
                  <button
                    type="button"
                    onClick={() => setVideoMenuOpen((v) => !v)}
                    className={`${btn} ${videoMenuOpen ? "bg-gray-50 border-gray-400" : ""}`}
                    title="Video Call"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Video Call
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {videoMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                      {video.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setVideoMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <VideoIcon type={link.type} />
                          <span className="text-xs text-gray-800">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Schedule Meeting — Calendly / booking; hidden when none */}
              {schedule && (
                <a href={schedule} target="_blank" rel="noopener noreferrer" className={btn} title="Schedule Meeting">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </a>
              )}

              {/* Connect — local toggle + guarded real connection request */}
              <button
                type="button"
                onClick={() => {
                  setConnected((v) => {
                    const next = !v;
                    // Only fire a real request when newly connecting; no-ops
                    // without Supabase or when the company can't be resolved.
                    if (next) void requestConnectionBySlug(company.slug);
                    return next;
                  });
                }}
                className={
                  connected
                    ? "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-green-300 bg-green-50 text-green-700 rounded transition-colors"
                    : btn
                }
              >
                {connected ? (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Request Sent
                  </>
                ) : (
                  "Connect"
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-3">
          <SectionCard title="About Us" editable={editable}>
            <p className="text-[12px] text-gray-700 leading-relaxed">
              {aboutExpanded ? `${company.about} ${company.aboutExtended}` : company.about}
            </p>
            <button
              type="button"
              onClick={() => setAboutExpanded((v) => !v)}
              className="mt-2 text-[11px] text-blue-700 hover:underline font-medium"
            >
              {aboutExpanded ? "Show Less" : "Show More"}
            </button>
          </SectionCard>

          <SectionCard title="Contact Information" editable={editable}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {company.contact.website && (
                <ContactRow
                  label="Website"
                  value={company.contact.website}
                  href={externalHref(company.contact.website)}
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  }
                />
              )}
              {company.contact.email && (
                <ContactRow
                  label="Email"
                  value={company.contact.email}
                  href={`mailto:${company.contact.email}`}
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
              )}
              {company.contact.phone && (
                <ContactRow
                  label="Phone"
                  value={company.contact.phone}
                  href={`tel:${company.contact.phone.replace(/\s/g, "")}`}
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />
              )}
              {company.contact.linkedin && (
                <ContactRow
                  label="LinkedIn"
                  value={company.contact.linkedin}
                  href={externalHref(company.contact.linkedin)}
                  icon={
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.062 2.062 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  }
                />
              )}
              {company.contact.teams && (
                <ContactRow
                  label="Microsoft Teams"
                  value="Join Teams meeting"
                  href={externalHref(company.contact.teams)}
                  icon={
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.625 8.25h-3.375V5.625A2.625 2.625 0 0014.625 3h-5.25A2.625 2.625 0 006.75 5.625V8.25H3.375A2.625 2.625 0 001 10.875v5.25A2.625 2.625 0 003.375 18.75h3.375v2.625A2.625 2.625 0 009.375 24h5.25a2.625 2.625 0 002.625-2.625V18.75h3.375A2.625 2.625 0 0023.625 16.125v-5.25A2.625 2.625 0 0020.625 8.25z" />
                    </svg>
                  }
                />
              )}
              {company.contact.zoom && (
                <ContactRow
                  label="Zoom"
                  value="Join Zoom meeting"
                  href={externalHref(company.contact.zoom)}
                  icon={
                    <span className="w-4 h-4 inline-flex items-center justify-center rounded text-[9px] font-bold bg-blue-600 text-white leading-none">Z</span>
                  }
                />
              )}
              {company.contact.meet && (
                <ContactRow
                  label="Google Meet"
                  value="Join Google Meet"
                  href={externalHref(company.contact.meet)}
                  icon={
                    <span className="w-4 h-4 inline-flex items-center justify-center rounded text-[9px] font-bold bg-green-600 text-white leading-none">M</span>
                  }
                />
              )}
              {company.contact.calendly && (
                <ContactRow
                  label="Schedule a Meeting"
                  value="Book via Calendly"
                  href={externalHref(company.contact.calendly)}
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Company Details" editable={editable}>
            <DetailRow label="Industry" value={company.details.industry} />
            <DetailRow label="Subcategory" value={company.details.subcategory} />
            <DetailRow label="Business Type" value={company.details.businessType} />
            <DetailRow label="NAICS Code" value={company.details.naicsCode} />
            <DetailRow label="DUNS Number" value={company.details.dunsNumber} />
            <DetailRow label="Tax ID" value={company.details.taxId} />
          </SectionCard>

          <SectionCard title="Core Capabilities" editable={editable}>
            <div className="flex flex-wrap gap-1.5">
              {company.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium"
                >
                  {cap}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Locations" editable={editable}>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 pr-3 font-semibold text-gray-500">Location</th>
                    <th className="pb-2 pr-3 font-semibold text-gray-500">Address</th>
                    <th className="pb-2 pr-3 font-semibold text-gray-500">Type</th>
                    <th className="pb-2 font-semibold text-gray-500">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {company.locations.map((loc) => (
                    <tr key={loc.name} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-2 pr-3 font-medium text-gray-900 whitespace-nowrap">{loc.name}</td>
                      <td className="py-2 pr-3 text-gray-600">{loc.address}</td>
                      <td className="py-2 pr-3">
                        <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">
                          {loc.type}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600 whitespace-nowrap">{loc.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <SectionCard title="Company Gallery" editable={editable}>
            <div className="grid grid-cols-3 gap-1.5">
              {company.gallery.map((photo) => (
                <div
                  key={photo.label}
                  className={`aspect-square rounded bg-gradient-to-br ${photo.gradient} relative overflow-hidden group cursor-pointer`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-gradient-to-t from-black/60 to-transparent">
                    <span className="text-[8px] text-white/90 leading-tight line-clamp-2">{photo.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Certifications" editable={editable}>
            <div className="space-y-2.5">
              {company.certifications.map((cert) => (
                <div key={cert.name} className="flex gap-2">
                  <div className="w-7 h-7 rounded bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-gray-900">{cert.name}</div>
                    <div className="text-[11px] text-gray-500 leading-snug">{cert.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Tags" editable={editable}>
            <div className="flex flex-wrap gap-1.5">
              {company.tags.map((tag) => (
                <span key={tag} className="text-[11px] bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Markets Served" editable={editable}>
            <div className="flex flex-wrap gap-1.5">
              {company.marketsServed.map((market) => (
                <span
                  key={market.country}
                  className="inline-flex items-center gap-1 text-[11px] bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full"
                >
                  <span>{market.flag}</span>
                  {market.country}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Videos" editable={editable}>
            <div className="space-y-2">
              {company.videos.map((video) => (
                <div key={video.title} className="flex gap-2 group cursor-pointer">
                  <div className={`relative w-24 h-14 rounded bg-gradient-to-br ${video.gradient} shrink-0 overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                        <svg className="w-3 h-3 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <span className="absolute bottom-0.5 right-1 text-[8px] text-white/90 font-medium">{video.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[12px] font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                      {video.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Documents" editable={editable}>
            <div className="space-y-1.5">
              {company.documents.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between gap-2 py-1.5 px-2 -mx-2 rounded hover:bg-gray-50 group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h5v2H8v-2z" />
                    </svg>
                    <div className="min-w-0">
                      <div className="text-[12px] text-gray-800 truncate group-hover:text-blue-700 transition-colors">{doc.name}</div>
                      <div className="text-[10px] text-gray-400">{doc.size}</div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
