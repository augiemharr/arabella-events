import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3
              className="text-3xl font-bold text-[var(--color-accent)] mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Arabella
            </h3>
            <p className="text-sm tracking-widest uppercase text-gray-400 mb-4">
              Events Place
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premier events venue and catering in Laoag City, Ilocos Norte.
              Making your special occasions truly memorable with authentic
              Ilocano cuisine.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-6 text-[var(--color-accent)]">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/menu", label: "Menu" },
                { href: "/gallery", label: "Gallery" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Book Now" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-6 text-[var(--color-accent)]">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>F. Julian Street</li>
              <li>Laoag City, Ilocos Norte 2900</li>
              <li>Philippines</li>
              <li className="pt-2">
                <a href="tel:+639123456789" className="hover:text-white transition-colors">
                  +63 912 345 6789
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@arabellaevents.ph"
                  className="hover:text-white transition-colors"
                >
                  info@arabellaevents.ph
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Arabella Events Place. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
