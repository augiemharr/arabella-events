"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export interface Booking {
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

export function useAdminAuth() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionError || !data.session) {
        router.push("/admin/login");
        return;
      }
      setLoading(false);
    };
    checkAuth();
    return () => { cancelled = true; };
  }, [router]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }, [router]);

  return { loading, logout };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchBookings = async () => {
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };
    fetchBookings();
    return () => { cancelled = true; };
  }, []);

  const updateBooking = useCallback((id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  }, []);

  const removeBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { bookings, loading, error, updateBooking, addBooking, removeBooking };
}
