"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Booking } from "@/hooks/useAdmin";

interface NewBookingModalProps {
  onClose: () => void;
  onCreated: (booking: Booking) => void;
}

const EVENT_TYPES = [
  "Wedding", "Birthday Party", "Corporate Event",
  "Family Gathering", "Christening", "Debut", "Other",
];

export default function NewBookingModal({ onClose, onCreated }: NewBookingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [eventDate, setEventDate] = useState("");
  const [pax, setPax] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("bookings")
      .insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        event_type: eventType,
        event_date: eventDate || null,
        pax: pax ? parseInt(pax) : null,
        message: message.trim() || null,
        status: "new",
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    onCreated(data as Booking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: "var(--font-playfair)" }}>
            New Booking
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition"
                placeholder="Client name"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition bg-white"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition"
                placeholder="09XX XXX XXXX"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Pax</label>
              <input
                type="number"
                value={pax}
                onChange={(e) => setPax(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition resize-none"
              placeholder="Additional details..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
              {saving ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
