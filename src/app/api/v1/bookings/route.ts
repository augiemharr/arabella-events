import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  let query = supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    object: "list",
    data: data || [],
    count: data ? data.length : 0,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, event_type, event_date, pax, message } = body;

    if (!name || !email || !phone || !event_type) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, event_type" },
        { status: 400 }
      );
    }

    const newBooking = {
      name,
      email,
      phone,
      event_type,
      event_date: event_date || null,
      pax: pax ? Number(pax) : null,
      message: message || null,
      status: "new",
    };

    const { data, error } = await supabase
      .from("bookings")
      .insert([newBooking])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Booking inquiry created successfully",
        data,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid JSON body" },
      { status: 400 }
    );
  }
}
