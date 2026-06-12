import type { Metadata } from "next";
import SitePageView from "@/components/SitePageView";
import { contactPage } from "@/lib/sitePagesContent";

export const metadata: Metadata = {
  title: "Contact Us – CapMaxx",
  description: contactPage.intro,
};

export default function ContactPage() {
  return <SitePageView page={contactPage} />;
}
