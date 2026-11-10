import { NextResponse } from "next/server";
import { site } from "@/lib/config";
import { isDebriefId } from "@/lib/input";
import { createSnapTransaction, midtransConfigured } from "@/lib/midtrans";
import { getDebrief, StoreUnconfiguredError, updateDebrief } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function nextOrderId(id: string, previous?: string) {
  if (!previous) return `idb_${id}`;
  const match = /^idb_[a-f0-9]{24}_(\d+)$/.exec(previous);
  const next = match ? Number(match[1]) + 1 : 2;
  return `idb_${id}_${next}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak terbaca." }, { status: 400 });
  }
  const id = body && typeof body === "object" ? String((body as { id?: unknown }).id ?? "") : "";
  if (!isDebriefId(id)) {
    return NextResponse.json({ error: "Pengenal tidak lengkap." }, { status: 400 });
  }
  if (!midtransConfigured()) {
    return NextResponse.json({ error: "payment_unconfigured" }, { status: 503 });
  }

  try {
    const record = await getDebrief(id);
    if (!record) return NextResponse.json({ error: "Tidak ketemu." }, { status: 404 });
    if (record.paid) return NextResponse.json({ paid: true });

    const fresh =
      record.snapToken &&
      record.snapRedirectUrl &&
      record.snapTokenAt &&
      Date.now() - Date.parse(record.snapTokenAt) < 23 * 60 * 60 * 1000;
    if (fresh && record.snapToken && record.snapRedirectUrl) {
      return NextResponse.json({ token: record.snapToken, redirectUrl: record.snapRedirectUrl });
    }

    const orderId = nextOrderId(id, record.orderId);
    const finishUrl = `${site.url}/hasil/${id}`;
    const snap = await createSnapTransaction({ orderId, debriefId: id, finishUrl });
    if (!snap) {
      return NextResponse.json({ error: "Snap tidak menjawab." }, { status: 502 });
    }
    await updateDebrief(id, {
      orderId,
      snapToken: snap.token,
      snapRedirectUrl: snap.redirectUrl,
      snapTokenAt: new Date().toISOString(),
      paymentStatus: "pending",
    });
    return NextResponse.json({ token: snap.token, redirectUrl: snap.redirectUrl });
  } catch (error) {
    if (error instanceof StoreUnconfiguredError) {
      return NextResponse.json({ error: "store_unconfigured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Pembayaran belum terbuat." }, { status: 500 });
  }
}
