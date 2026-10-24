// Server-only DeepSeek transport. Never expose provider responses or credentials in errors.
type Request = { systemPrompt: string; userPrompt: string; exampleSchema: unknown };
export class AIError extends Error {}
export function isAIConfigured() { return Boolean(process.env.DEEPSEEK_API_KEY?.trim()); }
let selection: Promise<string> | undefined;
let activeModel: string | undefined;
export function getActiveModel() { return process.env.DEEPSEEK_MODEL?.trim() || activeModel; }
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
  const override = process.env.DEEPSEEK_MODEL?.trim();
  if (override) {
    if (activeModel !== override) console.info("DeepSeek model:", override);
    return activeModel = override;
  }
  selection ??= (async () => {
    let model = "deepseek-chat";
    try {
      const result = await request("/models");
      const candidates = (Array.isArray(result.data) ? result.data : [])
        .filter((m: any) => typeof m.id === "string" && /pro/i.test(m.id))
        .sort((a: any, b: any) => (Number(b.created) || 0) - (Number(a.created) || 0) ||
          b.id.localeCompare(a.id, undefined, { numeric: true }));
      model = candidates[0]?.id || model;
    } catch { /* Discovery unavailable: use the specified default chat model. */ }
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
