import { NextResponse } from "next/server";
import { recordAnalytics } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set([
  "page_view",
  "debrief_started",
  "debrief_created",
  "unlock_clicked",
  "payment_opened",
  "payment_returned",
]);

const hits = new Map<string, { count: number; reset: number }>();

function limited(ip: string) {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || current.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 60;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return new NextResponse(null, { status: 204 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Analitik tidak terbaca." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Analitik tidak lengkap." }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;
  if (typeof raw.event !== "string" || !allowed.has(raw.event)) {
    return NextResponse.json({ error: "Peristiwa tidak dikenal." }, { status: 400 });
  }
  const path = typeof raw.path === "string" ? raw.path.slice(0, 120) : "/";
  const props: Record<string, string | number | boolean> = {};
  if (raw.props && typeof raw.props === "object") {
    for (const [key, value] of Object.entries(raw.props).slice(0, 8)) {
      if (typeof value === "string") props[key.slice(0, 32)] = value.slice(0, 80);
      else if (typeof value === "number" && Number.isFinite(value)) props[key.slice(0, 32)] = value;
      else if (typeof value === "boolean") props[key.slice(0, 32)] = value;
    }
  }
  try {
    await recordAnalytics({
      event: raw.event,
      path,
      props,
      ts: typeof raw.ts === "number" ? raw.ts : Date.now(),
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  return new NextResponse(null, { status: 204 });
}
