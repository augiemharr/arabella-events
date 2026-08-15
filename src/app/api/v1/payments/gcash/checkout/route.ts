import { NextRequest, NextResponse } from "next/server";
import { generateMerchantReference } from "@/lib/merchant-ref";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, admin_email } = body;

    const txnId = `TXN-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
    const refNo = generateMerchantReference("GCASH");

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const checkoutUrl = `${protocol}://${host}/payments/gcash/checkout?txn=${txnId}&ref=${refNo}&amount=${encodeURIComponent(
      amount || "₱5,000.00"
    )}`;

    return NextResponse.json({
      success: true,
      transaction_id: txnId,
      reference_number: refNo,
      amount: amount || "₱5,000.00",
      checkout_url: checkoutUrl,
      created_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout initialization failed" },
      { status: 400 }
    );
  }
}
