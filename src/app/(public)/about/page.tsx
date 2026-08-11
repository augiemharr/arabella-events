import Image from "next/image";

const values = [
  {
    title: "Authentic Ilocano Cuisine",
    desc: "We take pride in preserving the rich culinary traditions of Ilocos Norte, serving dishes made from time-honored recipes.",
  },
  {
    title: "Dedicated Service",
    desc: "Our team ensures every detail is taken care of, from the first inquiry to the last guest departure.",
  },
  {
    title: "Beautiful Venue",
    desc: "Our elegantly decorated space provides the perfect backdrop for any celebration, big or small.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1920&h=800&fit=crop"
          alt="About Arabella"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <p className="text-[var(--color-accent)] tracking-[0.3em] uppercase text-sm mb-4 font-medium">
            Our Story
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            About Us
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[var(--color-primary)] tracking-[0.2em] uppercase text-sm mb-3 font-medium">
                Since 2015
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                A Legacy of
                <br />
                Flavor & Celebration
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Arabella Events Place was born from a passion for sharing the
                  rich flavors of Ilocano cuisine with the world. Located in the
                  heart of Laoag City, Ilocos Norte, we have been the
                  go-to venue for celebrations that matter.
                </p>
                <p>
                  From intimate family dinners to grand weddings, our team
                  brings warmth, tradition, and meticulous attention to every
                  event. Our kitchen serves authentic Ilocano dishes — from
                  crispy bagnet to savory dinuguan — prepared with fresh,
                  locally sourced ingredients.
                </p>
                <p>
                  With over 127 satisfied reviews and counting, we continue to
                  be the trusted choice for events in Ilocos Norte.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=1000&fit=crop"
                alt="Arabella's kitchen"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[var(--color-cream)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[var(--color-primary)] tracking-[0.2em] uppercase text-sm mb-3 font-medium">
              Why Choose Us
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[var(--color-dark)]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-8 text-center"
              >
                <h3
                  className="text-xl font-bold text-[var(--color-dark)] mb-3"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {v.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--color-primary)] tracking-[0.2em] uppercase text-sm mb-3 font-medium">
              Find Us
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Our Location
            </h2>
            <p className="text-gray-500">
              F. Julian Street, Laoag City, Ilocos Norte 2900, Philippines
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden h-[400px] bg-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3866.5!2d120.585!3d18.209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x338ec89ac9c785c7%3A0xa49190d2ef4416b7!2sArabella%27s%20Events%20Place!5e0!3m2!1sen!2sph!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Arabella Events Place Location"
            />
          </div>
        </div>
      </section>
    </>
  );
}
