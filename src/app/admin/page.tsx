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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getBookingsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookings.filter((b) => b.event_date === dateStr);
  };

  const navigateMonth = (direction: number) => {
    if (direction === -1) {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const stats = {
    total: bookings.length,
    new: bookings.filter((b) => b.status === "new").length,
    pendingDeposit: bookings.filter((b) => b.status === "pending_deposit").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
    depositsReceived: bookings.reduce((sum, b) => sum + (b.deposit_amount || 0), 0),
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <h1
            className="text-base font-semibold text-gray-900 tracking-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Arabella Admin
          </h1>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
            >
              Site
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-px bg-gray-100 rounded-lg overflow-hidden mb-12">
          {[
            { label: "Total", value: stats.total },
            { label: "New", value: stats.new, accent: true },
            { label: "Awaiting Deposit", value: stats.pendingDeposit },
            { label: "Confirmed", value: stats.confirmed },
            { label: "Revenue", value: `₱${stats.totalRevenue.toLocaleString()}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-5">
              <p className={`text-2xl font-semibold ${stat.accent ? "text-blue-600" : "text-gray-900"}`}>
                {stat.value}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-10">
          {/* Calendar */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-sm"
                >
                  &larr;
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-sm"
                >
                  &rarr;
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-[10px] font-medium text-gray-400 uppercase tracking-widest"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const dayBookings = day ? getBookingsForDate(day) : [];
                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear();

                  return (
                    <div
                      key={index}
                      className={`min-h-[90px] p-2 border-b border-r border-gray-50 ${
                        day ? "hover:bg-gray-50 transition-colors" : ""
                      }`}
                    >
                      {day && (
                        <>
                          <span
                            className={`text-xs font-medium ${
                              isToday
                                ? "bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center"
                                : "text-gray-500"
                            }`}
                          >
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {dayBookings.slice(0, 2).map((booking) => (
                              <Link
                                key={booking.id}
                                href={`/admin/inquiries/${booking.id}`}
                                className={`block text-[10px] px-1.5 py-0.5 rounded truncate ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {booking.name}
                              </Link>
                            ))}
                            {dayBookings.length > 2 && (
                              <span className="text-[10px] text-gray-400">
                                +{dayBookings.length - 2} more
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-blue-100" />
                Pending
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-green-100" />
                Confirmed
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-red-100" />
                Cancelled
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Events */}
            <div>
              <h2
                className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider"
              >
                Upcoming
              </h2>
              <div className="space-y-0">
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
                  .slice(0, 6)
                  .map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/admin/inquiries/${booking.id}`}
                      className="flex items-center gap-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors -mx-2 px-2 rounded"
                    >
                      <div className="w-10 text-center">
                        <p className="text-[10px] text-gray-400 uppercase">
                          {new Date(booking.event_date!).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(booking.event_date!).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {booking.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {booking.event_type} · {booking.pax || "-"} pax
                        </p>
                      </div>
                    </Link>
                  ))}
                {bookings.filter(
                  (b) =>
                    b.event_date &&
                    new Date(b.event_date) >= new Date() &&
                    b.status !== "cancelled"
                ).length === 0 && (
                  <p className="text-sm text-gray-300 py-4">No upcoming events</p>
                )}
              </div>
            </div>

            {/* Recent Inquiries */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-sm font-semibold text-gray-900 uppercase tracking-wider"
                >
                  Recent
                </h2>
                <Link
                  href="/admin/inquiries"
                  className="text-[10px] text-gray-400 hover:text-gray-600 uppercase tracking-wider"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-0">
                {bookings.slice(0, 5).map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/inquiries/${booking.id}`}
                    className="flex items-center justify-between py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors -mx-2 px-2 rounded"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.event_type}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        booking.status === "new"
                          ? "bg-blue-100 text-blue-600"
                          : booking.status === "confirmed"
                          ? "bg-green-100 text-green-600"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </Link>
                ))}
                {bookings.length === 0 && (
                  <p className="text-sm text-gray-300 py-4">No inquiries yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
