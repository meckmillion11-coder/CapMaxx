import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "CapMaxx – Maximum Capacity. Maximum Capability. Maximum Revenue.",
  description:
    "CapMaxx helps businesses showcase capabilities, products, services, expertise, resources, and opportunities while discovering new customers, suppliers, partners, and business opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Nav />
        <main className="overflow-x-hidden min-w-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
