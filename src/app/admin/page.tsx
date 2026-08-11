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

const EVENT_COLORS: Record<string, { dot: string; text: string }> = {
  Wedding: { dot: "#ec4899", text: "#be185d" },
  "Birthday Party": { dot: "#3b82f6", text: "#1d4ed8" },
  "Corporate Event": { dot: "#64748b", text: "#334155" },
  "Family Gathering": { dot: "#f59e0b", text: "#b45309" },
  Christening: { dot: "#8b5cf6", text: "#6d28d9" },
  Debut: { dot: "#f43f5e", text: "#e11d48" },
  Other: { dot: "#6b7280", text: "#374151" },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  new: { bg: "#dbeafe", color: "#1d4ed8" },
  contacted: { bg: "#fef3c7", color: "#b45309" },
  quoted: { bg: "#ede9fe", color: "#6d28d9" },
  pending_deposit: { bg: "#ffedd5", color: "#c2410c" },
  deposit_paid: { bg: "#dcfce7", color: "#15803d" },
  confirmed: { bg: "#dcfce7", color: "#15803d" },
  completed: { bg: "#f3f4f6", color: "#4b5563" },
  cancelled: { bg: "#fee2e2", color: "#dc2626" },
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

  const getBookingsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookings.filter((b) => b.event_date === dateStr);
  };

  const navigateMonth = (direction: number) => {
    if (direction === -1) {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
      else setCurrentMonth(currentMonth - 1);
    } else {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
      else setCurrentMonth(currentMonth + 1);
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

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  const upcomingBookings = bookings
    .filter((b) => b.event_date && new Date(b.event_date) >= new Date() && b.status !== "cancelled")
    .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime())
    .slice(0, 5);

  const recentBookings = bookings.slice(0, 5);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", fontFamily: "var(--font-playfair)" }}>
            Arabella Admin
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Link href="/" style={{ fontSize: "12px", color: "#9ca3af", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em" }}>Site</Link>
            <button onClick={handleLogout} style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", background: "none", border: "none", cursor: "pointer" }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px", marginBottom: "40px" }}>
          {[
            { label: "Inquiries", value: stats.total, valueColor: "#111827", accent: "#111827" },
            { label: "New", value: stats.new, valueColor: "#2563eb", accent: "#3b82f6" },
            { label: "Pending", value: stats.pendingDeposit, valueColor: "#d97706", accent: "#f59e0b" },
            { label: "Confirmed", value: stats.confirmed, valueColor: "#16a34a", accent: "#22c55e" },
            { label: "Revenue", value: `₱${stats.totalRevenue.toLocaleString()}`, valueColor: "#111827", accent: "#111827" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderLeft: `3px solid ${stat.accent}`,
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "24px", fontWeight: 700, color: stat.valueColor, margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px", margin: "4px 0 0 0" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "32px" }}>
          {/* Calendar */}
          <div style={{ flex: 1 }}>
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", fontFamily: "var(--font-playfair)", margin: 0 }}>
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => navigateMonth(-1)} style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "#ffffff", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>&larr;</button>
                  <button onClick={() => navigateMonth(1)} style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "#ffffff", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>&rarr;</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #e5e7eb" }}>
                {DAYS.map((day) => (
                  <div key={day} style={{ padding: "10px 0", textAlign: "center", fontSize: "10px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>{day}</div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {calendarDays.map((day, index) => {
                  const dayBookings = day ? getBookingsForDate(day) : [];
                  const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                  const isSelected = day === selectedDate;
                  return (
                    <div
                      key={index}
                      onClick={() => day && setSelectedDate(day)}
                      style={{
                        position: "relative",
                        height: "80px",
                        padding: "8px",
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #e5e7eb",
                        cursor: day ? "pointer" : "default",
                        background: isSelected ? "#f3f4f6" : "transparent",
                      }}
                    >
                      {day && (
                        <>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: isToday ? "#ffffff" : "#6b7280",
                            background: isToday ? "#111827" : "transparent",
                            width: isToday ? "24px" : "auto",
                            height: isToday ? "24px" : "auto",
                            borderRadius: isToday ? "50%" : "0",
                            display: isToday ? "inline-flex" : "inline",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            {day}
                          </span>
                          {dayBookings.length > 0 && (
                            <div style={{ position: "absolute", bottom: "8px", left: "8px", display: "flex", gap: "4px" }}>
                              {dayBookings.slice(0, 4).map((b) => (
                                <span key={b.id} style={{ width: "8px", height: "8px", borderRadius: "50%", background: EVENT_COLORS[b.event_type]?.dot || "#6b7280" }} />
                              ))}
                              {dayBookings.length > 4 && (
                                <span style={{ fontSize: "8px", color: "#9ca3af", fontWeight: 500 }}>+{dayBookings.length - 4}</span>
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

            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "16px", paddingLeft: "4px" }}>
              {Object.entries(EVENT_COLORS).filter(([key]) => key !== "Other").map(([type, colors]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", color: "#6b7280" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors.dot }} />
                  {type}
                </div>
              ))}
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px", marginTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{selectedDate}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>
                        {MONTHS[currentMonth]} {selectedDate}, {currentYear}
                      </h3>
                      <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px", margin: "2px 0 0 0" }}>
                        {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString("en-US", { weekday: "long" })}
                      </p>
                    </div>
                  </div>
                  {selectedBookings.length === 0 ? (
                    <span style={{ fontSize: "10px", fontWeight: 600, padding: "4px 12px", borderRadius: "9999px", background: "#dcfce7", color: "#15803d" }}>Available</span>
                  ) : (
                    <span style={{ fontSize: "10px", fontWeight: 600, padding: "4px 12px", borderRadius: "9999px", background: "#fef3c7", color: "#b45309" }}>
                      {selectedBookings.length} Booking{selectedBookings.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {selectedBookings.length === 0 ? (
                  <div style={{ padding: "32px 0", textAlign: "center", border: "1px dashed #d1d5db", borderRadius: "8px" }}>
                    <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "12px", margin: "0 0 12px 0" }}>No events on this date</p>
                    <Link href="/contact" style={{ fontSize: "12px", color: "#111827", fontWeight: 500, textDecoration: "underline" }}>
                      + Create booking
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {selectedBookings.map((booking) => {
                      const colors = EVENT_COLORS[booking.event_type] || EVENT_COLORS.Other;
                      const statusInfo = STATUS_STYLE[booking.status] || STATUS_STYLE.new;
                      return (
                        <Link
                          key={booking.id}
                          href={`/admin/inquiries/${booking.id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "16px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            textDecoration: "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: "14px", fontWeight: 700, color: colors.text }}>{booking.event_type.charAt(0)}</span>
                            </div>
                            <div>
                              <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827", margin: 0 }}>{booking.name}</p>
                              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px", margin: "2px 0 0 0" }}>
                                {booking.event_type} · {booking.pax || "-"} pax
                              </p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            {booking.total_amount > 0 && (
                              <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: 0 }}>₱{booking.total_amount.toLocaleString()}</p>
                            )}
                            <span style={{ fontSize: "10px", fontWeight: 600, padding: "4px 10px", borderRadius: "9999px", background: statusInfo.bg, color: statusInfo.color }}>
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
          <div style={{ width: "288px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Upcoming */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "11px", fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Upcoming</h2>
                <Link href="/admin/inquiries" style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}>View all</Link>
              </div>
              {upcomingBookings.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#d1d5db", padding: "16px 0", textAlign: "center", margin: 0 }}>No upcoming events</p>
              ) : (
                upcomingBookings.map((booking, index) => {
                  const colors = EVENT_COLORS[booking.event_type] || EVENT_COLORS.Other;
                  const eventDate = new Date(booking.event_date!);
                  return (
                    <Link
                      key={booking.id}
                      href={`/admin/inquiries/${booking.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 0",
                        borderBottom: index < upcomingBookings.length - 1 ? "1px solid #f3f4f6" : "none",
                        textDecoration: "none",
                      }}
                    >
                      <div style={{ width: "40px", textAlign: "center", flexShrink: 0 }}>
                        <p style={{ fontSize: "9px", color: "#9ca3af", textTransform: "uppercase", fontWeight: 500, margin: 0 }}>
                          {eventDate.toLocaleDateString("en-US", { month: "short" })}
                        </p>
                        <p style={{ fontSize: "18px", fontWeight: 700, color: "#111827", lineHeight: 1.2, margin: "2px 0 0 0" }}>
                          {eventDate.getDate()}
                        </p>
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{booking.name}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors.dot, flexShrink: 0 }} />
                          <p style={{ fontSize: "12px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{booking.event_type}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Recent */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "11px", fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Recent Inquiries</h2>
                <Link href="/admin/inquiries" style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}>View all</Link>
              </div>
              {recentBookings.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#d1d5db", padding: "16px 0", textAlign: "center", margin: 0 }}>No inquiries yet</p>
              ) : (
                recentBookings.map((booking, index) => {
                  const colors = EVENT_COLORS[booking.event_type] || EVENT_COLORS.Other;
                  return (
                    <Link
                      key={booking.id}
                      href={`/admin/inquiries/${booking.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 0",
                        borderBottom: index < recentBookings.length - 1 ? "1px solid #f3f4f6" : "none",
                        textDecoration: "none",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{booking.name}</p>
                        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px", margin: "2px 0 0 0" }}>{booking.event_type}</p>
                      </div>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors.dot, flexShrink: 0 }} />
                    </Link>
                  );
                })
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", margin: "0 0 16px 0" }}>Quick Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link
                  href="/admin/inquiries"
                  style={{ display: "block", width: "100%", padding: "10px 16px", background: "#111827", color: "#ffffff", fontSize: "12px", fontWeight: 500, borderRadius: "8px", textAlign: "center", textDecoration: "none" }}
                >
                  View All Inquiries
                </Link>
                <Link
                  href="/contact"
                  style={{ display: "block", width: "100%", padding: "10px 16px", background: "#ffffff", color: "#374151", fontSize: "12px", fontWeight: 500, borderRadius: "8px", textAlign: "center", textDecoration: "none", border: "1px solid #e5e7eb" }}
                >
                  Create New Booking
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
