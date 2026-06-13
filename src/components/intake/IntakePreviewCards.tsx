"use client";

import type { ReactNode } from "react";
import ListingCard from "@/components/ListingCard";
import type { CompanyProfile } from "@/lib/mockCompanies";
import type { IntakeSubmission } from "@/lib/intakeTypes";
import {
  buildPreviewCompany,
  buildPreviewNeedListing,
  buildPreviewOfferListing,
  usesMockCompany,
  usesMockNeed,
  usesMockOffer,
} from "@/lib/intakePreviewMocks";

type PreviewData = Pick<
  IntakeSubmission,
  | "companyName"
  | "location"
  | "industry"
  | "listingTitle"
  | "listingDescription"
  | "resourceCategories"
  | "resourcesOffered"
  | "resourcesSought"
  | "purpose"
  | "availabilityNotes"
  | "capacityInfo"
  | "moq"
  | "leadTime"
  | "certifications"
  | "equipmentDetails"
  | "teamSize"
  | "industriesServed"
>;

function PreviewFrame({
  step,
  title,
  subtitle,
  path,
  mock,
  children,
}: {
  step: string;
  title: string;
  subtitle: string;
  path: string;
  mock?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-w-0">
      <div className="mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{step}</span>
          {mock && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Example data
            </span>
          )}
        </div>
        <h3 className="text-[13px] font-bold text-gray-900 mt-0.5">{title}</h3>
        <p className="text-[11px] text-gray-500">{subtitle}</p>
        <p className="text-[10px] text-blue-700 font-medium mt-0.5">{path}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm flex-1 pointer-events-none select-none">
        {children}
      </div>
    </div>
  );
}

function CompanyProfilePreview({ company }: { company: CompanyProfile }) {
  return (
    <div className="text-left">
      <div className={`h-20 bg-gradient-to-br ${company.coverGradient} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-2 left-3 text-[9px] text-white/90 font-medium line-clamp-1">{company.coverLabel}</div>
      </div>
      <div className="px-3 pb-3 -mt-5 relative">
        <div className={`w-10 h-10 rounded-lg border-2 border-white shadow flex items-center justify-center text-sm font-bold ${company.logoColor}`}>
          {company.logoInitials}
        </div>
        <h4 className="text-[13px] font-bold text-gray-900 mt-2 leading-snug">{company.name}</h4>
        <p className="text-[11px] text-gray-600 mt-0.5">{company.tagline}</p>
        <p className="text-[10px] text-gray-500 mt-1">{company.location} · {company.details.industry}</p>
        <p className="text-[11px] text-gray-600 mt-2 leading-relaxed line-clamp-3">{company.about}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {company.capabilities.slice(0, 4).map((cap) => (
            <span key={cap} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {cap}
            </span>
          ))}
        </div>
        {company.certifications[0] && (
          <span className="inline-block mt-2 text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-medium">
            {company.certifications[0].name}
          </span>
        )}
      </div>
    </div>
  );
}

export default function IntakePreviewCards({ data }: { data: PreviewData }) {
  const company = buildPreviewCompany(data);
  const offerListing = buildPreviewOfferListing(data);
  const needListing = buildPreviewNeedListing(data);

  const showOffer = data.purpose === "offer" || data.purpose === "both" || !data.purpose;
  const showNeed = data.purpose === "need" || data.purpose === "both" || !data.purpose;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          See How Your Information May Appear On CapMaxx
        </h2>
        <p className="text-xs text-gray-500 mt-1 max-w-3xl">
          CapMaxx has three places your submission can show up: your <strong className="font-medium text-gray-700">Company Profile</strong>, an{" "}
          <strong className="font-medium text-gray-700">I Offer</strong> listing (resources you provide — badge{" "}
          <span className="font-semibold text-green-700">WE OFFER</span>), and an{" "}
          <strong className="font-medium text-gray-700">I Need</strong> listing (resources you are looking for — badge{" "}
          <span className="font-semibold text-orange-700">WE NEED</span>). Examples below use real CapMaxx layouts; fill in the form to replace them with your data.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <PreviewFrame
          step="Preview 1"
          title="Your Company Profile"
          subtitle="Who you are, what you do, and your capabilities."
          path="capmaxx.com/company/your-company"
          mock={usesMockCompany(data)}
        >
          <CompanyProfilePreview company={company} />
        </PreviewFrame>

        {showOffer && (
          <PreviewFrame
            step="Preview 2"
            title="I Offer Listing"
            subtitle="Resources, capacity, or services you make available to other companies."
            path="capmaxx.com/i-offer"
            mock={usesMockOffer(data)}
          >
            <div className="scale-[0.98] origin-top">
              <ListingCard listing={offerListing} />
            </div>
          </PreviewFrame>
        )}

        {showNeed && (
          <PreviewFrame
            step={showOffer ? "Preview 3" : "Preview 2"}
            title="I Need Listing"
            subtitle="Manufacturing, warehousing, logistics, labor, or services you are searching for."
            path="capmaxx.com/i-need"
            mock={usesMockNeed(data)}
          >
            <div className="scale-[0.98] origin-top">
              <ListingCard listing={needListing} />
            </div>
          </PreviewFrame>
        )}
      </div>

      {data.purpose === "offer" && (
        <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          You selected <strong>I Want To Offer Resources</strong> — Preview 2 is your main listing. Add &quot;What Are You Looking For?&quot; if you also want an I Need listing.
        </p>
      )}
      {data.purpose === "need" && (
        <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          You selected <strong>I Want To Find Resources</strong> — your listing appears on I Need with a <strong>WE NEED</strong> badge so suppliers know you are searching.
        </p>
      )}
      {data.purpose === "both" && (
        <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          You selected <strong>Both</strong> — CapMaxx can create an I Offer listing and an I Need listing from your submission.
        </p>
      )}
    </div>
  );
}
