"use client";

import { useEffect, useState } from "react";
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

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/admin/login");
        return;
      }

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      setBookings(bookingsData || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const stats = {
    total: bookings.length,
    new: bookings.filter((b) => b.status === "new").length,
    contacted: bookings.filter((b) => b.status === "contacted").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  const recentBookings = bookings.slice(0, 5);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
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
          <div>
            <h1
              className="text-xl font-bold text-[var(--color-dark)]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Arabella Admin
            </h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-[var(--color-dark)]" },
            { label: "New", value: stats.new, color: "text-blue-600" },
            { label: "Contacted", value: stats.contacted, color: "text-yellow-600" },
            { label: "Confirmed", value: stats.confirmed, color: "text-green-600" },
            { label: "Completed", value: stats.completed, color: "text-gray-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2
              className="text-lg font-bold text-[var(--color-dark)]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Recent Inquiries
            </h2>
            <Link
              href="/admin/inquiries"
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No inquiries yet. They will appear here when customers submit the booking form.
              </div>
            ) : (
              recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/inquiries/${booking.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[var(--color-dark)]">
                        {booking.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.event_type} {booking.event_date ? `- ${new Date(booking.event_date).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        booking.status === "new"
                          ? "bg-blue-100 text-blue-700"
                          : booking.status === "contacted"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
