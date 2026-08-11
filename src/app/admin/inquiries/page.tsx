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

export default function InquiriesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
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

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter;
    const matchesSearch =
      search === "" ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search);
    const matchesDateFrom =
      dateFrom === "" || new Date(b.created_at) >= new Date(dateFrom);
    const matchesDateTo =
      dateTo === "" || new Date(b.created_at) <= new Date(dateTo + "T23:59:59");

    return matchesFilter && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Event Type",
      "Event Date",
      "Pax",
      "Status",
      "Total Amount",
      "Deposit Paid",
      "Submitted",
    ];

    const rows = filteredBookings.map((b) => [
      b.name,
      b.email,
      b.phone,
      b.event_type,
      b.event_date || "",
      b.pax || "",
      b.status,
      b.total_amount || 0,
      b.deposit_paid ? "Yes" : "No",
      new Date(b.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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

  const statusCounts = {
    all: bookings.length,
    new: bookings.filter((b) => b.status === "new").length,
    contacted: bookings.filter((b) => b.status === "contacted").length,
    quoted: bookings.filter((b) => b.status === "quoted").length,
    pending_deposit: bookings.filter((b) => b.status === "pending_deposit").length,
    deposit_paid: bookings.filter((b) => b.status === "deposit_paid").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
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
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-[var(--color-primary)] hover:underline text-sm"
            >
              Dashboard
            </Link>
            <h1
              className="text-xl font-bold text-[var(--color-dark)]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              All Inquiries
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={exportToCSV}
              className="text-sm bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Export CSV
            </button>
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
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Filters {showFilters ? "▲" : "▼"}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t flex gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={() => {
                  setSearch("");
                  setDateFrom("");
                  setDateTo("");
                  setFilter("all");
                }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(
            [
              "all",
              "new",
              "contacted",
              "quoted",
              "pending_deposit",
              "deposit_paid",
              "confirmed",
              "completed",
              "cancelled",
            ] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
              <span className="ml-1">({statusCounts[s]})</span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredBookings.length} of {bookings.length} inquiries
        </p>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No inquiries found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pax
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        router.push(`/admin/inquiries/${booking.id}`)
                      }
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--color-dark)] text-sm">
                          {booking.name}
                        </p>
                        <p className="text-xs text-gray-500">{booking.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.event_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.event_date
                          ? new Date(booking.event_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.pax || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.total_amount
                          ? `₱${booking.total_amount.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
