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
  status: string;
  total_amount: number;
  created_at: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
  Wedding: { bg: "bg-pink-100", dot: "bg-pink-500", text: "text-pink-700" },
  "Birthday Party": { bg: "bg-blue-100", dot: "bg-blue-500", text: "text-blue-700" },
  "Corporate Event": { bg: "bg-slate-100", dot: "bg-slate-500", text: "text-slate-700" },
  "Family Gathering": { bg: "bg-amber-100", dot: "bg-amber-500", text: "text-amber-700" },
  Christening: { bg: "bg-violet-100", dot: "bg-violet-500", text: "text-violet-700" },
  Debut: { bg: "bg-rose-100", dot: "bg-rose-500", text: "text-rose-700" },
  Other: { bg: "bg-gray-100", dot: "bg-gray-500", text: "text-gray-700" },
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
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

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

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
    setSelectedDate(null);
  };

  const stats = {
    total: bookings.length,
    new: bookings.filter((b) => b.status === "new").length,
    pendingDeposit: bookings.filter((b) => b.status === "pending_deposit").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  const getEventColor = (eventType: string) => {
    return EVENT_COLORS[eventType] || EVENT_COLORS["Other"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-base font-semibold text-gray-900" style={{ fontFamily: "var(--font-playfair)" }}>
            Arabella Admin
          </h1>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">Site</Link>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="flex gap-6 mb-10">
          {[
            { label: "Inquiries", value: stats.total, color: "text-gray-900" },
            { label: "New", value: stats.new, color: "text-blue-500" },
            { label: "Pending", value: stats.pendingDeposit, color: "text-amber-500" },
            { label: "Confirmed", value: stats.confirmed, color: "text-green-500" },
            { label: "Revenue", value: `₱${stats.totalRevenue.toLocaleString()}`, color: "text-gray-900" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1">
              <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-10">
          {/* Calendar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900" style={{ fontFamily: "var(--font-playfair)" }}>
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <div className="flex gap-1">
                <button onClick={() => navigateMonth(-1)} className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-xs">&larr;</button>
                <button onClick={() => navigateMonth(1)} className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-xs">&rarr;</button>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map((day) => (
                  <div key={day} className="py-2 text-center text-[10px] font-medium text-gray-400">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const dayBookings = day ? getBookingsForDate(day) : [];
                  const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                  const isSelected = day === selectedDate;

                  return (
                    <div
                      key={index}
                      onClick={() => day && setSelectedDate(day)}
                      className={`relative min-h-[4.5rem] p-1.5 border-b border-r border-gray-50 transition-colors ${
                        day ? "cursor-pointer hover:bg-gray-50" : ""
                      } ${isSelected ? "bg-gray-100" : ""}`}
                    >
                      {day && (
                        <>
                          <span className={`text-xs ${isToday ? "bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center font-medium" : "text-gray-600"}`}>
                            {day}
                          </span>
                          {dayBookings.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {dayBookings.slice(0, 3).map((b) => {
                                const colors = getEventColor(b.event_type);
                                return (
                                  <div key={b.id} className={`flex items-center gap-1 px-1 py-0.5 rounded ${colors.bg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                                    <span className={`text-[8px] truncate font-medium ${colors.text}`}>{b.name.split(" ")[0]}</span>
                                  </div>
                                );
                              })}
                              {dayBookings.length > 3 && (
                                <span className="text-[8px] text-gray-400 pl-1">+{dayBookings.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event Type Legend */}
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(EVENT_COLORS).filter(([key]) => key !== "Other").map(([type, colors]) => (
                <div key={type} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  {type}
                </div>
              ))}
            </div>

            {/* Selected Date - Availability */}
            {selectedDate && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {MONTHS[currentMonth]} {selectedDate}, {currentYear}
                  </h3>
                  {selectedBookings.length === 0 ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Available
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {selectedBookings.length} Booking{selectedBookings.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {selectedBookings.length === 0 ? (
                  <div className="py-6 text-center border border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">No events on this date</p>
                    <Link
                      href="/contact"
                      className="text-xs text-gray-900 font-medium hover:underline"
                    >
                      + Create booking
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedBookings.map((booking) => {
                      const colors = getEventColor(booking.event_type);
                      return (
                        <Link
                          key={booking.id}
                          href={`/admin/inquiries/${booking.id}`}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:border-gray-300 ${
                            booking.status === "cancelled"
                              ? "border-red-200 bg-red-50"
                              : booking.status === "confirmed"
                              ? "border-green-200 bg-green-50"
                              : "border-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}>
                              <span className={`text-xs font-bold ${colors.text}`}>
                                {booking.event_type.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{booking.name}</p>
                              <p className="text-xs text-gray-400">
                                {booking.event_type} · {booking.pax || "-"} pax
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {booking.status.replace("_", " ")}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-64 space-y-8">
            <div>
              <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">Upcoming</h2>
              <div className="space-y-0">
                {bookings
                  .filter((b) => b.event_date && new Date(b.event_date) >= new Date() && b.status !== "cancelled")
                  .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime())
                  .slice(0, 5)
                  .map((booking) => {
                    const colors = getEventColor(booking.event_type);
                    return (
                      <Link
                        key={booking.id}
                        href={`/admin/inquiries/${booking.id}`}
                        className="flex items-center gap-3 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors -mx-2 px-2 rounded"
                      >
                        <div className="w-9 text-center">
                          <p className="text-[9px] text-gray-400 uppercase">{new Date(booking.event_date!).toLocaleDateString("en-US", { month: "short" })}</p>
                          <p className="text-sm font-semibold text-gray-900">{new Date(booking.event_date!).getDate()}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{booking.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            <p className="text-xs text-gray-400 truncate">{booking.event_type}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                {bookings.filter((b) => b.event_date && new Date(b.event_date) >= new Date() && b.status !== "cancelled").length === 0 && (
                  <p className="text-xs text-gray-300 py-3">No upcoming events</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Recent</h2>
                <Link href="/admin/inquiries" className="text-[10px] text-gray-400 hover:text-gray-600 uppercase tracking-wider">All</Link>
              </div>
              <div className="space-y-0">
                {bookings.slice(0, 4).map((booking) => {
                  const colors = getEventColor(booking.event_type);
                  return (
                    <Link
                      key={booking.id}
                      href={`/admin/inquiries/${booking.id}`}
                      className="flex items-center justify-between py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors -mx-2 px-2 rounded"
                    >
                      <p className="text-sm text-gray-900 truncate">{booking.name}</p>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
                    </Link>
                  );
                })}
                {bookings.length === 0 && <p className="text-xs text-gray-300 py-3">No inquiries yet</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
