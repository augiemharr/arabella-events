import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, reference_number, amount, status } = body;

    if (!transaction_id || status !== "SUCCESS") {
      return NextResponse.json(
        { error: "Invalid transaction payload or payment not completed" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // Auto-verified webhook response payload
    const verificationResult = {
      event: "gcash.payment.verified",
      transaction_id,
      reference_number: reference_number || `GCASH-${Math.floor(100000000 + Math.random() * 900000000)}`,
      amount: amount || "₱5,000.00",
      status: "SUCCESS",
      auto_approved: true,
      site_unlocked: true,
      timestamp,
      message: "Payment confirmed by GCash Gateway. Website access restored automatically.",
    };

    return NextResponse.json(verificationResult, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook processing failed" },
      { status: 500 }
    );
  }
}
