import type { Metadata } from "next";
import SitePageView from "@/components/SitePageView";
import { aboutPage } from "@/lib/sitePagesContent";

export const metadata: Metadata = {
  title: "About – CapMaxx",
  description: aboutPage.intro,
};

export default function AboutPage() {
  return <SitePageView page={aboutPage} />;
}
