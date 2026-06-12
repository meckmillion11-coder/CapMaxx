import type { SitePage } from "@/lib/sitePagesContent";

export default function SitePageView({ page }: { page: SitePage }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 lg:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-950 tracking-tight mb-4">{page.title}</h1>

      {page.intro && <p className="text-[15px] text-gray-600 leading-relaxed mb-8">{page.intro}</p>}

      <div className="space-y-8">
        {page.sections?.map((section, i) => (
          <section key={section.heading ?? i}>
            {section.heading && (
              <h2 className="text-base font-bold text-gray-900 mb-3">{section.heading}</h2>
            )}
            {section.body && (
              <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
            )}
            {section.items && (
              <ul className="mt-2 space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {page.note && (
        <p className="mt-10 text-xs text-gray-500 italic border-t border-gray-100 pt-5 leading-relaxed">
          {page.note}
        </p>
      )}
    </article>
  );
}
