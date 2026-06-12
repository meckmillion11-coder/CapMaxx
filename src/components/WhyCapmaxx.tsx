const cards = [
  {
    icon: "📦",
    title: "Underutilized Resources",
    description:
      "Equipment, space, inventory, or capacity sitting idle can be monetized or shared with businesses that need it.",
  },
  {
    icon: "🧠",
    title: "Available Expertise",
    description:
      "Your team's skills and knowledge can open new revenue streams beyond your primary business model.",
  },
  {
    icon: "⚙️",
    title: "Business Capabilities",
    description:
      "Services, processes, or production capabilities you already run can serve other companies in your market.",
  },
  {
    icon: "🤝",
    title: "Strategic Partnerships",
    description:
      "Connect with the right suppliers, vendors, and peers to grow faster and operate more efficiently.",
  },
  {
    icon: "💰",
    title: "Additional Revenue Opportunities",
    description:
      "Discover and act on business opportunities that align with what your company already does well.",
  },
  {
    icon: "📈",
    title: "Better Resource Utilization",
    description:
      "Maximize the return on every asset, person, and process your business already owns.",
  },
];

export default function WhyCapmaxx() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why CapMaxx
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Many businesses have more potential than they realize. CapMaxx helps
            businesses generate additional value from resources, expertise,
            services, capabilities, relationships, and opportunities that may
            not be fully utilized.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-4">{card.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
