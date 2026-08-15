import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";

const featuredDishes = [
  {
    name: "Bagnet",
    description: "Crispy deep-fried pork belly, a beloved Ilocano delicacy",
    image: "/photos/bagnet.jpg",
  },
  {
    name: "Poqui Poqui",
    description: "Smoky grilled eggplant with eggs and tomatoes",
    image: "/photos/poqui-poqui.jpg",
  },
  {
    name: "Dinuguan",
    description: "Rich pork blood stew, a Filipino classic",
    image: "/photos/dinuguan.jpg",
  },
];

const eventTypes = [
  { icon: "01", title: "Weddings", desc: "Elegant celebrations for your special day" },
  { icon: "02", title: "Birthday Parties", desc: "Memorable milestones for all ages" },
  { icon: "03", title: "Corporate Events", desc: "Professional gatherings and functions" },
  { icon: "04", title: "Family Gatherings", desc: "Reunions and celebrations with loved ones" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/photos/484994606_1089778563166815_5014659655509340016_n.jpg"
          alt="Arabella Events Place venue"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-[var(--color-accent)] tracking-[0.3em] uppercase text-sm mb-6 font-medium">
            Laoag City, Ilocos Norte
          </p>
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Where Every
            <br />
            Celebration Begins
          </h1>
          <p className="text-gray-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Premium events venue and authentic Ilocano catering for weddings,
            parties, and life&apos;s most cherished moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Book Your Event
            </Link>
            <Link
              href="/menu"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-white hover:text-[var(--color-dark)] transition-colors"
            >
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-[var(--color-primary)] tracking-[0.2em] uppercase text-sm mb-3 font-medium">
              Perfect For
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Every Occasion
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-16">
              From intimate gatherings to grand celebrations, we bring your vision
              to life.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {eventTypes.map((event, i) => (
              <ScrollReveal key={event.title} delay={i * 100}>
                <div className="p-6 rounded-2xl hover:shadow-lg transition-shadow bg-[var(--color-warm-gray)]">
                  <span className="text-[var(--color-primary)] font-bold text-2xl mb-4 block" style={{ fontFamily: "var(--font-playfair)" }}>{event.icon}</span>
                  <h3
                    className="text-lg font-semibold text-[var(--color-dark)] mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500">{event.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-20 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[var(--color-primary)] tracking-[0.2em] uppercase text-sm mb-3 font-medium">
                Authentic Ilocano
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Signature Dishes
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Savor the rich flavors of Ilocano cuisine, prepared with
                tradition and love.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDishes.map((dish, i) => (
              <ScrollReveal key={dish.name} delay={i * 150}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3
                      className="text-xl font-bold text-[var(--color-dark)] mb-2"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {dish.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{dish.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-block bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[var(--color-primary)] tracking-[0.2em] uppercase text-sm mb-3 font-medium">
                See Our Space
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Gallery
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "/photos/485373853_1089778793166792_79811654493615512_n.jpg",
              "/photos/485658410_1089779039833434_8955685759006598901_n.jpg",
              "/photos/485790745_1089778786500126_4091750587922350308_n.jpg",
              "/photos/484994606_1089778563166815_5014659655509340016_n.jpg",
            ].map((src, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="relative aspect-square rounded-2xl overflow-hidden group">
                  <Image
                    src={src}
                    alt={`Gallery image ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="inline-block border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-8 py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              View All Photos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="/photos/485373853_1089778793166792_79811654493615512_n.jpg"
          alt="Event setup"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[var(--color-primary-dark)]/90" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <ScrollReveal>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Ready to Plan Your Event?
            </h2>
            <p className="text-white/80 text-lg mb-10">
              Let us help you create unforgettable memories. Inquire now for venue
              availability and customized packages.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-[var(--color-primary-dark)] px-10 py-4 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-gray-100 transition-colors"
            >
              Get In Touch
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
