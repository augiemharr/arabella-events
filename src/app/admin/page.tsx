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
    pendingDeposit: bookings.filter((b) => b.status === "pending_deposit").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
    depositsReceived: bookings.reduce((sum, b) => sum + (b.deposit_amount || 0), 0),
    upcomingEvents: bookings.filter(
      (b) =>
        b.event_date &&
        new Date(b.event_date) >= new Date() &&
        b.status !== "cancelled"
    ).length,
  };

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
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1
            className="text-lg font-bold text-[var(--color-dark)]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Arabella Admin
          </h1>
          <div className="flex items-center gap-6">
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

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Urgent Alert */}
        {urgentInquiries.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center justify-between">
            <p className="text-red-700 text-sm">
              <strong>{urgentInquiries.length}</strong> inquiry(s) unanswered for 24+ hours
            </p>
            <Link
              href="/admin/inquiries"
              className="text-red-700 text-sm font-medium hover:underline"
            >
              View
            </Link>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-[var(--color-dark)]">{stats.total}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Inquiries</p>
          </div>
          <div className="bg-white rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">New</p>
          </div>
          <div className="bg-white rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-orange-500">{stats.pendingDeposit}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Awaiting Deposit</p>
          </div>
          <div className="bg-white rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Confirmed</p>
          </div>
        </div>

        {/* Revenue Row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Quoted</p>
            <p className="text-2xl font-bold text-[var(--color-dark)] mt-1">
              ₱{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Deposits</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ₱{stats.depositsReceived.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Upcoming Events</p>
            <p className="text-2xl font-bold text-[var(--color-primary)] mt-1">
              {stats.upcomingEvents}
            </p>
          </div>
        </div>

        {/* Two Columns */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Inquiries */}
          <div className="bg-white rounded-xl">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2
                className="font-bold text-[var(--color-dark)]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Recent Inquiries
              </h2>
              <Link
                href="/admin/inquiries"
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="divide-y">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No inquiries yet
                </div>
              ) : (
                bookings.slice(0, 5).map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/inquiries/${booking.id}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm text-[var(--color-dark)]">
                        {booking.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.event_type}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-1 rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl">
            <div className="px-6 py-4 border-b">
              <h2
                className="font-bold text-[var(--color-dark)]"
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
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm text-[var(--color-dark)]">
                        {booking.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.event_type} · {booking.pax} pax
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-dark)]">
                      {new Date(booking.event_date!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </Link>
                ))}
              {bookings.filter(
                (b) =>
                  b.event_date &&
                  new Date(b.event_date) >= new Date() &&
                  b.status !== "cancelled"
              ).length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No upcoming events
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
