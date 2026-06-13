"use client";

import {
  CAPMAXX_BENEFITS,
  CAPMAXX_EXAMPLES,
  CAPMAXX_INTRO,
  CAPMAXX_MISSION,
  CAPMAXX_TAGLINE,
} from "@/lib/intakeValueContent";

function UtilizationIllustration() {
  return (
    <div className="relative h-full min-h-[200px] rounded-lg overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-4 flex flex-col justify-between">
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute top-4 left-4 w-16 h-16 border border-white/30 rounded" />
        <div className="absolute top-8 right-6 w-24 h-12 border border-white/20 rounded" />
        <div className="absolute bottom-12 left-8 w-20 h-20 border border-green-400/40 rounded-full" />
      </div>
      <div className="relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Before CapMaxx</span>
        <div className="mt-2 flex items-end gap-1 h-16">
          {[35, 42, 28, 38, 30].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-white/20 animate-pulse"
              style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
        <p className="text-[11px] text-blue-200 mt-1">Machines, space &amp; trucks underutilized</p>
      </div>
      <div className="relative z-10 border-t border-white/10 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">With CapMaxx</span>
        <div className="mt-2 flex items-end gap-1 h-16">
          {[78, 88, 82, 92, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-green-600 to-green-400"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="text-[11px] text-white font-medium mt-1">Resources matched · revenue unlocked</p>
      </div>
    </div>
  );
}

type Variant = "full" | "compact";

export default function IntakeValueStory({ variant = "full" }: { variant?: Variant }) {
  const [visual, ...descriptive] = CAPMAXX_EXAMPLES;

  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4 animate-fade-in">
        <p className="text-[13px] font-semibold text-blue-900">{CAPMAXX_MISSION}</p>
        <p className="text-[12px] text-gray-600 mt-1">{CAPMAXX_TAGLINE}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mb-8 animate-fade-in">
      {/* What CapMaxx is */}
      <section className="text-center max-w-3xl mx-auto px-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">What is CapMaxx?</h2>
        <p className="text-[14px] sm:text-[15px] text-blue-800 font-medium leading-relaxed mb-3">
          {CAPMAXX_MISSION}
        </p>
        <p className="text-[13px] text-gray-600 leading-relaxed">{CAPMAXX_INTRO}</p>
        <p className="text-[12px] text-gray-400 mt-2 italic">{CAPMAXX_TAGLINE}</p>
      </section>

      {/* Benefits */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 text-center mb-4">How your company benefits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CAPMAXX_BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold mb-2">
                {i + 1}
              </div>
              <h4 className="text-[13px] font-semibold text-gray-900 mb-1">{b.title}</h4>
              <p className="text-[12px] text-gray-500 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 examples: 1 visual + 2 descriptive */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 text-center mb-1">Real ways companies use CapMaxx</h3>
        <p className="text-[12px] text-gray-500 text-center mb-4">
          Existing resources. Full capability. No more sitting idle.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Visual / image-style example */}
          <article className="lg:row-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow animate-fade-in-up">
            <UtilizationIllustration />
            <div className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-50 px-2 py-0.5 rounded">
                {visual.label}
              </span>
              <h4 className="text-[15px] font-bold text-gray-900 mt-2">{visual.title}</h4>
              <div className="flex items-baseline gap-2 mt-2 mb-2">
                <span className="text-2xl font-bold text-blue-700">{visual.stat}</span>
                <span className="text-[11px] text-gray-500">{visual.statLabel}</span>
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed">{visual.body}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {visual.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Two descriptive examples */}
          {descriptive.map((ex, i) => (
            <article
              key={ex.title}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-green-200 hover:shadow-sm transition-all animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {ex.label}
              </span>
              <h4 className="text-[14px] font-semibold text-gray-900 mt-2 mb-2">{ex.title}</h4>
              <p className="text-[13px] text-gray-600 leading-relaxed">{ex.body}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {ex.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
