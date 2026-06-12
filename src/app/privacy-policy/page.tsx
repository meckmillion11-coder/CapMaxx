import type { Metadata } from "next";
import SitePageView from "@/components/SitePageView";
import { privacyPolicyPage } from "@/lib/sitePagesContent";

export const metadata: Metadata = {
  title: "Privacy Policy – CapMaxx",
  description: privacyPolicyPage.intro,
};

export default function PrivacyPolicyPage() {
  return <SitePageView page={privacyPolicyPage} />;
}
