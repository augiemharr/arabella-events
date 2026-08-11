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
    return matchesFilter && matchesSearch;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const exportToCSV = () => {
    const headers = [
      "Name", "Email", "Phone", "Event Type", "Event Date", "Pax",
      "Status", "Total Amount", "Deposit Paid", "Submitted",
    ];

    const rows = filteredBookings.map((b) => [
      b.name, b.email, b.phone, b.event_type, b.event_date || "",
      b.pax || "", b.status, b.total_amount || 0,
      b.deposit_paid ? "Yes" : "No", new Date(b.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const statusCounts = {
    all: bookings.length,
    new: bookings.filter((b) => b.status === "new").length,
    contacted: bookings.filter((b) => b.status === "contacted").length,
    quoted: bookings.filter((b) => b.status === "quoted").length,
    pending_deposit: bookings.filter((b) => b.status === "pending_deposit").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
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
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
            >
              Dashboard
            </Link>
            <h1
              className="text-base font-semibold text-gray-900"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Inquiries
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={exportToCSV}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
            >
              Export
            </button>
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
        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition placeholder-gray-300"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-100">
          {(
            [
              "all", "new", "contacted", "quoted", "pending_deposit",
              "confirmed", "completed", "cancelled",
            ] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                filter === s
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
              <span className="ml-1.5 text-gray-300">{statusCounts[s]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div>
          {filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-gray-300 text-sm">
              No inquiries found
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    Name
                  </th>
                  <th className="text-left py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    Event
                  </th>
                  <th className="text-left py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="text-left py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    Pax
                  </th>
                  <th className="text-left py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    Amount
                  </th>
                  <th className="text-left py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="text-left py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/inquiries/${booking.id}`)}
                  >
                    <td className="py-4">
                      <p className="text-sm font-medium text-gray-900">{booking.name}</p>
                      <p className="text-xs text-gray-400">{booking.email}</p>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{booking.event_type}</td>
                    <td className="py-4 text-sm text-gray-600">
                      {booking.event_date
                        ? new Date(booking.event_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="py-4 text-sm text-gray-600">{booking.pax || "-"}</td>
                    <td className="py-4 text-sm text-gray-600">
                      {booking.total_amount
                        ? `₱${booking.total_amount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="py-4">
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
                    </td>
                    <td className="py-4 text-xs text-gray-400">
                      {new Date(booking.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
