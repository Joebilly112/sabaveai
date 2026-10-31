import { test } from "node:test";
import assert from "node:assert/strict";
import { ensureSeededStore, getStore } from "./store";
import { hazeSignal } from "../signals/hazeSignal";
import { evaluate } from "./triggerEngine";
import { campaignOptions } from "./campaignRules";
import { templateCopy } from "./copyGenerator";
import { findViolations } from "./neverSay";
import { updateDraft, decideDraft, CampaignError } from "./approvalService";
import { users } from "./users";
import type { CampaignDraft } from "./types";

ensureSeededStore();

const staff = users[0]!;
const owner = users[1]!;
function createDraft(): CampaignDraft {
  const business = getStore().businesses[0]!;
  const forecast = hazeSignal.simulate(business);
  const alert = evaluate(forecast, business, staff)!;
  const option = campaignOptions(business, alert, forecast)[0]!;
  const draft: CampaignDraft = {
    id: crypto.randomUUID(), businessId: business.id, alertId: alert.id,
    option, copy: templateCopy(business, option), budgetRM: 300,
    channels: ["facebook", "instagram"], status: "draft", createdBy: staff.id, history: [],
  };
  getStore().drafts.push(draft);
  return draft;
}
test("never-say handles phrases, case, hashtag boundaries and substring false positives", () => {
  assert.deepEqual(findViolations("A cheaper offer and secure service", ["cheap"]), []);
  assert.deepEqual(findViolations("#CURE and PROTECTS   YOUR LUNGS", []), ["cure", "protects your lungs"]);
  assert.deepEqual(findViolations("Try Butik Seri today", ["Butik Seri"]), ["Butik Seri"]);
});
test("failed submissions are atomic; terms and over-cap budgets are logged", () => {
  const draft = createDraft();
  const before = structuredClone(draft);
  assert.throws(() => updateDraft({ draftId: draft.id, copy: { ...draft.copy, caption_en: "A CURE" }, action: "submit" }, staff), CampaignError);
  assert.deepEqual(draft, before);
  assert.throws(() => updateDraft({ draftId: draft.id, budgetRM: 601 }, staff), CampaignError);
  assert.throws(() => updateDraft({ draftId: draft.id, budgetRM: -1 }, staff), CampaignError);
  assert.throws(() => updateDraft({ draftId: draft.id, offer: "kills germs", action: "submit" }, staff), CampaignError);
  assert.ok(getStore().logs.some(log => log.action === "NEVER_SAY_BLOCKED"));
  assert.ok(getStore().logs.some(log => log.action === "BUDGET_BLOCKED"));
});
test("staff submit; only owner rejects; rejected campaigns can be revised and resubmitted", async () => {
  const draft = createDraft();
  updateDraft({ draftId: draft.id, action: "submit" }, staff);
  await assert.rejects(decideDraft({ draftId: draft.id, decision: "approve" }, staff), { status: 403 });
  await assert.rejects(decideDraft({ draftId: draft.id, decision: "reject", reason: " " }, owner), { status: 400 });
  await decideDraft({ draftId: draft.id, decision: "reject", reason: "Revise offer" }, owner);
  assert.equal(draft.status, "rejected");
  updateDraft({ draftId: draft.id, offer: "RM2 off breakfast", action: "submit" }, staff);
  assert.equal(draft.status, "pending_approval");
  assert.equal(draft.rejectReason, undefined);
});
test("approval revalidates, publishes exactly once and freezes published drafts", async () => {
  const draft = createDraft();
  updateDraft({ draftId: draft.id, action: "submit" }, staff);
  await assert.rejects(decideDraft({ draftId: draft.id, decision: "approve", budgetRM: 601 }, owner), { status: 400 });
  draft.copy.cta = "cure";
  await assert.rejects(decideDraft({ draftId: draft.id, decision: "approve" }, owner), { status: 400 });
  draft.copy.cta = "Contact us";
  const first = decideDraft({ draftId: draft.id, decision: "approve", budgetRM: 0 }, owner);
  await assert.rejects(decideDraft({ draftId: draft.id, decision: "approve" }, owner), { status: 409 });
  await first;
  assert.equal(draft.status, "published");
  assert.deepEqual(draft.publishResult?.platforms, ["facebook", "instagram"]);
  assert.equal(draft.publishResult?.adId, undefined);
  assert.equal(draft.history.filter(item => item.action === "PUBLISHED").length, 1);
  assert.throws(() => updateDraft({ draftId: draft.id, budgetRM: 5 }, staff), { status: 409 });
});
