import { test } from "node:test";
import assert from "node:assert/strict";
import { aiCopySchema, generateCopy, templateCopy } from "./copyGenerator";
import { generateJSON, AIError, isAIConfigured } from "./llm";
import { getStore } from "./store";
import { users } from "./users";
import { hazeSignal } from "../signals/hazeSignal";
import { evaluate } from "./triggerEngine";
import { campaignOptions } from "./campaignRules";

const business = getStore().businesses[0]!;
const user = users[0]!;
const forecast = hazeSignal.simulate(business);
const alert = evaluate(forecast, business, user)!;
const option = campaignOptions(business, alert, forecast)[0]!;
const valid = { headline: "Breakfast for the family", caption_bm: "Pesan sarapan kegemaran anda hari ini.",
  caption_en: "Order your favourite breakfast today.", hashtags: ["#Malaysia", "#Kopitiam", "#Sarapan"],
  cta: "Order now", rationale: "Warm copy reflects this family brand." };

test("AI schema enforces bilingual fields, length and hashtag limits", () => {
  assert.ok(aiCopySchema.safeParse(valid).success);
  for (const value of [{ ...valid, headline: "one ".repeat(9) }, { ...valid, caption_bm: "" },
    { ...valid, caption_en: "word ".repeat(61) }, { ...valid, hashtags: ["#one"] }]) {
    assert.equal(aiCopySchema.safeParse(value).success, false);
  }
});
test("copy retry rejects never-say and allowlists business data only", async () => {
  let calls = 0;
  const fake: typeof generateJSON = async (input, validate) => {
    assert.ok(!input.userPrompt.includes("logoPath"));
    assert.ok(!input.userPrompt.includes("facebookPageId"));
    assert.ok(!input.userPrompt.includes("monthlyAdBudgetCapRM"));
    calls++;
    if (calls === 2) assert.match(input.userPrompt, /Rewrite without/);
    return { value: validate(calls === 1 ? { ...valid, cta: "cure" } : valid), model: "test-pro" };
  };
  const result = await generateCopy(business, alert, option, user, fake);
  assert.equal(calls, 2);
  assert.equal(result.source, "ai");
  assert.equal(result.model, "test-pro");
});
test("repeated forbidden output and provider errors fall back explicitly", async () => {
  const bad: typeof generateJSON = async (_input, validate) => ({ value: validate({ ...valid, cta: "cure" }), model: "test-pro" });
  const blocked = await generateCopy(business, alert, option, user, bad);
  assert.equal(blocked.source, "template");
  assert.match(blocked.fallbackReason!, /blocked terms/);
  const failed = await generateCopy(business, alert, option, user, async () => { throw new AIError("DeepSeek is unavailable or timed out."); });
  assert.equal(failed.headline, templateCopy(business, option).headline);
  assert.match(failed.fallbackReason!, /timed out/);
  assert.ok(getStore().logs.some(log => log.action === "AI_FALLBACK"));
});
test("transport selects newest Pro, caches discovery, ignores reasoning, retries invalid JSON", { skip: !isAIConfigured() }, async () => {
  const original = globalThis.fetch;
  let discovery = 0, completions = 0;
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith("/models")) {
      discovery++;
      return Response.json({ data: [{ id: "old-pro", created: 1 }, { id: "new-pro", created: 2 }] });
    }
    completions++;
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, "new-pro");
    assert.equal(body.response_format.type, "json_object");
    assert.match(body.messages[0].content, /JSON/);
    return Response.json({ choices: [{ message: { reasoning_content: "Never parse this", content: completions === 1 ? "invalid" : JSON.stringify(valid) } }] });
  };
  try {
    const input = { systemPrompt: "Write copy", userPrompt: "Context", exampleSchema: valid };
    const first = await generateJSON(input, value => aiCopySchema.parse(value));
    assert.equal(first.model, "new-pro");
    await generateJSON(input, value => aiCopySchema.parse(value));
    assert.equal(discovery, 1);
    assert.equal(completions, 3);
    let invalidCalls = 0;
    globalThis.fetch = async () => {
      invalidCalls++;
      return Response.json({ choices: [{ message: { content: "{}" } }] });
    };
    await assert.rejects(generateJSON(input, value => aiCopySchema.parse(value)), /invalid copy after retry/);
    assert.equal(invalidCalls, 2);
    globalThis.fetch = async () => { throw new DOMException("timeout", "TimeoutError"); };
    await assert.rejects(generateJSON(input, value => aiCopySchema.parse(value)), /unavailable or timed out/);
  } finally { globalThis.fetch = original; }
});
