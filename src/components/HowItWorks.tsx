const steps = [
  {
    step: "1",
    label: "My Request Form",
    description: "Fill one request form with your business details.",
  },
  {
    step: "2",
    label: "We Offer / We Need",
    description: "Your listing is generated from the information you provide.",
  },
  {
    step: "3",
    label: "Listing Published",
    description: "Your listing goes live and becomes visible to other businesses.",
  },
  {
    step: "4",
    label: "Business Opportunities",
    description: "Connect with customers, suppliers, and partners who are the right fit.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How CapMaxx Works
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Fill one request form. Publish your listing. Connect with
            opportunities.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-9 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-0.5 bg-blue-200" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {steps.map((s, i) => (
                <div key={s.step} className="relative flex flex-col items-center text-center">
                  {/* Arrow between steps on mobile */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden w-0.5 h-8 bg-blue-200 my-2 order-last" />
                  )}
                  <div className="w-16 h-16 rounded-full bg-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-sm z-10 mb-4">
                    {s.step}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {s.label}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary pills */}
        <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {["Fill one request form.", "Publish your listing.", "Connect with opportunities."].map(
            (msg) => (
              <div
                key={msg}
                className="px-6 py-3 bg-white border border-blue-200 rounded-full text-blue-700 font-medium text-sm shadow-sm"
              >
                {msg}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
