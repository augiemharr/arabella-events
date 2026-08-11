"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Arabella Admin
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition placeholder-gray-300"
              placeholder="Email"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition placeholder-gray-300"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg text-xs font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-300 mt-8">
          <a href="/" className="hover:text-gray-500 transition-colors">
            Back to site
          </a>
        </p>
      </div>
    </div>
  );
}
