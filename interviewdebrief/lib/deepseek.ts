import "server-only";

import type { DebriefInput, Scorecard } from "@/lib/types";

interface CoachRewrite {
  spiralNote: string;
  fixes: string[];
}

function parseRewrite(raw: string): CoachRewrite | null {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const note = (data as { spiralNote?: unknown }).spiralNote;
  const fixes = (data as { fixes?: unknown }).fixes;
  if (typeof note !== "string" || note.length < 40 || note.length > 700) return null;
  if (!Array.isArray(fixes) || fixes.length < 3 || fixes.length > 4) return null;
  if (!fixes.every((item) => typeof item === "string" && item.trim().length >= 20 && item.trim().length <= 320)) {
    return null;
  }
  return { spiralNote: note.trim(), fixes: fixes.map((item) => item.trim()) };
}

export async function rewriteWithDeepseek(input: DebriefInput, card: Scorecard): Promise<CoachRewrite | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Kamu coach wawancara yang tenang untuk pencari kerja dan fresh grad di Indonesia. Bukan HR korporat. Jangan bicara gaji, tawaran, atau kepantasan kompensasi. Jangan menjanjikan lolos. Jangan mengubah angka. Balas JSON dengan kunci spiralNote (string, bahasa Indonesia, 2-3 kalimat) dan fixes (array 3 atau 4 string konkret yang bisa dilakukan sebelum wawancara berikutnya).",
          },
          {
            role: "user",
            content: JSON.stringify({
              peran: input.role,
              format: input.format,
              durasiMenit: input.durationMinutes,
              perasaan: input.gut,
              rekap: input.asked,
              overall: card.overall,
              band: card.band,
              dimensi: card.dimensions.map((item) => ({
                label: item.label,
                score: item.score,
                note: item.note,
              })),
              catatanAwal: card.spiralNote,
              perbaikanAwal: card.fixes,
            }),
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    return parseRewrite(content);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
