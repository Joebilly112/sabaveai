// Server-only DeepSeek transport. Never expose provider responses or credentials in errors.
type Request = { systemPrompt: string; userPrompt: string; exampleSchema: unknown };
export class AIError extends Error {}
export function isAIConfigured() { return Boolean(process.env.DEEPSEEK_API_KEY?.trim()); }
let selection: Promise<string> | undefined;
let activeModel: string | undefined;

// Current DeepSeek ids. deepseek-chat and deepseek-reasoner were retired in July 2026.
export const DEFAULT_PRO_MODEL = "deepseek-v4-pro";
const retiredModels: Record<string, string> = {
  "deepseek-chat": DEFAULT_PRO_MODEL,
  "deepseek-reasoner": DEFAULT_PRO_MODEL,
};

export function resolveModelId(id: string | undefined | null) {
  const trimmed = id?.trim();
  if (!trimmed) return undefined;
  return retiredModels[trimmed] ?? trimmed;
}

export function getActiveModel() { return resolveModelId(process.env.DEEPSEEK_MODEL) || activeModel; }
function baseURL() {
  const url = new URL(process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com");
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new AIError("Invalid AI server configuration.");
  return url.toString().replace(/\/$/, "");
}
async function request(path: string, body?: unknown): Promise<any> {
  if (!isAIConfigured()) throw new AIError("DeepSeek is not configured.");
  try {
    const response = await fetch(`${baseURL()}${path}`, {
      method: body ? "POST" : "GET", redirect: "error", signal: AbortSignal.timeout(30_000),
      headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new AIError(`DeepSeek request failed (HTTP ${response.status}).`);
    return await response.json();
  } catch (error) {
    if (error instanceof AIError) throw error;
    throw new AIError("DeepSeek is unavailable or timed out.");
  }
}
export async function selectModel(): Promise<string> {
  if (!isAIConfigured()) throw new AIError("DeepSeek is not configured.");
  const override = resolveModelId(process.env.DEEPSEEK_MODEL);
  if (override) {
    if (activeModel !== override) console.info("DeepSeek model:", override);
    return activeModel = override;
  }
  selection ??= (async () => {
    let model = DEFAULT_PRO_MODEL;
    try {
      const result = await request("/models");
      const named = (Array.isArray(result.data) ? result.data : [])
        .filter((m: any) => typeof m.id === "string");
      const rank = (rows: any[]) => rows.sort((a: any, b: any) => (Number(b.created) || 0) - (Number(a.created) || 0) ||
        b.id.localeCompare(a.id, undefined, { numeric: true }));
      const pro = rank(named.filter((m: any) => /pro/i.test(m.id)));
      const flash = rank(named.filter((m: any) => /flash/i.test(m.id)));
      model = resolveModelId(pro[0]?.id || flash[0]?.id) || DEFAULT_PRO_MODEL;
    } catch { /* Discovery unavailable: use the current Pro model. */ }
    console.info("DeepSeek model:", model);
    return activeModel = model;
  })();
  return selection;
}

export async function generateJSON<T>(input: Request, validate: (value: unknown) => T): Promise<{ value: T; model: string }> {
  const model = await selectModel();
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await request("/chat/completions", {
      model, response_format: { type: "json_object" }, max_tokens: 4096,
      // Thinking is on unless disabled, and then the JSON is not in message.content.
      thinking: { type: "disabled" },
      messages: [
        { role: "system", content: `${input.systemPrompt}\nReturn only JSON matching this example schema:\n${JSON.stringify(input.exampleSchema)}` },
        { role: "user", content: input.userPrompt + (attempt ? "\nPrevious output was invalid. Return complete JSON with all required fields and obey all length limits." : "") },
      ],
    });
    try {
      // Deliberately ignore reasoning_content and any tools supplied in the response.
      const content = response.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("Missing content");
      return { value: validate(JSON.parse(content)), model };
    } catch (error) {
      // Only structural diagnostics; never log prompts, provider content or credentials.
      const issues = (error as { issues?: { path?: unknown[] }[] })?.issues;
      console.warn("DeepSeek output validation failed", {
        attempt: attempt + 1, model,
        finishReason: response.choices?.[0]?.finish_reason,
        fields: Array.isArray(issues) ? issues.map(issue => issue.path?.join(".")) : ["json"],
      });
      if (attempt === 1) throw new AIError("DeepSeek returned invalid copy after retry.");
    }
  }
  throw new AIError("DeepSeek returned invalid copy.");
}
