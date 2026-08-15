"use client";

import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import { usePublicGallery } from "@/hooks/useGallery";

const FALLBACK_IMAGES = [
  { src: "/photos/484994606_1089778563166815_5014659655509340016_n.jpg", alt: "Venue setup", category: "Venue" },
  { src: "/photos/485373853_1089778793166792_79811654493615512_n.jpg", alt: "Event decorations", category: "Setup" },
  { src: "/photos/485658410_1089779039833434_8955685759006598901_n.jpg", alt: "Reception area", category: "Venue" },
  { src: "/photos/485790745_1089778786500126_4091750587922350308_n.jpg", alt: "Event styling", category: "Setup" },
];

export default function GalleryPage() {
  const { photos, loading } = usePublicGallery();
  const galleryImages = photos.length > 0 ? photos : FALLBACK_IMAGES;

  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image
          src={galleryImages[0]?.src || FALLBACK_IMAGES[2].src}
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-sm">Loading gallery...</p>
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <ScrollReveal
                key={i}
                delay={i * 60}
                className={i === 0 || i === 5 ? "md:col-span-2 md:row-span-2" : ""}
              >
                <div
                  className={`relative rounded-2xl overflow-hidden group ${
                    i === 0 || i === 5 ? "aspect-[4/3]" : "aspect-square"
                  }`}
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
              </ScrollReveal>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[var(--color-cream)]">
        <ScrollReveal>
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
        </ScrollReveal>
      </section>
    </>
  );
}
