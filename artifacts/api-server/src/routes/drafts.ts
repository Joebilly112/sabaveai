import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { GenerateDraftBody, UpdateDraftBody, DecideDraftBody } from "@workspace/api-zod";
import { findBusiness, getStore } from "../lib/store";
import { getUserById } from "../lib/users";
import { campaignOptions } from "../lib/campaignRules";
import { templateCopy } from "../lib/copyGenerator";
import { CampaignError, record, updateDraft, decideDraft } from "../lib/approvalService";
import { listLogs } from "../lib/activityLog";
import type { CampaignDraft } from "../lib/types";

const router: IRouter = Router();
router.use(["/generate", "/drafts", "/approve", "/log"], (req, res, next) => {
  if (!getUserById(req.header("x-user-id") ?? "u1")) {
    res.status(401).json({ error: "Unknown simulated user." });
    return;
  }
  next();
});

router.get("/drafts", (req, res) => {
  if (typeof req.query.businessId !== "string" || !findBusiness(req.query.businessId)) {
    res.status(404).json({ error: "Business not found." });
    return;
  }
  res.json(getStore().drafts.filter(draft => draft.businessId === req.query.businessId).slice().reverse());
});
router.get("/log", (req, res) => {
  if (req.query.businessId !== undefined && typeof req.query.businessId !== "string") {
    res.status(400).json({ error: "Invalid business filter." });
    return;
  }
  res.json(listLogs(req.query.businessId as string | undefined));
});
router.post("/generate", (req, res) => {
  const parsed = GenerateDraftBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Business, alert and option IDs are required." }); return; }
  const { businessId, alertId, optionId } = parsed.data;
  const business = findBusiness(businessId);
  const alert = getStore().alerts.find(item => item.id === alertId && item.businessId === businessId && item.open);
  if (!business || !alert) { res.status(404).json({ error: "Business or open alert not found." }); return; }
  const forecast = getStore().forecasts.get(`${businessId}:${alert.signalId}`);
  if (!forecast || !alert.affectedDates.every(date => forecast.days.some(day => day.date.slice(0, 10) === date && day.level >= 2))) {
    res.status(409).json({ error: "The forecast has changed. Check it again before preparing a campaign." }); return;
  }
  const option = campaignOptions(business, alert, forecast).find(item => item.id === optionId);
  if (!option) { res.status(404).json({ error: "Option does not belong to this alert." }); return; }
  const user = getUserById(req.header("x-user-id") ?? "u1")!;
  const draft: CampaignDraft = {
    id: randomUUID(), businessId, alertId, option: structuredClone(option),
    copy: templateCopy(business, option), budgetRM: option.suggestedBudgetRM,
    channels: business.brandKit.channels.filter(channel => channel === "facebook" || channel === "instagram"),
    status: "draft", createdBy: user.id, history: [],
  };
  getStore().drafts.push(draft);
  record(draft, user, "OPTION_SELECTED", { optionId });
  record(draft, user, "DRAFT_GENERATED", { source: "template" });
  res.json(draft);
});
router.patch("/drafts", (req, res, next) => {
  const parsed = UpdateDraftBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid draft fields." }); return; }
  try { res.json(updateDraft(parsed.data, getUserById(req.header("x-user-id") ?? "u1")!)); }
  catch (error) { next(error); }
});
router.post("/approve", async (req, res, next) => {
  const parsed = DecideDraftBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid approval decision." }); return; }
  try { res.json(await decideDraft(parsed.data, getUserById(req.header("x-user-id") ?? "u1")!)); }
  catch (error) { next(error); }
});
router.use(((error, _req, res, next) => {
  if (error instanceof CampaignError) {
    res.status(error.status).json({ error: error.message, violations: error.violations });
  } else next(error);
}) as import("express").ErrorRequestHandler);
export default router;
