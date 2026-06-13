import Link from "next/link";
import {
  CAPMAXX_BENEFITS,
  CAPMAXX_MISSION,
  CAPMAXX_TAGLINE,
} from "@/lib/intakeValueContent";

export default function JoinCTA() {
  return (
    <section className="bg-blue-700 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-block bg-blue-600 text-blue-100 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Limited Early Access
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Use your resources to full capability
          </h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {CAPMAXX_MISSION} {CAPMAXX_TAGLINE}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {CAPMAXX_BENEFITS.map((b) => (
            <div key={b.title} className="bg-blue-600/40 border border-blue-500/40 rounded-lg p-4 text-left">
              <h3 className="text-sm font-semibold text-white mb-1">{b.title}</h3>
              <p className="text-[13px] text-blue-100 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/founding-companies"
            className="inline-block px-10 py-4 text-lg font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-md transition-colors shadow-sm"
          >
            Join Founding Companies
          </Link>
        </div>
      </div>
    </section>
  );
}
