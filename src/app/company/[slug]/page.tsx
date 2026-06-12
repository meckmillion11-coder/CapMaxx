import CompanyProfileView from "@/components/CompanyProfileView";
import { getCompanyProfileOrFallback, mockCompanyProfiles } from "@/lib/mockCompanies";
import { getCompanyProfileBySlugServer } from "@/lib/db/companies.server";

export function generateStaticParams() {
  return mockCompanyProfiles.map((c) => ({ slug: c.slug }));
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Real company from Supabase when configured + found; otherwise mock fallback.
  const company =
    (await getCompanyProfileBySlugServer(slug)) ?? getCompanyProfileOrFallback(slug);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      <CompanyProfileView company={company} editable={false} />
    </div>
  );
}
