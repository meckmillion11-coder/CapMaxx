import Link from "next/link";
import { isPreLaunchMode } from "@/lib/preLaunch";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

const preLaunchLinks = [
  { label: "Early Access", href: "/intake" },
  { label: "Join", href: "/join" },
  { label: "Founding Companies", href: "/founding-companies" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

export default function Footer() {
  const preLaunch = isPreLaunchMode();
  const links = preLaunch ? preLaunchLinks : footerLinks;
  const homeHref = preLaunch ? "/intake" : "/";

  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 mt-6 lg:mt-12">
      <div className="max-w-screen-xl mx-auto px-4 py-4 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6">
          <div className="md:col-span-2 max-w-xl">
            <Link href={homeHref} className="inline-flex items-center gap-2 mb-1 lg:mb-3" aria-label="CapMaxx home">
              <span className="flex items-end gap-[2px] h-5" aria-hidden="true">
                <span className="w-1.5 h-2 rounded-[2px] bg-green-500" />
                <span className="w-1.5 h-3 rounded-[2px] bg-blue-400" />
                <span className="w-1.5 h-4 rounded-[2px] bg-green-500" />
                <span className="w-1.5 h-5 rounded-[2px] bg-blue-400" />
              </span>
              <span className="font-bold text-white text-sm">CapMaxx</span>
            </Link>
            <p className="text-[11px] lg:text-xs text-gray-500 leading-relaxed hidden sm:block">
              {preLaunch
                ? "CapMaxx is in early access. Founding companies can submit manufacturing, warehousing, logistics, equipment, labor, and service capabilities before public launch."
                : "CapMaxx helps businesses turn underutilized resources into revenue by showcasing available capacity, equipment, warehouse space, transportation resources, labor, services, and business capabilities."}
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] lg:text-xs md:flex md:flex-col md:gap-2 md:items-end">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors truncate">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-3 lg:mt-8 pt-3 lg:pt-6 border-t border-gray-800">
          <p className="text-[11px] lg:text-xs text-gray-500">© 2026 CapMaxx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
