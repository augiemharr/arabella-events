import Image from "next/image";

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop", alt: "Wedding reception setup", category: "Events" },
  { src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop", alt: "Banquet hall", category: "Venue" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop", alt: "Elegant table setting", category: "Setup" },
  { src: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop", alt: "Buffet spread", category: "Food" },
  { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop", alt: "Signature dish", category: "Food" },
  { src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop", alt: "Birthday celebration", category: "Events" },
  { src: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&h=600&fit=crop", alt: "Party decorations", category: "Events" },
  { src: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop", alt: "Grilled pork", category: "Food" },
  { src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop", alt: "Outdoor venue area", category: "Venue" },
  { src: "https://images.unsplash.com/photo-1470338745628-171cf53de3a8?w=800&h=600&fit=crop", alt: "Wedding flowers", category: "Setup" },
  { src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop", alt: "Filipino dish", category: "Food" },
  { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop", alt: "Event lighting", category: "Setup" },
];

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920&h=800&fit=crop"
          alt="Arabella gallery"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <p className="text-[var(--color-accent)] tracking-[0.3em] uppercase text-sm mb-4 font-medium">
            Take a Look
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Gallery
          </h1>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className={`relative rounded-2xl overflow-hidden group ${
                  i === 0 || i === 5 ? "md:col-span-2 md:row-span-2" : ""
                } ${i === 0 ? "aspect-[4/3]" : "aspect-square"}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-xs font-medium bg-[var(--color-primary)]/80 px-2 py-1 rounded-full">
                      {img.category}
                    </span>
                    <p className="text-white text-sm mt-1">{img.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[var(--color-cream)]">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2
            className="text-2xl md:text-3xl font-bold text-[var(--color-dark)] mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Love What You See?
          </h2>
          <p className="text-gray-500 mb-8">
            Schedule a venue visit to experience Arabella Events Place in
            person.
          </p>
          <a
            href="/contact"
            className="inline-block bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Schedule a Visit
          </a>
        </div>
      </section>
    </>
  );
}
