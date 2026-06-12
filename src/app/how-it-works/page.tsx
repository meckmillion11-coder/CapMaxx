import type { Metadata } from "next";
import SitePageView from "@/components/SitePageView";
import { howItWorksPage } from "@/lib/sitePagesContent";

export const metadata: Metadata = {
  title: "How It Works – CapMaxx",
  description: howItWorksPage.intro,
};

export default function HowItWorksPage() {
  return <SitePageView page={howItWorksPage} />;
}
