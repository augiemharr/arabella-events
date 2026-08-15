import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatencyMs = 0;
  let bookingsCount = 0;

  try {
    const { count, error } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    dbLatencyMs = Date.now() - startTime;

    if (error) {
      dbStatus = `degraded: ${error.message}`;
    } else {
      dbStatus = "healthy";
      bookingsCount = count || 0;
    }
  } catch (err: unknown) {
    dbLatencyMs = Date.now() - startTime;
    dbStatus = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    status: dbStatus === "healthy" ? "online" : "degraded",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      api: { status: "healthy", latency_ms: 5 },
      database: {
        provider: "Supabase PostgreSQL",
        status: dbStatus,
        latency_ms: dbLatencyMs,
        total_bookings: bookingsCount,
      },
      environment: process.env.NODE_ENV || "development",
    },
    uptime_seconds: Math.floor(process.uptime()),
  });
}
