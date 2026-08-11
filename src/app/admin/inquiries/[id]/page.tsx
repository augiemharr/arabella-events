"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { RESPONSE_TEMPLATES } from "@/lib/templates";

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

export default function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingAmount, setSavingAmount] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.push("/admin/login"); return; }
      const { data: bookingData } = await supabase.from("bookings").select("*").eq("id", id).single();
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
    if (newStatus === "contacted" || newStatus === "quoted") updateData.last_contacted_at = new Date().toISOString();
    const { error } = await supabase.from("bookings").update(updateData).eq("id", booking.id);
    if (!error) setBooking({ ...booking, ...updateData } as Booking);
    setUpdating(false);
  };

  const saveNotes = async () => {
    if (!booking) return;
    setSavingNotes(true);
    const { error } = await supabase.from("bookings").update({ notes }).eq("id", booking.id);
    if (!error) setBooking({ ...booking, notes } as Booking);
    setSavingNotes(false);
  };

  const saveAmounts = async () => {
    if (!booking) return;
    setSavingAmount(true);
    const total = totalAmount ? parseFloat(totalAmount) : 0;
    const deposit = depositAmount ? parseFloat(depositAmount) : 0;
    const { error } = await supabase.from("bookings").update({ total_amount: total, deposit_amount: deposit }).eq("id", booking.id);
    if (!error) setBooking({ ...booking, total_amount: total, deposit_amount: deposit } as Booking);
    setSavingAmount(false);
  };

  const toggleDepositPaid = async () => {
    if (!booking) return;
    const newValue = !booking.deposit_paid;
    const { error } = await supabase.from("bookings").update({ deposit_paid: newValue, status: newValue ? "deposit_paid" : "pending_deposit" }).eq("id", booking.id);
    if (!error) setBooking({ ...booking, deposit_paid: newValue, status: newValue ? "deposit_paid" : "pending_deposit" } as Booking);
  };

  const handleDelete = async () => {
    if (!booking || !confirm("Delete this inquiry?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", booking.id);
    if (!error) router.push("/admin/inquiries");
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/admin/login"); };

  const fillTemplate = (index: number) => {
    if (!booking) return;
    const t = RESPONSE_TEMPLATES[index];
    const date = booking.event_date ? new Date(booking.event_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "TBD";
    const replace = (s: string) => s.replace(/{name}/g, booking.name).replace(/{event_type}/g, booking.event_type).replace(/{date}/g, date).replace(/{pax}/g, booking.pax?.toString() || "TBD").replace(/{total}/g, (booking.total_amount || 0).toLocaleString()).replace(/{deposit}/g, (booking.deposit_amount || 0).toLocaleString());
    setSelectedTemplate(index);
    setTemplateSubject(replace(t.subject));
    setTemplateBody(replace(t.body));
    setShowTemplates(false);
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

  if (loading || !booking) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>;

  const statusFlow = ["new", "contacted", "quoted", "pending_deposit", "deposit_paid", "confirmed", "completed"];
  const currentIdx = statusFlow.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin/inquiries" className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">Back</Link>
            <h1 className="text-base font-semibold text-gray-900" style={{ fontFamily: "var(--font-playfair)" }}>{booking.name}</h1>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">Site</Link>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
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

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
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

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Quick Reply</h2>
                <button onClick={() => { setShowTemplates(!showTemplates); setSelectedTemplate(null); }} className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
                  {showTemplates ? "Close" : "Templates"}
                </button>
              </div>

              {showTemplates && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {RESPONSE_TEMPLATES.map((t, i) => (
                    <button key={t.name} onClick={() => fillTemplate(i)} className="text-left p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <p className="text-xs font-medium text-gray-900">{t.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{t.subject}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedTemplate !== null && (
                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-400 block mb-1">Subject</label>
                    <input value={templateSubject} onChange={(e) => setTemplateSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 outline-none" />
                  </div>
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-400 block mb-1">Body</label>
                    <textarea value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} rows={8} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 outline-none resize-none" />
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

              {selectedTemplate === null && !showTemplates && (
                <div className="flex gap-2">
                  <a href={"mailto:" + booking.email + "?subject=" + encodeURIComponent("Re: " + booking.event_type + " Inquiry") + "&body=" + encodeURIComponent("Hi " + booking.name + ",\n\n")}
                    className="flex-1 text-center py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Reply via Email
                  </a>
                  <a href={"tel:" + booking.phone} className="flex-1 text-center py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Call
                  </a>
                  <a href={"https://wa.me/" + booking.phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors">
                    WhatsApp
                  </a>
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
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Deposit paid</span>
                    <button onClick={toggleDepositPaid} className={"w-10 h-5 rounded-full transition-colors relative " + (booking.deposit_paid ? "bg-green-500" : "bg-gray-200")}>
                      <div className={"w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform " + (booking.deposit_paid ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete inquiry</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}