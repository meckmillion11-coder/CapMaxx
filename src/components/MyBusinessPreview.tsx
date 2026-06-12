import Link from "next/link";

const sections = [
  {
    title: "Company Profile",
    description: "Your business identity — who you are, what you do, and where you operate.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: "Listings",
    description: "All your active We Offer and We Need listings in one place.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: "Business Preferences",
    description: "Set your ideal business criteria so CapMaxx surfaces the right opportunities.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    title: "Company Information",
    description: "Industry, size, location, certifications, and other details that matter to partners.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function MyBusinessPreview() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            My Business
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Everything about your business — organized, visible, and ready to
            attract the right opportunities.
          </p>
        </div>

        <div className="max-w-4xl mx-auto border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Mock app header */}
          <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-4 text-gray-400 text-sm font-mono">My Business</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {sections.map((section) => (
              <div
                key={section.title}
                className="p-6 flex gap-4 items-start hover:bg-blue-50 transition-colors cursor-pointer group border-b border-gray-100 last:border-b-0 sm:[&:nth-child(even)]:border-b-0 sm:[&:nth-child(3)]:border-b-0 sm:[&:nth-child(4)]:border-b-0"
              >
                <div className="text-blue-700 mt-0.5 group-hover:text-blue-800 shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <Link
              href="/my-business"
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              Go to My Business →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
