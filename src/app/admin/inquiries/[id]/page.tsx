"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string | null;
  pax: number | null;
  message: string | null;
  status: string;
  created_at: string;
}

export default function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/admin/login");
        return;
      }

      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      setBooking(bookingData);
      setLoading(false);
    };

    checkAuth();
  }, [id, router]);

  const updateStatus = async (newStatus: string) => {
    if (!booking) return;
    setUpdating(true);

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", booking.id);

    if (!error) {
      setBooking({ ...booking, status: newStatus });
    }
    setUpdating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/inquiries"
              className="text-[var(--color-primary)] hover:underline text-sm"
            >
              Back to Inquiries
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1
                className="text-2xl font-bold text-[var(--color-dark)]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {booking.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Submitted {new Date(booking.created_at).toLocaleDateString()} at{" "}
                {new Date(booking.created_at).toLocaleTimeString()}
              </p>
            </div>
            <span
              className={`text-sm font-medium px-3 py-1.5 rounded-full ${
                booking.status === "new"
                  ? "bg-blue-100 text-blue-700"
                  : booking.status === "contacted"
                  ? "bg-yellow-100 text-yellow-700"
                  : booking.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          {/* Status Actions */}
          <div className="flex gap-2 flex-wrap">
            {["new", "contacted", "confirmed", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={updating || booking.status === s}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                  booking.status === s
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2
            className="text-lg font-bold text-[var(--color-dark)] mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Booking Details
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </p>
                <a
                  href={`mailto:${booking.email}`}
                  className="text-[var(--color-dark)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {booking.email}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Phone
                </p>
                <a
                  href={`tel:${booking.phone}`}
                  className="text-[var(--color-dark)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {booking.phone}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Event Type
                </p>
                <p className="text-[var(--color-dark)]">{booking.event_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Event Date
                </p>
                <p className="text-[var(--color-dark)]">
                  {booking.event_date
                    ? new Date(booking.event_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Number of Guests
                </p>
                <p className="text-[var(--color-dark)]">
                  {booking.pax ? `${booking.pax} pax` : "Not specified"}
                </p>
              </div>
            </div>

            {booking.message && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Additional Message
                </p>
                <p className="text-[var(--color-dark)] leading-relaxed whitespace-pre-wrap">
                  {booking.message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <a
            href={`mailto:${booking.email}?subject=Arabella Events Place - Your Inquiry&body=Hi ${booking.name},%0A%0AThank you for your inquiry about ${booking.event_type}.`}
            className="flex-1 bg-[var(--color-primary)] text-white py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase text-center hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Reply via Email
          </a>
          <a
            href={`tel:${booking.phone}`}
            className="flex-1 border-2 border-[var(--color-primary)] text-[var(--color-primary)] py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase text-center hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            Call Customer
          </a>
        </div>
      </main>
    </div>
  );
}
