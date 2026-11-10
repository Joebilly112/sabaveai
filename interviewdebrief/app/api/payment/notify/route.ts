import { NextResponse } from "next/server";
import {
  amountIsUnlockPrice,
  debriefIdFromOrder,
  isPaidStatus,
  midtransConfigured,
  verifyMidtransSignature,
} from "@/lib/midtrans";
import { updateDebrief } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!midtransConfigured()) {
    return NextResponse.json({ error: "payment_unconfigured" }, { status: 503 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Notifikasi tidak terbaca." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Notifikasi kosong." }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;
  const orderId = String(raw.order_id ?? "");
  const statusCode = String(raw.status_code ?? "");
  const grossAmount = String(raw.gross_amount ?? "");
  const signature = String(raw.signature_key ?? "");
  const transactionStatus = String(raw.transaction_status ?? "");
  const fraudStatus = raw.fraud_status ? String(raw.fraud_status) : undefined;
  const customId = typeof raw.custom_field1 === "string" ? raw.custom_field1 : "";
  const debriefId = debriefIdFromOrder(orderId) || (/^[a-f0-9]{24}$/.test(customId) ? customId : null);

  if (!debriefId || !verifyMidtransSignature({ orderId, statusCode, grossAmount, signature })) {
    return NextResponse.json({ error: "Tanda tangan tidak cocok." }, { status: 403 });
  }

  const paid = amountIsUnlockPrice(grossAmount) && isPaidStatus(transactionStatus, fraudStatus);
  await updateDebrief(debriefId, {
    orderId,
    paymentStatus: transactionStatus,
    ...(paid ? { paid: true } : {}),
  });
  return NextResponse.json({ ok: true });
}
