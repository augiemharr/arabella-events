"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAdminAuth } from "@/hooks/useAdmin";
import { RESPONSE_TEMPLATES } from "@/lib/templates";
import AdminHeader from "@/components/AdminHeader";
import MenuEstimator from "@/components/MenuEstimator";

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
  menu_selection: Record<string, number> | null;
  created_at: string;
}

export default function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { loading: authLoading, logout } = useAdminAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingAmount, setSavingAmount] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const fetchBooking = async () => {
      const { data, error: fetchError } = await supabase.from("bookings").select("*").eq("id", id).single();
      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setBooking(data);
        setNotes(data.notes || "");
        setTotalAmount(data.total_amount?.toString() || "");
        setDepositAmount(data.deposit_amount?.toString() || "");
      }
      setLoading(false);
    };
    fetchBooking();
  }, [id, authLoading]);

  const updateStatus = async (newStatus: string) => {
    if (!booking) return;
    setUpdating(true);
    setError(null);
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "contacted" || newStatus === "quoted") updateData.last_contacted_at = new Date().toISOString();
    const { error: updateError } = await supabase.from("bookings").update(updateData).eq("id", booking.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setBooking({ ...booking, ...updateData } as Booking);
    }
    setUpdating(false);
  };

  const saveNotes = async () => {
    if (!booking) return;
    setSavingNotes(true);
    const { error: updateError } = await supabase.from("bookings").update({ notes }).eq("id", booking.id);
    if (!updateError) setBooking({ ...booking, notes } as Booking);
    setSavingNotes(false);
  };

  const saveAmounts = async () => {
    if (!booking) return;
    setSavingAmount(true);
    const total = totalAmount ? parseFloat(totalAmount) : 0;
    const deposit = depositAmount ? parseFloat(depositAmount) : 0;
    const { error: updateError } = await supabase.from("bookings").update({ total_amount: total, deposit_amount: deposit }).eq("id", booking.id);
    if (!updateError) setBooking({ ...booking, total_amount: total, deposit_amount: deposit } as Booking);
    setSavingAmount(false);
  };

  const toggleDepositPaid = async () => {
    if (!booking) return;
    const newValue = !booking.deposit_paid;
    const updates: Record<string, unknown> = { deposit_paid: newValue };
    if (newValue && booking.status === "pending_deposit") {
      updates.status = "deposit_paid";
    } else if (!newValue && booking.status === "deposit_paid") {
      updates.status = "pending_deposit";
    }
    const { error: updateError } = await supabase.from("bookings").update(updates).eq("id", booking.id);
    if (!updateError) setBooking({ ...booking, ...updates } as Booking);
  };

  const toggleFinalPaid = async () => {
    if (!booking) return;
    const newValue = !booking.final_paid;
    const updates: Record<string, unknown> = { final_paid: newValue };
    if (newValue && booking.status !== "completed" && booking.status !== "cancelled") {
      updates.status = "completed";
    } else if (!newValue && booking.status === "completed") {
      updates.status = "confirmed";
    }
    const { error: updateError } = await supabase.from("bookings").update(updates).eq("id", booking.id);
    if (!updateError) setBooking({ ...booking, ...updates } as Booking);
  };

  const handleDelete = async () => {
    if (!booking || !confirm("Delete this inquiry?")) return;
    const { error: deleteError } = await supabase.from("bookings").delete().eq("id", booking.id);
    if (!deleteError) router.push("/admin/inquiries");
  };

  const fillTemplate = (index: number) => {
    if (!booking) return;
    const t = RESPONSE_TEMPLATES[index];
    const date = booking.event_date ? new Date(booking.event_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "TBD";
    const replace = (s: string) => s.replace(/{name}/g, booking.name).replace(/{event_type}/g, booking.event_type).replace(/{date}/g, date).replace(/{pax}/g, booking.pax?.toString() || "TBD").replace(/{total}/g, (booking.total_amount || 0).toLocaleString()).replace(/{deposit}/g, (booking.deposit_amount || 0).toLocaleString());
    setSelectedTemplate(index);
    setTemplateSubject(replace(t.subject));
    setTemplateBody(replace(t.body));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("Subject: " + templateSubject + "\n\n" + templateBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = () => {
    if (!booking) return;
    window.open("mailto:" + booking.email + "?subject=" + encodeURIComponent(templateSubject) + "&body=" + encodeURIComponent(templateBody), "_blank");
    updateStatus("contacted");
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>;
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <Link href="/admin/inquiries" className="text-sm text-gray-900 underline">Back to inquiries</Link>
      </div>
    );
  }

  if (!booking) return null;

  const statusFlow = ["new", "contacted", "quoted", "pending_deposit", "deposit_paid", "confirmed", "completed"];
  const currentIdx = statusFlow.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader
        title={booking.name}
        backHref="/admin/inquiries"
        rightItems={[
          { label: "Site", href: "/" },
          { label: "Logout", onClick: logout },
        ]}
      />

      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {statusFlow.map((s, i) => (
              <button key={s} onClick={() => updateStatus(s)} disabled={updating}
                className={"px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors disabled:opacity-50 " + (booking.status === s ? "bg-gray-900 text-white" : i <= currentIdx ? "bg-gray-200 text-gray-600" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}>
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
          <button onClick={() => updateStatus("cancelled")} disabled={booking.status === "cancelled"}
            className={"px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors disabled:opacity-50 " + (booking.status === "cancelled" ? "bg-red-500 text-white" : "bg-red-50 text-red-500 hover:bg-red-100")}>
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">Contact</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-400 mb-1">Email</p><a href={"mailto:" + booking.email} className="text-sm text-gray-900 hover:text-gray-600 transition-colors">{booking.email}</a></div>
                <div><p className="text-xs text-gray-400 mb-1">Phone</p><a href={"tel:" + booking.phone} className="text-sm text-gray-900 hover:text-gray-600 transition-colors">{booking.phone}</a></div>
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">Event</h2>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-gray-400 mb-1">Type</p><p className="text-sm text-gray-900">{booking.event_type}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Date</p><p className="text-sm text-gray-900">{booking.event_date ? new Date(booking.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Guests</p><p className="text-sm text-gray-900">{booking.pax ? booking.pax + " pax" : "-"}</p></div>
              </div>
              {booking.message && <div className="mt-3"><p className="text-xs text-gray-400 mb-1">Message</p><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{booking.message}</p></div>}
            </div>

            {booking.menu_selection && Object.keys(booking.menu_selection).length > 0 && (
              <div>
                <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">Customer Menu Selection</h2>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {(["main", "dessert", "drink"] as const).map((cat) => {
                    const catItems = Object.entries(booking.menu_selection!).filter(([name]) => {
                      const catMap: Record<string, string[]> = {
                        main: ["Bagnet", "Poqui Poqui", "Dinuguan", "Pinakbet", "Hegado", "Pochero"],
                        dessert: ["Leche Flan", "Halo-Halo", "Bibingka", "Cassava Cake"],
                        drink: ["Softdrinks (1L)", "Bottled Water", "Juice (1L)", "Iced Tea (1L)"],
                      };
                      return catMap[cat]?.includes(name);
                    });
                    if (catItems.length === 0) return null;
                    return (
                      <div key={cat}>
                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                          {cat === "main" ? "Main Dishes" : cat === "dessert" ? "Desserts" : "Drinks"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {catItems.map(([name, qty]) => (
                            <span key={name} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md">
                              {name} × {qty}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">Quick Reply</h2>

              {selectedTemplate === null && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {RESPONSE_TEMPLATES.map((t, i) => (
                      <button key={t.name} onClick={() => fillTemplate(i)} className="text-left p-3 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all">
                        <p className="text-xs font-medium text-gray-900">{t.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t.subject}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <a href={"mailto:" + booking.email + "?subject=" + encodeURIComponent("Re: " + booking.event_type + " Inquiry") + "&body=" + encodeURIComponent("Hi " + booking.name + ",\n\n")}
                      className="flex-1 text-center py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      Blank Email
                    </a>
                    <a href={"tel:" + booking.phone} className="flex-1 text-center py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      Call
                    </a>
                    <a href={"https://wa.me/" + booking.phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center py-2.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors">
                      WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {selectedTemplate !== null && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-900">{RESPONSE_TEMPLATES[selectedTemplate].name}</span>
                    <button onClick={() => setSelectedTemplate(null)} className="text-[10px] text-gray-400 hover:text-gray-600">Back to templates</button>
                  </div>
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-400 block mb-1">Subject</label>
                    <input value={templateSubject} onChange={(e) => setTemplateSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 outline-none" />
                  </div>
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-400 block mb-1">Body</label>
                    <textarea value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} rows={10} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 outline-none resize-none leading-relaxed" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyToClipboard} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={sendEmail} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors">
                      Open in Email
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">Notes</h2>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 outline-none transition resize-none placeholder-gray-300" placeholder="Add internal notes..." />
              <button onClick={saveNotes} disabled={savingNotes} className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
                {savingNotes ? "Saving..." : "Save notes"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">Payment</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Total</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">P</span>
                    <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 outline-none" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Deposit</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">P</span>
                    <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 outline-none" placeholder="0" />
                  </div>
                </div>
                <button onClick={saveAmounts} disabled={savingAmount} className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
                  {savingAmount ? "Saving..." : "Save"}
                </button>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Deposit paid</span>
                    <button onClick={toggleDepositPaid} className={"w-10 h-5 rounded-full transition-colors relative " + (booking.deposit_paid ? "bg-green-500" : "bg-gray-200")}>
                      <div className={"w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform " + (booking.deposit_paid ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Final payment received</span>
                    <button onClick={toggleFinalPaid} className={"w-10 h-5 rounded-full transition-colors relative " + (booking.final_paid ? "bg-green-500" : "bg-gray-200")}>
                      <div className={"w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform " + (booking.final_paid ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <MenuEstimator pax={booking.pax || 0} />

            <div className="pt-4 border-t border-gray-100">
              <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete inquiry</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
