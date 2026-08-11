import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";

const aLaCarteItems = [
  { name: "Bagnet", desc: "Crispy deep-fried pork belly with bagoong dip", price: "₱350" },
  { name: "Poqui Poqui", desc: "Grilled eggplant with eggs and tomatoes", price: "₱180" },
  { name: "Dinuguan", desc: "Pork blood stew with green chili", price: "₱280" },
  { name: "Pinakbet", desc: "Mixed vegetables with bagoong and shrimp paste", price: "₱220" },
  { name: "Hegado", desc: "Pork liver stew with vegetables", price: "₱260" },
  { name: "Pochero", desc: "Pork and vegetable stew in tomato broth", price: "₱300" },
];

const buffetPackages = [
  {
    name: "Silver Package",
    pax: "50-100 pax",
    price: "₱350/pax",
    includes: ["2 Main Courses", "3 Side Dishes", "Rice", "Drinks", "Basic Table Setup"],
  },
  {
    name: "Gold Package",
    pax: "100-200 pax",
    price: "₱500/pax",
    includes: ["4 Main Courses", "4 Side Dishes", "Rice", "Drinks", "Dessert", "Full Table Setup"],
  },
  {
    name: "Premium Package",
    pax: "200+ pax",
    price: "₱700/pax",
    includes: ["6 Main Courses", "5 Side Dishes", "Rice", "Drinks", "Dessert", "Premium Setup", "Free Tasting"],
  },
];

export default function MenuPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&h=800&fit=crop"
          alt="Arabella menu"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <p className="text-[var(--color-accent)] tracking-[0.3em] uppercase text-sm mb-4 font-medium">
            Our Offerings
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Menu & Packages
          </h1>
        </div>
      </section>

      {/* A La Carte */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[var(--color-primary)] tracking-[0.2em] uppercase text-sm mb-3 font-medium">
                A La Carte
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-[var(--color-dark)]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Ilocano Specialties
              </h2>
            </div>
          </ScrollReveal>
          <div className="space-y-6">
            {aLaCarteItems.map((item, i) => (
              <ScrollReveal key={item.name} delay={i * 80}>
                <div className="flex justify-between items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                  <div>
                    <h3
                      className="text-lg font-semibold text-[var(--color-dark)]"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                  </div>
                  <span className="text-[var(--color-primary)] font-semibold text-lg whitespace-nowrap">
                    {item.price}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Buffet Packages */}
      <section className="py-20 bg-[var(--color-cream)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[var(--color-primary)] tracking-[0.2em] uppercase text-sm mb-3 font-medium">
                For Events
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Buffet Packages
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Customizable catering packages for your events. All packages
                include serving staff.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {buffetPackages.map((pkg, i) => (
              <ScrollReveal key={pkg.name} delay={i * 150}>
                <div
                  className={`rounded-2xl p-8 ${
                    i === 1
                      ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-accent)] scale-105"
                      : "bg-white"
                  }`}
                >
                  {i === 1 && (
                    <span className="inline-block bg-[var(--color-accent)] text-[var(--color-dark)] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    className={`text-sm mb-1 ${
                      i === 1 ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    {pkg.pax}
                  </p>
                  <p className="text-3xl font-bold mb-6">{pkg.price}</p>
                  <ul className="space-y-3">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--color-accent)] font-bold">/</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 bg-white">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm leading-relaxed">
              * Prices may vary depending on seasonal availability. Custom menus
              are available upon request. A tasting session can be arranged for
              bookings of 100 pax and above. Contact us for a personalized
              quote.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
