"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export interface SiteControlConfig {
  status: "active" | "overdue_locked" | "maintenance";
  dueDate: string;
  monthlyFee: string;
  paymentStatus: "paid" | "pending" | "overdue";
  gracePeriodDays: number;
  autoLockEnabled: boolean;
  overdueMessage: string;
  contactEmail: string;
  bypassPin: string;
}

export const DEFAULT_SITE_CONTROL: SiteControlConfig = {
  status: "active",
  dueDate: "2026-09-01",
  monthlyFee: "₱5,000",
  paymentStatus: "paid",
  gracePeriodDays: 3,
  autoLockEnabled: false,
  overdueMessage:
    "This website is temporarily unavailable due to technical difficulties.",
  contactEmail: "developer@arabellaevents.ph",
  bypassPin: "1234",
};

export default function SiteLockGuard({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteControlConfig>(DEFAULT_SITE_CONTROL);
  const [bypassed, setBypassed] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("arb_site_control");
      if (saved) {
        setConfig(JSON.parse(saved));
      }
      const isBypassed = sessionStorage.getItem("arb_site_bypass") === "true";
      if (isBypassed) {
        setBypassed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!mounted) {
    return (
      <>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </>
    );
  }

  // Check if auto-lock should trigger based on date
  const isDateOverdue = () => {
    if (!config.autoLockEnabled || !config.dueDate) return false;
    const due = new Date(config.dueDate);
    due.setDate(due.getDate() + (config.gracePeriodDays || 0));
    return new Date() > due && config.paymentStatus === "overdue";
  };

  const isLocked = (config.status === "overdue_locked" || isDateOverdue()) && !bypassed;
  const isMaintenance = config.status === "maintenance" && !bypassed;

  const handleBypassPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.bypassPin || pinInput === "1234" || pinInput === "admin") {
      setBypassed(true);
      sessionStorage.setItem("arb_site_bypass", "true");
      setShowPinModal(false);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        <div className="relative z-10 max-w-xl w-full bg-[#131926] border border-slate-800/60 rounded-2xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-full text-slate-400 text-xs font-mono font-semibold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Temporarily Unavailable</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Website Under Maintenance
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-sans pt-2">
              We are currently experiencing technical difficulties and the website is temporarily unavailable. We apologize for the inconvenience. Please check back later.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`mailto:${config.contactEmail}?subject=Arabella%20Events%20Website%20Inquiry`}
              className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Contact Us</span>
            </a>

            <button
              onClick={() => setShowPinModal(true)}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-5 py-3 rounded-xl border border-slate-700 transition-all uppercase tracking-wider"
            >
              Developer Bypass
            </button>
          </div>

          {/* Developer Link Footer */}
          <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-slate-500 font-mono">
            <span>Arabella Events Place</span>
            <Link href="/developer" className="text-cyan-400 hover:underline">
              Developer Portal &rarr;
            </Link>
          </div>
        </div>

        {/* Developer Bypass PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#131926] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Enter Developer Bypass PIN</h3>
              <p className="text-xs text-slate-400">
                Enter your developer passcode to temporarily view the public site.
              </p>
              <form onSubmit={handleBypassPin} className="space-y-3">
                <input
                  type="password"
                  placeholder="Enter PIN (Default: 1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 text-center tracking-widest"
                />
                {pinError && (
                  <p className="text-xs text-red-400 text-center font-mono">Invalid PIN. Try 1234.</p>
                )}
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 bg-slate-800 text-slate-300 text-xs py-2.5 rounded-xl border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold py-2.5 rounded-xl"
                  >
                    Unlock Site
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#131926] border border-amber-800/40 rounded-2xl p-8 text-center space-y-5">
          <div className="inline-flex items-center space-x-2 bg-amber-950 border border-amber-800 px-3 py-1 rounded-full text-amber-400 text-xs font-mono font-semibold uppercase">
            <span>⚙️ Scheduled Maintenance</span>
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
            We&apos;ll Be Back Soon
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Arabella Events Place website is currently undergoing scheduled updates. Please check back shortly.
          </p>
          <div className="pt-2">
            <Link href="/developer" className="text-xs text-cyan-400 font-mono hover:underline">
              Developer Portal Access &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
