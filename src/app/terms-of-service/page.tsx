import type { Metadata } from "next";
import SitePageView from "@/components/SitePageView";
import { termsOfServicePage } from "@/lib/sitePagesContent";

export const metadata: Metadata = {
  title: "Terms of Service – CapMaxx",
  description: termsOfServicePage.intro,
};

export default function TermsOfServicePage() {
  return <SitePageView page={termsOfServicePage} />;
}
