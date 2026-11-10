import { NextResponse } from "next/server";
import { isDebriefId } from "@/lib/input";
import { amountIsUnlockPrice, fetchMidtransStatus, isPaidStatus } from "@/lib/midtrans";
import { getDebrief, StoreUnconfiguredError, toPublic, updateDebrief } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!isDebriefId(id)) {
    return NextResponse.json({ error: "Pengenal tidak lengkap." }, { status: 400 });
  }
  try {
    let record = await getDebrief(id);
    if (!record) return NextResponse.json({ error: "Tidak ketemu." }, { status: 404 });
    if (!record.paid && record.orderId) {
      const remote = await fetchMidtransStatus(record.orderId);
      if (
        remote?.transaction_status &&
        remote.gross_amount &&
        amountIsUnlockPrice(remote.gross_amount) &&
        isPaidStatus(remote.transaction_status, remote.fraud_status)
      ) {
        const updated = await updateDebrief(id, {
          paid: true,
          paymentStatus: remote.transaction_status,
        });
        if (updated) record = updated;
      }
    }
    return NextResponse.json(toPublic(record));
  } catch (error) {
    if (error instanceof StoreUnconfiguredError) {
      return NextResponse.json({ error: "store_unconfigured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Status belum terbaca." }, { status: 500 });
  }
}
