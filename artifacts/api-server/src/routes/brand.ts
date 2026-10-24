import { Router, type IRouter } from "express";
import { AnalyzePosterBody, AnalyzeWebsiteBody } from "@workspace/api-zod";
import { analyzePoster, analyzeWebsite } from "../lib/brandAnalyzer";
import { findBusiness } from "../lib/store";
import { getUserById } from "../lib/users";
import { appendLog } from "../lib/activityLog";
import { parsePublicURL } from "../lib/websiteReader";

const router: IRouter = Router();
router.use("/brand", (req, res, next) => {
  if (!getUserById(req.header("x-user-id") ?? "u1")) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  next();
});
function log(req: import("express").Request, businessId: string | undefined, fallback: boolean, kind: "POSTER_ANALYZED" | "WEBSITE_ANALYZED") {
  const user = getUserById(req.header("x-user-id") ?? "u1")!;
  appendLog({ actor: user.name, role: user.role, businessId: businessId ?? "new-business",
    action: kind, details: { fallback } });
  if (fallback) appendLog({ actor: user.name, role: user.role, businessId: businessId ?? "new-business",
    action: "ANALYSIS_FALLBACK", details: { kind } });
}
router.post("/brand/analyze-poster", async (req, res) => {
  const parsed = AnalyzePosterBody.safeParse(req.body);
  if (!parsed.success || !parsed.data.description.trim()) { res.status(400).json({ error: "Provide 1–5 hex colours and a short poster description." }); return; }
  const { businessId, ...input } = parsed.data;
  if (businessId && !findBusiness(businessId)) { res.status(404).json({ error: "Business not found." }); return; }
  const result = await analyzePoster(input);
  log(req, businessId, result.fallback, "POSTER_ANALYZED");
  res.json(result);
});
router.post("/brand/analyze-website", async (req, res) => {
  const parsed = AnalyzeWebsiteBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Provide a website URL." }); return; }
  const { businessId, url } = parsed.data;
  if (businessId && !findBusiness(businessId)) { res.status(404).json({ error: "Business not found." }); return; }
  try { parsePublicURL(url); } catch { res.status(400).json({ error: "Use a public HTTP or HTTPS website, not a private/local address." }); return; }
  const result = await analyzeWebsite(url);
  log(req, businessId, result.fallback, "WEBSITE_ANALYZED");
  res.json(result);
});
export default router;
