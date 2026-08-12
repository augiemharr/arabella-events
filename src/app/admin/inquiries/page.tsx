"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth, useBookings } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/AdminHeader";
import NewBookingModal from "@/components/NewBookingModal";

const STATUS_OPTIONS = [
  "new", "contacted", "quoted", "pending_deposit", "deposit_paid", "confirmed", "completed", "cancelled"
];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  quoted: "bg-purple-100 text-purple-700",
  pending_deposit: "bg-orange-100 text-orange-700",
  deposit_paid: "bg-green-100 text-green-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

export default function InquiriesPage() {
  const router = useRouter();
  const { loading: authLoading, logout } = useAdminAuth();
  const { bookings, loading: bookingsLoading, error, updateBooking, addBooking } = useBookings();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const dropdownRef = useRef<HTMLTableCellElement>(null);

  const loading = authLoading || bookingsLoading;

  const updateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (!updateError) {
      updateBooking(bookingId, { status: newStatus });
    }
    setUpdatingId(null);
    setActiveDropdown(null);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter;
    const matchesSearch =
      search === "" ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Event", "Date", "Pax", "Status", "Amount"];
    const rows = filteredBookings.map((b) => [
      b.name, b.email, b.phone, b.event_type, b.event_date || "",
      b.pax || "", b.status, b.total_amount || 0,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
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
      <AdminHeader
        title="Inquiries"
        backHref="/admin"
        rightItems={[
          { label: "Export", onClick: exportToCSV },
          { label: "New Booking", onClick: () => setShowNewBooking(true) },
          { label: "Site", href: "/" },
          { label: "Logout", onClick: logout },
        ]}
      />

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            Error loading bookings: {error}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition placeholder-gray-300"
          />
        </div>

        <div className="flex gap-1 mb-6 border-b border-gray-100 overflow-x-auto">
          {(["all", "new", "contacted", "quoted", "pending_deposit", "confirmed", "completed", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                filter === s ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
              <span className="ml-1 text-gray-300">{statusCounts[s]}</span>
            </button>
          ))}
        </div>

        <div>
          {filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-gray-300 text-sm">No inquiries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="text-left py-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest hidden sm:table-cell">Event</th>
                    <th className="text-left py-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest hidden md:table-cell">Date</th>
                    <th className="text-left py-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest hidden lg:table-cell">Pax</th>
                    <th className="text-left py-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                      <td
                        className="py-3 cursor-pointer"
                        onClick={() => router.push(`/admin/inquiries/${booking.id}`)}
                      >
                        <p className="text-sm font-medium text-gray-900">{booking.name}</p>
                        <p className="text-xs text-gray-400">{booking.email}</p>
                      </td>
                      <td
                        className="py-3 text-sm text-gray-600 cursor-pointer hidden sm:table-cell"
                        onClick={() => router.push(`/admin/inquiries/${booking.id}`)}
                      >
                        {booking.event_type}
                      </td>
                      <td
                        className="py-3 text-sm text-gray-600 cursor-pointer hidden md:table-cell"
                        onClick={() => router.push(`/admin/inquiries/${booking.id}`)}
                      >
                        {booking.event_date
                          ? new Date(booking.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "-"}
                      </td>
                      <td
                        className="py-3 text-sm text-gray-600 cursor-pointer hidden lg:table-cell"
                        onClick={() => router.push(`/admin/inquiries/${booking.id}`)}
                      >
                        {booking.pax || "-"}
                      </td>
                      <td className="py-3 relative" ref={activeDropdown === booking.id ? dropdownRef : undefined}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === booking.id ? null : booking.id);
                          }}
                          disabled={updatingId === booking.id}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors hover:opacity-80 ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-600"} ${updatingId === booking.id ? "opacity-50" : ""}`}
                        >
                          {updatingId === booking.id ? "..." : booking.status.replace("_", " ")}
                        </button>

                        {activeDropdown === booking.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                            {STATUS_OPTIONS.map((s) => (
                              <button
                                key={s}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus(booking.id, s);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                                  booking.status === s ? "font-medium text-gray-900" : "text-gray-600"
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[s]?.split(" ")[0] || "bg-gray-100"}`} />
                                {s.replace("_", " ")}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
