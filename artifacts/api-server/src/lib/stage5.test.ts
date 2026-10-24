import { test } from "node:test";
import assert from "node:assert/strict";
import { isPublicIP, parsePublicURL, extractWebsiteText } from "./websiteReader";
import { analyzePoster, analyzeWebsite } from "./brandAnalyzer";
import { parseBusiness, validateImage } from "./brandValidation";
import { getStore } from "./store";
import type { generateJSON } from "./llm";
import { hazeSignal } from "../signals/hazeSignal";

test("seed data and offline forecasts do not depend on process cwd", async () => {
  assert.equal(getStore().businesses.length, 3);
  assert.ok(getStore().businesses[0].brandKit.pastPosterPath);
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("network off"); };
  try {
    const result = await hazeSignal.fetchForecast(getStore().businesses[0]);
    assert.equal(result.source, "offline");
    assert.equal(result.days.length, 5);
  } finally { globalThis.fetch = original; }
});
test("website URL and IP safety rejects private, mapped, encoded and special-use addresses", () => {
  for (const address of ["127.0.0.1", "10.0.0.1", "172.31.1.2", "192.168.2.1", "169.254.169.254",
    "100.64.0.1", "0.0.0.0", "224.0.0.1", "::1", "fc00::1", "::ffff:127.0.0.1", "2001:db8::1", "2001:20::1", "2002:7f00:1::"]) {
    assert.equal(isPublicIP(address), false, address);
  }
  for (const url of ["file:///etc/passwd", "http://localhost", "http://2130706433", "http://0x7f000001", "http://[::1]", "https://user:pass@example.com", "http://example.com:8080"]) {
    assert.throws(() => parsePublicURL(url), url);
  }
  assert.equal(isPublicIP("8.8.8.8"), true);
  assert.equal(isPublicIP("2606:4700:4700::1111"), true);
  assert.equal(parsePublicURL("https://example.com").hostname, "example.com");
});
test("website extraction strips scripts, styles and tags, limits visible context", () => {
  const text = extractWebsiteText(`<html><head><title>Warm &amp; Local</title><meta content="Family cafe" name="description"></head><style>hidden style</style><script>secret script</script><p>Fresh breakfast</p>${"a".repeat(5000)}</html>`);
  assert.match(text, /Title: Warm & Local/);
  assert.match(text, /Description: Family cafe/);
  assert.match(text, /Fresh breakfast/);
  assert.ok(!text.includes("secret script"));
  assert.ok(!text.includes("hidden style"));
  assert.ok(text.length < 4500);
});
test("analysis fallbacks are deterministic; successful analysis sends only text", async () => {
  const fail: typeof generateJSON = async () => { throw new Error("offline"); };
  const input = { colours: ["#B45309"], description: "Warm breakfast poster", toneChips: ["family"] };
  const fallback = await analyzePoster(input, fail);
  assert.equal(fallback.fallback, true);
  assert.match(fallback.summary, /#B45309.*family.*Warm breakfast poster/);
  const website = await analyzeWebsite("https://example.com", async () => { throw new Error("blocked"); }, fail);
  assert.deepEqual(website, { fallback: true });
  const success: typeof generateJSON = async (request, validate) => {
    assert.ok(!request.userPrompt.includes("data:image"));
    return { value: validate({ layout: "Centered", typographyStyle: "Bold", tone: "Warm", summary: "Warm family style" }), model: "test" };
  };
  assert.equal((await analyzePoster(input, success)).fallback, false);
});
test("business input bounds, images and atomic parse validation", () => {
  const business = getStore().businesses[0];
  assert.equal(parseBusiness(business).name, business.name);
  for (const input of [
    { ...business, lat: 91 },
    { ...business, name: " " },
    { ...business, brandKit: { ...business.brandKit, products: [] } },
    { ...business, brandKit: { ...business.brandKit, monthlyAdBudgetCapRM: -1 } },
    { ...business, brandKit: { ...business.brandKit, lastBadWeatherDipPct: 101 } },
  ]) assert.throws(() => parseBusiness(input));
  assert.throws(() => validateImage("data:image/svg+xml;base64," + Buffer.from("<svg onload='alert(1)'/>").toString("base64")));
  assert.throws(() => validateImage("data:image/png;base64,YWJjZA=="));
  assert.throws(() => validateImage("data:image/png;base64," + Buffer.alloc(2 * 1024 * 1024 + 1).toString("base64")));
});
