import Link from "next/link";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 mt-12">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand + description */}
          <div className="md:col-span-2 max-w-xl">
            <Link href="/" className="inline-flex items-center gap-2 mb-3" aria-label="CapMaxx home">
              <span className="flex items-end gap-[2px] h-5" aria-hidden="true">
                <span className="w-1.5 h-2 rounded-[2px] bg-green-500" />
                <span className="w-1.5 h-3 rounded-[2px] bg-blue-400" />
                <span className="w-1.5 h-4 rounded-[2px] bg-green-500" />
                <span className="w-1.5 h-5 rounded-[2px] bg-blue-400" />
              </span>
              <span className="font-bold text-white text-sm">CapMaxx</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              CapMaxx helps businesses turn underutilized resources into revenue by showcasing
              available capacity, equipment, warehouse space, transportation resources, labor,
              services, and business capabilities.
            </p>
          </div>

          {/* Footer nav links */}
          <nav className="flex flex-col gap-2 text-xs md:items-end">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500">© 2026 CapMaxx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
