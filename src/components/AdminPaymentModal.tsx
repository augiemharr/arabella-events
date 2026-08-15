"use client";

import { useState, useEffect } from "react";
import { DEFAULT_SITE_CONTROL, SiteControlConfig } from "@/components/SiteLockGuard";

export interface PaymentSubmission {
  id: string;
  method: "gcash" | "bank_bdo" | "bank_bpi";
  refNumber: string;
  payerName: string;
  amount: string;
  submittedAt: string;
  status: "pending" | "verified" | "rejected";
  receiptUrl?: string;
}

export default function AdminPaymentModal() {
  const [siteControl, setSiteControl] = useState<SiteControlConfig>(DEFAULT_SITE_CONTROL);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "bank_bdo" | "bank_bpi">("gcash");
  const [refNumber, setRefNumber] = useState("");
  const [payerName, setPayerName] = useState("Arabella Management");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState<PaymentSubmission[]>([]);
  const [gcashRedirecting, setGcashRedirecting] = useState(false);

  const handleGcashCheckout = async () => {
    setGcashRedirecting(true);
    try {
      const res = await fetch("/api/v1/payments/gcash/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: siteControl.monthlyFee || "₱5,000.00",
          admin_email: "admin@arabellaevents.ph",
        }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch {
      setGcashRedirecting(false);
    }
  };

  useEffect(() => {
    try {
      const savedControl = localStorage.getItem("arb_site_control");
      if (savedControl) {
        setSiteControl(JSON.parse(savedControl));
      }
      const savedSubs = localStorage.getItem("arb_payment_submissions");
      if (savedSubs) {
        setPendingSubmissions(JSON.parse(savedSubs));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber.trim()) return;

    const newSub: PaymentSubmission = {
      id: `pay-${Date.now()}`,
      method: paymentMethod,
      refNumber: refNumber.trim(),
      payerName: payerName.trim(),
      amount: siteControl.monthlyFee || "₱5,000",
      submittedAt: new Date().toLocaleString(),
      status: "pending",
      receiptUrl: receiptPreview || undefined,
    };

    const updatedSubs = [newSub, ...pendingSubmissions];
    setPendingSubmissions(updatedSubs);

    // Update site control status to pending_verification
    const updatedControl: SiteControlConfig = {
      ...siteControl,
      paymentStatus: "pending",
    };
    setSiteControl(updatedControl);

    try {
      localStorage.setItem("arb_payment_submissions", JSON.stringify(updatedSubs));
      localStorage.setItem("arb_site_control", JSON.stringify(updatedControl));
    } catch {
      // ignore
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
      setRefNumber("");
      setReceiptPreview(null);
    }, 2000);
  };

  const isOverdue = siteControl.status === "overdue_locked" || siteControl.paymentStatus === "overdue";
  const hasPending = pendingSubmissions.some((s) => s.status === "pending");

  return (
    <>
      {/* Monthly Subscription & Billing Status Card */}
      <div
        className={`mb-6 rounded-2xl border p-5 transition-all shadow-sm ${
          isOverdue
            ? "bg-red-50 border-red-200 text-red-900"
            : hasPending
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                isOverdue
                  ? "bg-red-100 text-red-600"
                  : hasPending
                  ? "bg-amber-100 text-amber-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              💳
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-gray-900">Monthly Website Maintenance & Hosting</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase font-mono border ${
                    isOverdue
                      ? "bg-red-100 text-red-700 border-red-300"
                      : hasPending
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300"
                  }`}
                >
                  {isOverdue
                    ? "OVERDUE • UNPAID"
                    : hasPending
                    ? "PENDING VERIFICATION"
                    : "PAID • ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Monthly Fee: <span className="font-semibold text-gray-700">{siteControl.monthlyFee}</span> • Next Due Date:{" "}
                <span className="font-semibold text-gray-700">{siteControl.dueDate}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 ${
              isOverdue
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-900 hover:bg-black text-white"
            }`}
          >
            <span>Pay Monthly Subscription</span>
            <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">GCash / Bank</span>
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Monthly Payment Submission</h3>
                <p className="text-xs text-gray-500">Pay via GCash or Bank Transfer</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-gray-900">Payment Submitted Successfully!</h4>
                <p className="text-xs text-gray-500">
                  Your reference receipt has been sent to the developer for verification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
                {/* Amount Summary */}
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl flex justify-between items-center font-mono">
                  <span className="text-gray-500">Total Amount Due:</span>
                  <span className="text-sm font-bold text-gray-900">{siteControl.monthlyFee}</span>
                </div>

                {/* Method Tabs */}
                <div>
                  <label className="block text-gray-600 font-medium mb-1.5">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("gcash")}
                      className={`p-3 rounded-xl border text-center font-medium transition-all ${
                        paymentMethod === "gcash"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      💙 GCash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_bdo")}
                      className={`p-3 rounded-xl border text-center font-medium transition-all ${
                        paymentMethod === "bank_bdo"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      🏦 BDO Unibank
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_bpi")}
                      className={`p-3 rounded-xl border text-center font-medium transition-all ${
                        paymentMethod === "bank_bpi"
                          ? "bg-red-50 border-red-500 text-red-700 font-bold"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      🏛️ BPI Bank
                    </button>
                  </div>
                </div>

                {/* Method Instructions Card */}
                {paymentMethod === "gcash" && (
                  <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-4 space-y-3 text-blue-950 font-sans">
                    <div className="flex justify-between items-center font-semibold text-xs border-b border-blue-200/60 pb-2">
                      <span>GCash Direct Express Payment</span>
                      <span className="font-mono text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">
                        RECOMMENDED • INSTANT
                      </span>
                    </div>

                    <p className="text-xs text-blue-900 leading-relaxed">
                      Click below to be redirected directly to the official GCash Checkout Portal. Once completed, GCash will send an automated webhook to instantly confirm your payment and auto-unlock the site.
                    </p>

                    <button
                      type="button"
                      onClick={handleGcashCheckout}
                      disabled={gcashRedirecting}
                      className="w-full bg-[#005CE6] hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      {gcashRedirecting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Redirecting to GCash...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡ Redirect to GCash App (Instant Auto-Unlock)</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>

                    <div className="pt-2 border-t border-blue-200/60 font-mono text-[11px] space-y-0.5">
                      <div>Account Name: <span className="font-bold">Arabella Dev Support</span></div>
                      <div>GCash Number: <span className="font-bold">0917 123 4567</span></div>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank_bdo" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-slate-800 font-sans">
                    <div className="flex justify-between items-center font-semibold text-xs border-b border-slate-200 pb-2">
                      <span>BDO Bank Transfer</span>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        Online Banking / OTC
                      </span>
                    </div>
                    <div className="font-mono space-y-1 text-xs">
                      <div>
                        Account Name: <span className="font-bold">Arabella Event Systems</span>
                      </div>
                      <div>
                        Account Number: <span className="font-bold">0012 3456 7890</span>
                      </div>
                      <div>
                        Branch: <span className="text-gray-600">Laoag City Main</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank_bpi" && (
                  <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 space-y-2 text-red-950 font-sans">
                    <div className="flex justify-between items-center font-semibold text-xs border-b border-red-200/60 pb-2">
                      <span>BPI Bank Transfer</span>
                      <span className="font-mono text-[10px] bg-red-200 text-red-900 px-2 py-0.5 rounded">
                        BPI Mobile / OTC
                      </span>
                    </div>
                    <div className="font-mono space-y-1 text-xs">
                      <div>
                        Account Name: <span className="font-bold">Arabella Event Services</span>
                      </div>
                      <div>
                        Account Number: <span className="font-bold">9821 0491 22</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Reference Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1029384756 (from GCash or Bank Receipt)"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 font-mono text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Payer Name</label>
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Upload Receipt Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {receiptPreview && (
                      <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={receiptPreview} alt="Receipt preview" className="object-cover w-full h-full" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20"
                  >
                    Submit Payment Proof
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
