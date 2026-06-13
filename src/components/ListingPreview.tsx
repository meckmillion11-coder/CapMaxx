const listingFields = [
  { label: "Capacity", value: "Up to 500 units/week" },
  { label: "Capability", value: "CNC Machining, Precision Parts" },
  { label: "Available Window", value: "Mon–Fri, 6 AM – 2 PM" },
  { label: "Lead Time", value: "3–5 business days" },
  { label: "Minimum Order Quantity", value: "50 units" },
  { label: "Business Frequency", value: "Ongoing or Project-Based" },
  { label: "Team Size", value: "12 people" },
  { label: "Certifications", value: "ISO 9001, AS9100" },
];

export default function ListingPreview() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What a CapMaxx Listing Looks Like
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Every listing gives other businesses the information they need to
            decide if there&apos;s a fit — quickly and clearly.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Listing header */}
            <div className="bg-blue-700 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">
                  Sample Listing
                </p>
                <h3 className="text-xl font-bold">Sample Manufacturing Co.</h3>
                <p className="text-blue-200 text-sm mt-1">Manufacturing · Your City, ST</p>
              </div>
              <div className="flex flex-col gap-2 text-right">
                <span className="inline-block bg-white text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  We Offer
                </span>
                <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full border border-blue-400">
                  We Need
                </span>
              </div>
            </div>

            {/* Fields */}
            <div className="divide-y divide-gray-100">
              {listingFields.map((field) => (
                <div key={field.label} className="flex items-start px-6 py-4 gap-4">
                  <span className="text-sm font-medium text-gray-500 w-44 shrink-0">
                    {field.label}
                  </span>
                  <span className="text-sm text-gray-900">{field.value}</span>
                </div>
              ))}
            </div>

            {/* Photos strip */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Photos
              </p>
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-20 h-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium"
                  >
                    Photo {i}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Contact &amp; Profile
                </p>
                <div className="flex gap-3 text-sm text-blue-700 font-medium">
                  <a href="#" className="hover:underline">Contact</a>
                  <a href="#" className="hover:underline">Company Profile</a>
                </div>
              </div>
              <button className="px-5 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
