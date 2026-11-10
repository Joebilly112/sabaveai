import { NextResponse } from "next/server";
import { isDebriefId, parseDebriefInput } from "@/lib/input";
import { createDebrief, getDebrief, StoreUnconfiguredError, toPublic } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi debrief tidak terbaca." }, { status: 400 });
  }
  const parsed = parseDebriefInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  try {
    const record = await createDebrief(parsed.value);
    return NextResponse.json({ id: record.id });
  } catch (error) {
    if (error instanceof StoreUnconfiguredError) {
      return NextResponse.json({ error: "store_unconfigured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Debrief belum tersimpan." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!isDebriefId(id)) {
    return NextResponse.json({ error: "Pengenal tidak lengkap." }, { status: 400 });
  }
  try {
    const record = await getDebrief(id);
    if (!record) return NextResponse.json({ error: "Tidak ketemu." }, { status: 404 });
    return NextResponse.json(toPublic(record));
  } catch (error) {
    if (error instanceof StoreUnconfiguredError) {
      return NextResponse.json({ error: "store_unconfigured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Debrief belum terbaca." }, { status: 500 });
  }
}
