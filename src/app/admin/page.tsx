"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminAuth, useBookings } from "@/hooks/useAdmin";
import AdminHeader from "@/components/AdminHeader";
import NewBookingModal from "@/components/NewBookingModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const EVENT_COLOR: Record<string, string> = {
  Wedding: "bg-gray-600",
  "Birthday Party": "bg-gray-500",
  "Corporate Event": "bg-gray-700",
  "Family Gathering": "bg-gray-500",
  Christening: "bg-gray-400",
  Debut: "bg-gray-500",
  Other: "bg-gray-400",
};

const STATUS_BADGE: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  contacted: "bg-gray-200 text-gray-700",
  quoted: "bg-gray-200 text-gray-800",
  pending_deposit: "bg-gray-200 text-gray-800",
  deposit_paid: "bg-gray-200 text-gray-800",
  confirmed: "bg-gray-300 text-gray-800",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-gray-100 text-gray-400",
};

function daysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function relativeTime(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const { loading: authLoading, logout } = useAdminAuth();
  const { bookings, loading: bookingsLoading, error, addBooking } = useBookings();
  const [showNewBooking, setShowNewBooking] = useState(false);

  const loading = authLoading || bookingsLoading;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const activeBookings = bookings.filter((b) => b.status !== "cancelled" && b.status !== "completed");
  const totalRevenue = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.total_amount || 0), 0);
  const collectedDeposits = bookings.filter((b) => b.deposit_paid).reduce((s, b) => s + (b.deposit_amount || 0), 0);

  const thisWeekEnd = new Date(now);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);
  const thisWeekStr = thisWeekEnd.toISOString().slice(0, 10);

  const upcomingThisWeek = bookings
    .filter((b) => b.event_date && b.event_date >= today && b.event_date <= thisWeekStr && b.status !== "cancelled")
    .sort((a, b) => a.event_date!.localeCompare(b.event_date!));

  const upcomingAll = bookings
    .filter((b) => b.event_date && b.event_date > thisWeekStr && b.status !== "cancelled")
    .sort((a, b) => a.event_date!.localeCompare(b.event_date!))
    .slice(0, 5);

  const actionRequired = bookings
    .filter((b) => b.status === "new" || b.status === "pending_deposit")
    .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""))
    .slice(0, 8);

  const recentInquiries = bookings
    .filter((b) => b.status === "new")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const statusCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-300 flex items-center justify-center">
        <p className="text-gray-400 text-xs">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300">
      <AdminHeader
        title="Arabella Admin"
        rightItems={[
          { label: "Site", href: "/" },
          { label: "Gallery", href: "/admin/gallery" },
          { label: "Inquiries", href: "/admin/inquiries" },
          { label: "Logout", onClick: logout },
        ]}
      />

      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-3">
          <div className="p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Active Events</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{activeBookings.length}</p>
          </div>
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">New Leads</p>
            <p className="text-2xl font-bold text-gray-700 mt-0.5">{statusCounts["new"] || 0}</p>
          </div>
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pending Deposits</p>
            <p className="text-2xl font-bold text-gray-700 mt-0.5">{statusCounts["pending_deposit"] || 0}</p>
          </div>
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">₱{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upcoming Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* This Week */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">This Week</h2>
                <Link href="/admin/inquiries" className="text-[10px] text-gray-400 hover:text-gray-600 uppercase tracking-wider">View all</Link>
              </div>
              {upcomingThisWeek.length === 0 ? (
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-300">No events this week</p>
                  <p className="text-[10px] text-gray-300 mt-1">Enjoy the downtime</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingThisWeek.map((b) => {
                    const diff = daysUntil(b.event_date!);
                    return (
                      <Link
                        key={b.id}
                        href={`/admin/inquiries/${b.id}`}
                        className="flex items-center gap-4 bg-white border border-gray-300 rounded-lg shadow-sm p-3 hover:border-gray-300 transition"
                      >
                        <div className="w-12 text-center flex-shrink-0">
                          <p className="text-[9px] text-gray-400 uppercase">
                            {new Date(b.event_date!).toLocaleDateString("en-US", { weekday: "short" })}
                          </p>
                          <p className="text-lg font-bold text-gray-900 leading-tight">
                            {new Date(b.event_date!).getDate()}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{b.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${EVENT_COLOR[b.event_type] || "bg-gray-400"}`} />
                            <span className="text-[11px] text-gray-400">{b.event_type}</span>
                            {b.pax && <span className="text-[11px] text-gray-400">· {b.pax} pax</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {b.total_amount > 0 && (
                            <p className="text-xs font-semibold text-gray-700">₱{b.total_amount.toLocaleString()}</p>
                          )}
                          <p className={`text-[10px] font-medium ${diff <= 2 ? "text-gray-900" : diff <= 5 ? "text-gray-600" : "text-gray-400"}`}>
                            {diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `${diff} days`}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Upcoming After This Week */}
            {upcomingAll.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Coming Up</h2>
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm divide-y divide-gray-100">
                  {upcomingAll.map((b) => (
                    <Link
                      key={b.id}
                      href={`/admin/inquiries/${b.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition"
                    >
                      <div className="w-10 text-center flex-shrink-0">
                        <p className="text-[8px] text-gray-400 uppercase">
                          {new Date(b.event_date!).toLocaleDateString("en-US", { month: "short" })}
                        </p>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          {new Date(b.event_date!).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{b.name}</p>
                        <span className="text-[10px] text-gray-400">{b.event_type}</span>
                      </div>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${STATUS_BADGE[b.status] || "bg-gray-100 text-gray-600"}`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Calendar */}
            <Calendar bookings={bookings} />
          </div>

          {/* Right: Actions + Financials */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewBooking(true)}
                className="flex-1 py-2.5 px-3 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition"
              >
                + New Booking
              </button>
              <Link
                href="/admin/inquiries"
                className="flex-1 py-2.5 px-3 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg text-center hover:bg-gray-50 transition"
              >
                All Inquiries
              </Link>
            </div>

            {/* Action Required */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Action Required</h2>
              {actionRequired.length === 0 ? (
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-300">All caught up</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm divide-y divide-gray-100">
                  {actionRequired.map((b) => (
                    <Link
                      key={b.id}
                      href={`/admin/inquiries/${b.id}`}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{b.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {b.status === "new" ? "New inquiry" : "Deposit pending"}
                          {b.last_contacted_at && ` · ${relativeTime(b.last_contacted_at)}`}
                        </p>
                      </div>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${STATUS_BADGE[b.status] || "bg-gray-100 text-gray-600"}`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Inquiries */}
            {recentInquiries.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">New Inquiries</h2>
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm divide-y divide-gray-100">
                  {recentInquiries.map((b) => (
                    <Link
                      key={b.id}
                      href={`/admin/inquiries/${b.id}`}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{b.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{b.event_type} · {relativeTime(b.created_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Revenue Snapshot */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Revenue</h2>
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Quoted</span>
                  <span className="text-xs font-semibold text-gray-900">₱{totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Deposits in</span>
                  <span className="text-xs font-semibold text-gray-800">₱{collectedDeposits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Pending</span>
                  <span className="text-xs font-semibold text-gray-600">
                    ₱{bookings.filter((b) => b.status === "pending_deposit").reduce((s, b) => s + (b.deposit_amount || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-700">Collected</span>
                  <span className="text-sm font-bold text-gray-900">
                    ₱{bookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + (b.total_amount || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showNewBooking && (
        <NewBookingModal
          onClose={() => setShowNewBooking(false)}
          onCreated={(booking) => addBooking(booking)}
        />
      )}
    </div>
  );
}

function Calendar({ bookings }: { bookings: Array<{ id: string; event_date: string | null; name: string; event_type: string }> }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selected, setSelected] = useState<number | null>(null);

  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const getBookings = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookings.filter((b) => b.event_date === dateStr);
  };

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelected(null);
  };

  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelected(null);
  };

  const selectedBookings = selected ? getBookings(selected) : [];

  return (
    <section>
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <h2 className="text-sm font-semibold text-gray-900">{MONTHS[month]} {year}</h2>
          <div className="flex gap-1">
            <button onClick={prev} className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition text-xs">&larr;</button>
            <button onClick={next} className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition text-xs">&rarr;</button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-gray-200">
          {DAYS.map((d, i) => (
            <div key={i} className="py-1.5 text-center text-[9px] font-medium text-gray-400 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-t border-gray-200">
          {cells.map((day, idx) => {
            const dayBookings = day ? getBookings(day) : [];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = day === selected;
            return (
              <div
                key={idx}
                onClick={() => day && setSelected(day)}
                className={`min-h-[3rem] p-1 border-b border-r border-gray-100 ${day ? "cursor-pointer hover:bg-gray-50" : ""} ${isSelected ? "bg-gray-50" : ""}`}
              >
                {day && (
                  <>
                    <span className={`text-[10px] font-medium ${isToday ? "bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center" : "text-gray-500"}`}>
                      {day}
                    </span>
                    {dayBookings.length > 0 && (
                      <div className="mt-0.5 flex gap-0.5">
                        {dayBookings.slice(0, 3).map((b, i) => (
                          <span key={i} className={`w-1.5 h-1.5 rounded-full ${EVENT_COLOR[b.event_type] || "bg-gray-400"}`} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="px-3 pb-3 pt-2 border-t border-gray-200">
            <p className="text-[10px] text-gray-400 uppercase mb-1.5">
              {MONTHS[month]} {selected}, {year}
            </p>
            {selectedBookings.length === 0 ? (
              <p className="text-[11px] text-gray-300">No events</p>
            ) : (
              <div className="space-y-1">
                {selectedBookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/inquiries/${b.id}`}
                    className="flex items-center gap-2 py-1"
                  >
                    <span className={`w-2 h-2 rounded-full ${EVENT_COLOR[b.event_type] || "bg-gray-400"}`} />
                    <span className="text-xs text-gray-700 truncate">{b.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
