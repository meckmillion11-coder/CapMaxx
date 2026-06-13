"use client";

import type { ReactNode } from "react";
import {
  CAPMAXX_BENEFITS,
  CAPMAXX_INTRO,
  CAPMAXX_MISSION,
  CAPMAXX_SITUATIONS,
  CAPMAXX_SITUATIONS_INTRO,
  CAPMAXX_SITUATIONS_SUMMARY,
  CAPMAXX_SITUATIONS_TITLE,
  CAPMAXX_TAGLINE,
  type SituationIconName,
} from "@/lib/intakeValueContent";

function SituationIcon({ name }: { name: SituationIconName }) {
  const cls = "w-5 h-5 text-blue-800";
  const icons: Record<SituationIconName, ReactNode> = {
    calendar: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h2v2H8z" />
      </svg>
    ),
    season: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path d="M4 19V5M4 19h16M8 17V9M12 17V7M16 17v-5" />
      </svg>
    ),
    plant: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path d="M3 21h18M6 21V9l4-2v14M14 21V5l4 2v14" />
        <path d="M10 9V3h4v6" />
      </svg>
    ),
    overflow: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path d="M4 7h16v10H4z" />
        <path d="M8 11h8M8 14h5" />
        <path d="M7 7V5h10v2" />
      </svg>
    ),
    support: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l2 2" />
        <path d="M8 16h8" />
      </svg>
    ),
    capability: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.3L12 15.8 7.2 17.8l.9-5.3L4.2 8.7l5.4-.8L12 3z" />
      </svg>
    ),
  };
  return icons[name];
}

function SituationAccent({ name }: { name: SituationIconName }) {
  const accents: Record<SituationIconName, ReactNode> = {
    calendar: (
      <svg className="w-14 h-14 text-slate-100" viewBox="0 0 56 56" fill="currentColor" aria-hidden="true">
        <rect x="8" y="12" width="40" height="32" rx="4" opacity="0.9" />
        <rect x="14" y="22" width="8" height="8" rx="1" />
        <rect x="26" y="22" width="8" height="8" rx="1" />
      </svg>
    ),
    season: (
      <svg className="w-14 h-14 text-slate-100" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 42V18M10 42h36M18 36V28M28 36V22M38 36v-8" />
      </svg>
    ),
    plant: (
      <svg className="w-14 h-14 text-slate-100" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 44h36M16 44V24l10-4v24M34 44V16l10 4v24" />
      </svg>
    ),
    overflow: (
      <svg className="w-14 h-14 text-slate-100" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="12" y="18" width="32" height="22" rx="2" />
        <path d="M18 26h20M18 32h14" />
      </svg>
    ),
    support: (
      <svg className="w-14 h-14 text-slate-100" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="28" cy="28" r="16" />
        <path d="M28 20v8l5 4" />
      </svg>
    ),
    capability: (
      <svg className="w-14 h-14 text-slate-100" viewBox="0 0 56 56" fill="currentColor" aria-hidden="true">
        <path d="M28 8l4.5 9.1 10 1.5-7.2 7 1.7 9.9L28 31.8l-9 4.7 1.7-9.9-7.2-7 10-1.5L28 8z" />
      </svg>
    ),
  };
  return accents[name];
}

type Variant = "full" | "compact";

export default function IntakeValueStory({ variant = "full" }: { variant?: Variant }) {
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
      <section className="text-center max-w-3xl mx-auto px-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">What is CapMaxx?</h2>
        <p className="text-[14px] sm:text-[15px] text-blue-800 font-medium leading-relaxed mb-3">
          {CAPMAXX_MISSION}
        </p>
        <p className="text-[13px] text-gray-600 leading-relaxed">{CAPMAXX_INTRO}</p>
        <p className="text-[12px] text-gray-400 mt-2 italic">{CAPMAXX_TAGLINE}</p>
      </section>

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

      <section>
        <div className="text-center max-w-2xl mx-auto mb-5 px-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{CAPMAXX_SITUATIONS_TITLE}</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed">{CAPMAXX_SITUATIONS_INTRO}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPMAXX_SITUATIONS.map((situation, i) => (
            <article
              key={situation.title}
              className="relative flex flex-col h-full bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 hover:shadow-sm transition-all animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="absolute top-3 right-3 opacity-80 pointer-events-none" aria-hidden="true">
                <SituationAccent name={situation.icon} />
              </div>

              <div className="flex items-start gap-3 mb-3 relative z-10">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <SituationIcon name={situation.icon} />
                </div>
                <h4 className="text-[14px] sm:text-[15px] font-bold text-gray-900 leading-snug pt-1 pr-10">
                  {situation.title}
                </h4>
              </div>

              <ul className="space-y-1.5 mb-4 relative z-10 flex-1">
                {situation.lines.map((line) => (
                  <li key={line} className="text-[12px] sm:text-[13px] text-gray-600 leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1 before:h-1 before:rounded-full before:bg-slate-300">
                    {line}
                  </li>
                ))}
              </ul>

              <p className="text-[11px] sm:text-[12px] text-blue-900 bg-blue-50/80 border border-blue-100 rounded-lg px-3 py-2 leading-relaxed relative z-10 mt-auto">
                {situation.outcome}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
          <p className="text-[12px] sm:text-[13px] text-slate-700 leading-relaxed text-center">
            {CAPMAXX_SITUATIONS_SUMMARY}
          </p>
        </div>
      </section>
    </div>
  );
}
