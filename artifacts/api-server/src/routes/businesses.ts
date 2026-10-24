import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { ListBusinessesResponse } from "@workspace/api-zod";
import { getStore, findBusiness } from "../lib/store";
import { getUserById } from "../lib/users";
import { appendLog } from "../lib/activityLog";
import { parseBusiness } from "../lib/brandValidation";

const router: IRouter = Router();

router.get("/businesses", (_req, res) => {
  const businesses = ListBusinessesResponse.parse(getStore().businesses);
  res.json(businesses);
});
router.get("/businesses/:id", (req, res) => {
  const business = findBusiness(req.params.id);
  if (!business) { res.status(404).json({ error: "Business not found." }); return; }
  res.json(business);
});
router.post("/businesses", (req, res) => {
  const user = getUserById(req.header("x-user-id") ?? "u1");
  if (!user) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  try {
    const input = parseBusiness(req.body);
    const id = randomUUID();
    const business = { ...input, id, socialPages: { facebookPageId: `demo_fb_${id}`, instagramHandle: "@demo_business" } };
    getStore().businesses.push(business);
    appendLog({ actor: user.name, role: user.role, businessId: id, action: "BRAND_KIT_CREATED", details: { name: business.name } });
    res.json(business);
  } catch (error) { res.status(400).json({ error: error instanceof Error && error.name !== "ZodError" ? error.message : "Check the required fields, colours, product prices, budget and sales values." }); }
});
router.patch("/businesses/:id", (req, res) => {
  const user = getUserById(req.header("x-user-id") ?? "u1");
  if (!user) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  const business = findBusiness(req.params.id);
  if (!business) { res.status(404).json({ error: "Business not found." }); return; }
  try {
    const input = parseBusiness(req.body);
    const old = business.brandKit;
    // Preserve seed images when omitted; explicit empty data URLs remove an image.
    input.brandKit.logoPath = input.brandKit.logoDataUrl === "" ? undefined : old.logoPath;
    input.brandKit.pastPosterPath = input.brandKit.pastPosterDataUrl === "" ? undefined : old.pastPosterPath;
    Object.assign(business, input);
    getStore().forecasts.delete(`${business.id}:haze`);
    getStore().forecasts.delete(`${business.id}:rain`);
    appendLog({ actor: user.name, role: user.role, businessId: business.id, action: "BRAND_KIT_UPDATED", details: { name: business.name } });
    res.json(business);
  } catch (error) { res.status(400).json({ error: error instanceof Error && error.name !== "ZodError" ? error.message : "Check the required fields, colours, product prices, budget and sales values." }); }
});

export default router;
