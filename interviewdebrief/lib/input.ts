import { type DebriefInput, type GutFeeling, type InterviewFormat } from "@/lib/types";

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

export function parseDebriefInput(
  body: unknown,
): { ok: true; value: DebriefInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Isi debrief tidak lengkap." };
  }
  const raw = body as Record<string, unknown>;
  const role = clean(raw.role, 80);
  const asked = clean(raw.asked, 4000);
  const format = raw.format;
  const gut = raw.gut;
  const duration =
    typeof raw.durationMinutes === "number" ? raw.durationMinutes : Number(raw.durationMinutes);

  if (role.length < 2) {
    return { ok: false, error: "Isi peran yang dilamar." };
  }
  if (format !== "hr" && format !== "user" && format !== "case") {
    return { ok: false, error: "Pilih format wawancara." };
  }
  if (asked.length < 40) {
    return {
      ok: false,
      error: "Ceritakan sedikit lebih utuh. Beberapa kalimat soal pertanyaan dan jawabanmu sudah cukup.",
    };
  }
  if (!Number.isFinite(duration) || duration < 5 || duration > 240) {
    return { ok: false, error: "Isi durasi antara 5 dan 240 menit." };
  }
  if (gut !== "jelek" && gut !== "campur" && gut !== "tenang") {
    return { ok: false, error: "Pilih perasaan yang paling dekat." };
  }

  return {
    ok: true,
    value: {
      role,
      format: format as InterviewFormat,
      asked,
      durationMinutes: Math.round(duration),
      gut: gut as GutFeeling,
    },
  };
}

export function isDebriefId(id: string) {
  return /^[a-f0-9]{24}$/.test(id);
}
