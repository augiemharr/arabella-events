"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DEFAULT_SITE_CONTROL, SiteControlConfig } from "@/components/SiteLockGuard";
import { PaymentSubmission } from "@/components/AdminPaymentModal";

function GCashCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const txnId = searchParams.get("txn") || `GCASH_TXN_${Date.now()}`;
  const refNo = searchParams.get("ref") || `2026${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const amount = searchParams.get("amount") || "₱5,000.00";

  const [step, setStep] = useState<"phone" | "otp" | "mpin" | "processing" | "success">("phone");
  const [mobileNo, setMobileNo] = useState("0917 123 4567");
  const [otp, setOtp] = useState("892104");
  const [mpin, setMpin] = useState("");
  const [mpinError, setMpinError] = useState(false);

  useEffect(() => {
    // Auto focus
  }, []);

  const handlePay = async () => {
    if (mpin.length < 4) {
      setMpinError(true);
      return;
    }
    setMpinError(false);
    setStep("processing");

    // Simulate GCash Webhook dispatch and auto verification
    try {
      const res = await fetch("/api/v1/payments/gcash/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: txnId,
          reference_number: refNo,
          amount,
          status: "SUCCESS",
        }),
      });
      await res.json();
    } catch {
      // ignore
    }

    // Auto-update site control in localStorage
    try {
      let currentControl: SiteControlConfig = DEFAULT_SITE_CONTROL;
      const savedControl = localStorage.getItem("arb_site_control");
      if (savedControl) {
        currentControl = JSON.parse(savedControl);
      }

      // Calculate next due date + 1 month
      const curDate = new Date(currentControl.dueDate || "2026-09-01");
      curDate.setMonth(curDate.getMonth() + 1);
      const nextDueDateStr = curDate.toISOString().slice(0, 10);

      const updatedControl: SiteControlConfig = {
        ...currentControl,
        status: "active",
        paymentStatus: "paid",
        dueDate: nextDueDateStr,
      };
      localStorage.setItem("arb_site_control", JSON.stringify(updatedControl));

      // Save submission record as verified
      let subs: PaymentSubmission[] = [];
      const savedSubs = localStorage.getItem("arb_payment_submissions");
      if (savedSubs) subs = JSON.parse(savedSubs);

      const newSub: PaymentSubmission = {
        id: `pay-${Date.now()}`,
        method: "gcash",
        refNumber: refNo,
        payerName: "GCash Direct Checkout",
        amount,
        submittedAt: new Date().toLocaleString(),
        status: "verified",
      };

      localStorage.setItem("arb_payment_submissions", JSON.stringify([newSub, ...subs]));
    } catch {
      // ignore
    }

    setTimeout(() => {
      setStep("success");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#005CE6] text-white flex flex-col items-center justify-center p-4 font-sans">
      {/* GCash Top Brand Header */}
      <div className="w-full max-w-sm mb-6 text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono tracking-wider text-blue-100 font-semibold uppercase">
            Official GCash Online Payment
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <span>GCash</span>
        </h1>
      </div>

      {/* Main Payment Card */}
      <div className="w-full max-w-sm bg-white text-gray-900 rounded-3xl p-6 shadow-2xl space-y-5 border border-blue-100">
        {/* Merchant Summary */}
        <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-blue-600">
            Merchant Payee
          </span>
          <h2 className="text-sm font-bold text-gray-900">Arabella Events Place</h2>
          <p className="text-xs text-gray-500">Monthly Website Hosting & Systems Maintenance</p>
          <div className="pt-2 flex justify-between items-baseline font-mono border-t border-blue-100 mt-2">
            <span className="text-xs text-gray-500">Amount Due:</span>
            <span className="text-lg font-bold text-blue-700">{amount}</span>
          </div>
        </div>

        {/* STEP 1: Phone Input */}
        {step === "phone" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Enter Mobile Number
              </label>
              <input
                type="text"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                className="w-full border-2 border-blue-200 focus:border-blue-600 rounded-xl px-4 py-3 text-base font-mono text-gray-900 focus:outline-none text-center font-semibold"
              />
              <p className="text-[11px] text-gray-400 text-center pt-1">
                Registered GCash number for verification
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep("otp")}
              className="w-full bg-[#005CE6] hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm shadow-lg shadow-blue-500/30 uppercase tracking-wider"
            >
              Next →
            </button>
          </div>
        )}

        {/* STEP 2: OTP Code */}
        {step === "otp" && (
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Enter 6-Digit Authentication Code (OTP)
              </label>
              <p className="text-xs text-gray-500 pb-2">Sent to {mobileNo}</p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border-2 border-blue-200 focus:border-blue-600 rounded-xl px-4 py-3 text-xl font-mono text-blue-700 focus:outline-none text-center tracking-widest font-bold"
              />
            </div>
            <button
              type="button"
              onClick={() => setStep("mpin")}
              className="w-full bg-[#005CE6] hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm shadow-lg shadow-blue-500/30 uppercase tracking-wider"
            >
              Submit Authentication Code
            </button>
          </div>
        )}

        {/* STEP 3: MPIN Input */}
        {step === "mpin" && (
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Enter Your 4-Digit MPIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                placeholder="••••"
                className="w-full border-2 border-blue-200 focus:border-blue-600 rounded-xl px-4 py-3 text-2xl font-mono text-gray-900 focus:outline-none text-center tracking-widest"
              />
              {mpinError && (
                <p className="text-xs text-red-500 font-mono">Please enter your 4-digit MPIN.</p>
              )}
            </div>
            <button
              type="button"
              onClick={handlePay}
              className="w-full bg-[#005CE6] hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm shadow-lg shadow-blue-500/30 uppercase tracking-wider"
            >
              PAY {amount} NOW
            </button>
          </div>
        )}

        {/* STEP 4: Processing */}
        {step === "processing" && (
          <div className="py-8 text-center space-y-3 font-sans">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">Processing GCash Direct Transfer...</h3>
            <p className="text-xs text-gray-500 font-mono">Sending Webhook confirmation to Arabella System</p>
          </div>
        )}

        {/* STEP 5: Success Receipt */}
        {step === "success" && (
          <div className="py-4 text-center space-y-4 font-sans">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg shadow-emerald-500/20">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                Automated GCash Webhook Confirmed
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-xs font-mono space-y-2 text-left text-gray-700">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Ref No:</span>
                <span className="font-bold text-blue-700">{refNo}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="text-gray-800">{txnId.substring(0, 16)}...</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-gray-900">{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="text-emerald-600 font-bold uppercase">Auto-Unlocked ✓</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="w-full bg-[#005CE6] hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm shadow-lg shadow-blue-500/30 uppercase tracking-wider"
              >
                Return to Admin Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-blue-200 font-mono">
        Secured by GCash Direct Payment Gateway v2.4
      </div>
    </div>
  );
}

export default function GCashCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#005CE6] text-white flex items-center justify-center">Loading GCash...</div>}>
      <GCashCheckoutContent />
    </Suspense>
  );
}
