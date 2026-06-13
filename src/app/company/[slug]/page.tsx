import Link from "next/link";
import CompanyProfileView from "@/components/CompanyProfileView";
import { getCompanyProfileBySlugServer } from "@/lib/db/companies.server";

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyProfileBySlugServer(slug);

  if (!company) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold text-gray-900 mb-2">Company not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          This company profile doesn&apos;t exist or hasn&apos;t been approved yet.
        </p>
        <Link href="/i-offer" className="text-sm font-medium text-blue-700 hover:underline">
          Browse marketplace listings →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      <CompanyProfileView company={company} editable={false} />
    </div>
  );
}
