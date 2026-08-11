"use client";

import { useState } from "react";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    date: "",
    pax: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&h=800&fit=crop"
          alt="Contact Arabella"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <p className="text-[var(--color-accent)] tracking-[0.3em] uppercase text-sm mb-4 font-medium">
            Get In Touch
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Book Your Event
          </h1>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2
                className="text-2xl md:text-3xl font-bold text-[var(--color-dark)] mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Send Us an Inquiry
              </h2>
              <p className="text-gray-500 mb-8">
                Fill out the form below and we&apos;ll get back to you within 24
                hours.
              </p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <span className="text-4xl mb-4 block">✓</span>
                  <h3
                    className="text-xl font-bold text-green-800 mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Thank You!
                  </h3>
                  <p className="text-green-700">
                    Your inquiry has been received. We&apos;ll contact you soon!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                        placeholder="Juan Dela Cruz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                        placeholder="juan@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                        placeholder="+63 912 345 6789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type *
                      </label>
                      <select
                        name="eventType"
                        required
                        value={formData.eventType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition bg-white"
                      >
                        <option value="">Select event type</option>
                        <option value="wedding">Wedding</option>
                        <option value="birthday">Birthday Party</option>
                        <option value="corporate">Corporate Event</option>
                        <option value="family">Family Gathering</option>
                        <option value="christening">Christening</option>
                        <option value="debut">Debut</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        name="pax"
                        value={formData.pax}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                        placeholder="e.g. 100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition resize-none"
                      placeholder="Tell us about your event — special requests, menu preferences, etc."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[var(--color-primary)] text-white py-4 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-[var(--color-primary-dark)] transition-colors"
                  >
                    Send Inquiry
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[var(--color-cream)] rounded-2xl p-8">
                <h3
                  className="text-lg font-bold text-[var(--color-dark)] mb-4"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Contact Information
                </h3>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li>
                    <span className="font-medium text-[var(--color-dark)]">
                      Address:
                    </span>
                    <br />
                    F. Julian Street
                    <br />
                    Laoag City, Ilocos Norte 2900
                  </li>
                  <li>
                    <span className="font-medium text-[var(--color-dark)]">
                      Phone:
                    </span>
                    <br />
                    <a href="tel:+639123456789" className="hover:text-[var(--color-primary)] transition-colors">
                      +63 912 345 6789
                    </a>
                  </li>
                  <li>
                    <span className="font-medium text-[var(--color-dark)]">
                      Email:
                    </span>
                    <br />
                    <a href="mailto:info@arabellaevents.ph" className="hover:text-[var(--color-primary)] transition-colors">
                      info@arabellaevents.ph
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-[var(--color-cream)] rounded-2xl p-8">
                <h3
                  className="text-lg font-bold text-[var(--color-dark)] mb-4"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Business Hours
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">8:00 AM - 5:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">By Appointment</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[var(--color-primary)] text-white rounded-2xl p-8">
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Quick Quote
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  For immediate pricing, call us directly or send a message on
                  our Facebook page. We respond within the hour during business
                  hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
