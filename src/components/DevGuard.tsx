"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DEV_PIN = "dev2026";

export default function DevGuard({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem("arb_dev_auth") === "true") {
        setAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <p className="text-slate-500 text-xs font-mono">Loading Developer Portal...</p>
      </div>
    );
  }

  if (authenticated) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === DEV_PIN) {
      setAuthenticated(true);
      sessionStorage.setItem("arb_dev_auth", "true");
      setError(false);
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <div className="relative z-10 max-w-sm w-full bg-[#161b22] border border-slate-800 rounded-2xl p-8 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 bg-cyan-950 border border-cyan-800 px-3 py-1.5 rounded-full text-cyan-400 text-xs font-mono font-semibold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Developer Access Only</span>
        </div>

        <div className="space-y-2">
          <h1
            className="text-2xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Developer Portal
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter your developer passcode to access the system control panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter Developer PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-4 py-3 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 text-center tracking-widest"
          />
          {error && (
            <p className="text-xs text-red-400 font-mono">Invalid passcode. Access denied.</p>
          )}
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold py-3 rounded-xl transition-all uppercase tracking-wider"
          >
            Authenticate
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/60">
          <Link href="/admin" className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-mono">
            &larr; Back to Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
