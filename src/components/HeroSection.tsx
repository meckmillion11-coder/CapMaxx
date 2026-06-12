import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-700 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
          Cap<span className="text-blue-200">Maxx</span>
        </h1>
        <p className="text-xl sm:text-2xl font-semibold text-blue-100 mb-6">
          Maximum Capacity. Maximum Capability. Maximum Revenue.
        </p>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          Help your business get more from the resources you already have.
          <br className="hidden sm:block" />
          CapMaxx helps businesses showcase capabilities, products, services,
          expertise, resources, and opportunities while discovering new
          customers, suppliers, partners, and business opportunities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 text-lg font-semibold bg-white text-blue-700 hover:bg-blue-50 rounded-md transition-colors shadow-sm"
          >
            Sign Up
          </Link>
          <Link
            href="/signin"
            className="px-8 py-3 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-700 rounded-md transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
