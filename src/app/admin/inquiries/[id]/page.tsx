"use client";

import { useEffect, useState, use } from "react";
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

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingAmount, setSavingAmount] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/admin/login");
        return;
      }

      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (bookingData) {
        setBooking(bookingData);
        setNotes(bookingData.notes || "");
        setTotalAmount(bookingData.total_amount?.toString() || "");
        setDepositAmount(bookingData.deposit_amount?.toString() || "");
      }
      setLoading(false);
    };

    checkAuth();
  }, [id, router]);

  const updateStatus = async (newStatus: string) => {
    if (!booking) return;
    setUpdating(true);

    const updateData: Record<string, unknown> = { status: newStatus };

    if (newStatus === "contacted" || newStatus === "quoted") {
      updateData.last_contacted_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", booking.id);

    if (!error) {
      setBooking({ ...booking, ...updateData });
    }
    setUpdating(false);
  };

  const saveNotes = async () => {
    if (!booking) return;
    setSavingNotes(true);

    const { error } = await supabase
      .from("bookings")
      .update({ notes })
      .eq("id", booking.id);

    if (!error) {
      setBooking({ ...booking, notes });
    }
    setSavingNotes(false);
  };

  const saveAmounts = async () => {
    if (!booking) return;
    setSavingAmount(true);

    const { error } = await supabase
      .from("bookings")
      .update({
        total_amount: totalAmount ? parseFloat(totalAmount) : 0,
        deposit_amount: depositAmount ? parseFloat(depositAmount) : 0,
      })
      .eq("id", booking.id);

    if (!error) {
      setBooking({
        ...booking,
        total_amount: totalAmount ? parseFloat(totalAmount) : 0,
        deposit_amount: depositAmount ? parseFloat(depositAmount) : 0,
      });
    }
    setSavingAmount(false);
  };

  const toggleDepositPaid = async () => {
    if (!booking) return;

    const newValue = !booking.deposit_paid;
    const { error } = await supabase
      .from("bookings")
      .update({
        deposit_paid: newValue,
        status: newValue ? "deposit_paid" : "pending_deposit",
      })
      .eq("id", booking.id);

    if (!error) {
      setBooking({
        ...booking,
        deposit_paid: newValue,
        status: newValue ? "deposit_paid" : "pending_deposit",
      });
    }
  };

  const handleDelete = async () => {
    if (!booking) return;
    if (!confirm("Are you sure you want to delete this inquiry? This cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", booking.id);

    if (!error) {
      router.push("/admin/inquiries");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

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

  const statusFlow = [
    "new",
    "contacted",
    "quoted",
    "pending_deposit",
    "deposit_paid",
    "confirmed",
    "completed",
  ];

  const currentStatusIndex = statusFlow.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/inquiries"
              className="text-[var(--color-primary)] hover:underline text-sm"
            >
              Back to Inquiries
            </Link>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Name and Status */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1
                className="text-2xl font-bold text-[var(--color-dark)]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {booking.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Submitted {new Date(booking.created_at).toLocaleDateString()} at{" "}
                {new Date(booking.created_at).toLocaleTimeString()}
                {booking.last_contacted_at && (
                  <span className="ml-2">
                    | Last contacted{" "}
                    {new Date(booking.last_contacted_at).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <span
              className={`text-sm font-medium px-3 py-1.5 rounded-full ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status.replace("_", " ")}
            </span>
          </div>

          {/* Status Progress */}
          <div className="mb-6">
            <div className="flex items-center gap-1">
              {statusFlow.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStatusIndex
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < statusFlow.length - 1 && (
                    <div
                      className={`h-1 w-8 ${
                        i < currentStatusIndex
                          ? "bg-[var(--color-primary)]"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {statusFlow.map((s) => (
                <span key={s} className="w-8 text-center">
                  {s.replace("_", " ").slice(0, 3)}
                </span>
              ))}
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex gap-2 flex-wrap">
            {statusFlow.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={updating || booking.status === s}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                  booking.status === s
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={updating || booking.status === "cancelled"}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                booking.status === "cancelled"
                  ? "bg-red-500 text-white"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2
                className="text-lg font-bold text-[var(--color-dark)] mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Contact Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <a
                    href={`mailto:${booking.email}`}
                    className="text-[var(--color-dark)] hover:text-[var(--color-primary)] transition-colors text-sm"
                  >
                    {booking.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Phone
                  </p>
                  <a
                    href={`tel:${booking.phone}`}
                    className="text-[var(--color-dark)] hover:text-[var(--color-primary)] transition-colors text-sm"
                  >
                    {booking.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2
                className="text-lg font-bold text-[var(--color-dark)] mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Event Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Event Type
                  </p>
                  <p className="text-[var(--color-dark)] text-sm">
                    {booking.event_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Event Date
                  </p>
                  <p className="text-[var(--color-dark)] text-sm">
                    {booking.event_date
                      ? new Date(booking.event_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Number of Guests
                  </p>
                  <p className="text-[var(--color-dark)] text-sm">
                    {booking.pax ? `${booking.pax} pax` : "Not specified"}
                  </p>
                </div>
              </div>

              {booking.message && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Customer Message
                  </p>
                  <p className="text-[var(--color-dark)] leading-relaxed whitespace-pre-wrap text-sm">
                    {booking.message}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2
                className="text-lg font-bold text-[var(--color-dark)] mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Internal Notes
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition resize-none text-sm"
                placeholder="Add notes about this booking (only visible to admin)..."
              />
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="mt-3 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Tracking */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2
                className="text-lg font-bold text-[var(--color-dark)] mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Payment
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Total Amount
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500 self-center">PHP</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Deposit Amount
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500 self-center">PHP</span>
                  </div>
                </div>
                <button
                  onClick={saveAmounts}
                  disabled={savingAmount}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {savingAmount ? "Saving..." : "Save Amounts"}
                </button>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Deposit Paid</span>
                    <button
                      onClick={toggleDepositPaid}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        booking.deposit_paid ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          booking.deposit_paid ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2
                className="text-lg font-bold text-[var(--color-dark)] mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Quick Actions
              </h2>
              <div className="space-y-3">
                <a
                  href={`mailto:${booking.email}?subject=Arabella Events Place - Your ${booking.event_type} Inquiry&body=Hi ${booking.name},%0A%0AThank you for your inquiry about your ${booking.event_type}${booking.event_date ? ` on ${booking.event_date}` : ""}.%0A%0A`}
                  className="block w-full bg-[var(--color-primary)] text-white py-3 rounded-lg text-sm font-semibold text-center hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Send Email
                </a>
                <a
                  href={`tel:${booking.phone}`}
                  className="block w-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] py-3 rounded-lg text-sm font-semibold text-center hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  Call Customer
                </a>
                <a
                  href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white py-3 rounded-lg text-sm font-semibold text-center hover:bg-green-700 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-red-800 mb-2">Danger Zone</h2>
              <button
                onClick={handleDelete}
                className="w-full bg-red-100 text-red-700 py-2.5 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Delete Inquiry
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
