import Link from "next/link";

export default function JoinCTA() {
  return (
    <section className="bg-blue-700 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block bg-blue-600 text-blue-100 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          Limited Early Access
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Join Our Founding Companies
        </h2>
        <p className="text-blue-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Be among the first businesses to list on CapMaxx. Founding companies
          get early access, priority visibility, and the opportunity to shape
          how the platform grows.
        </p>
        <Link
          href="/signup"
          className="inline-block px-10 py-4 text-lg font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-md transition-colors shadow-sm"
        >
          Join Founding Companies
        </Link>
      </div>
    </section>
  );
}
