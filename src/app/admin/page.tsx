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
  notes: string | null;
  deposit_amount: number;
  total_amount: number;
  last_contacted_at: string | null;
  deposit_paid: boolean;
  final_paid: boolean;
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
    quoted: bookings.filter((b) => b.status === "quoted").length,
    pendingDeposit: bookings.filter((b) => b.status === "pending_deposit").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
    depositsReceived: bookings.reduce((sum, b) => sum + (b.deposit_amount || 0), 0),
    upcomingEvents: bookings.filter(
      (b) =>
        b.event_date &&
        new Date(b.event_date) >= new Date() &&
        b.status !== "cancelled"
    ).length,
  };

  const recentBookings = bookings.slice(0, 5);

  const urgentInquiries = bookings.filter(
    (b) =>
      b.status === "new" &&
      new Date(b.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-700",
      contacted: "bg-yellow-100 text-yellow-700",
      quoted: "bg-purple-100 text-purple-700",
      pending_deposit: "bg-orange-100 text-orange-700",
      deposit_paid: "bg-green-100 text-green-700",
      confirmed: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
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
        {/* Urgent Alert */}
        {urgentInquiries.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-red-600 font-bold">!</span>
            <p className="text-red-700 text-sm">
              <strong>{urgentInquiries.length} inquiry(s)</strong> haven&apos;t been responded to in over 24 hours.
            </p>
            <Link
              href="/admin/inquiries"
              className="ml-auto text-red-700 text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Inquiries", value: stats.total, color: "text-[var(--color-dark)]" },
            { label: "New", value: stats.new, color: "text-blue-600" },
            { label: "Pending Deposit", value: stats.pendingDeposit, color: "text-orange-600" },
            { label: "Confirmed", value: stats.confirmed, color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6">
            <p className="text-sm text-gray-500 mb-1">Total Revenue (Quoted)</p>
            <p className="text-3xl font-bold text-[var(--color-dark)]">
              ₱{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6">
            <p className="text-sm text-gray-500 mb-1">Deposits Received</p>
            <p className="text-3xl font-bold text-green-600">
              ₱{stats.depositsReceived.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6">
            <p className="text-sm text-gray-500 mb-1">Upcoming Events</p>
            <p className="text-3xl font-bold text-[var(--color-primary)]">
              {stats.upcomingEvents}
            </p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2
            className="text-lg font-bold text-[var(--color-dark)] mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Pipeline Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "New", value: stats.new, status: "new" },
              { label: "Contacted", value: stats.contacted, status: "contacted" },
              { label: "Quoted", value: stats.quoted, status: "quoted" },
              { label: "Pending Deposit", value: stats.pendingDeposit, status: "pending_deposit" },
              { label: "Deposit Paid", value: stats.depositsReceived > 0 ? stats.confirmed : 0, status: "deposit_paid" },
              { label: "Confirmed", value: stats.confirmed, status: "confirmed" },
              { label: "Completed", value: stats.completed, status: "completed" },
              { label: "Cancelled", value: stats.cancelled, status: "cancelled" },
            ].map((item) => (
              <div key={item.status} className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xl font-bold text-[var(--color-dark)]">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  No inquiries yet.
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/inquiries/${booking.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[var(--color-dark)] text-sm">
                          {booking.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.event_type}
                          {booking.event_date
                            ? ` - ${new Date(booking.event_date).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-6 border-b">
              <h2
                className="text-lg font-bold text-[var(--color-dark)]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Upcoming Events
              </h2>
            </div>
            <div className="divide-y">
              {bookings
                .filter(
                  (b) =>
                    b.event_date &&
                    new Date(b.event_date) >= new Date() &&
                    b.status !== "cancelled"
                )
                .sort(
                  (a, b) =>
                    new Date(a.event_date!).getTime() -
                    new Date(b.event_date!).getTime()
                )
                .slice(0, 5)
                .map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/inquiries/${booking.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[var(--color-dark)] text-sm">
                          {booking.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.event_type} - {booking.pax} pax
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[var(--color-dark)]">
                          {new Date(booking.event_date!).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.event_date!).toLocaleDateString(
                            "en-US",
                            { weekday: "short" }
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              {bookings.filter(
                (b) =>
                  b.event_date &&
                  new Date(b.event_date) >= new Date() &&
                  b.status !== "cancelled"
              ).length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No upcoming events.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
