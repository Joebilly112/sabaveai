import { appendLog } from "./activityLog";
import { findBusiness, getStore } from "./store";
import { findViolations } from "./neverSay";
import { getConnector } from "./metaConnector";
import type { CampaignCopy, CampaignDraft, Channel, User } from "./types";

export class CampaignError extends Error {
  constructor(public status: number, message: string, public violations?: string[]) { super(message); }
}
declare global { var __sabavePublishing: Set<string> | undefined; }
const publishing = () => globalThis.__sabavePublishing ??= new Set<string>();

export function record(draft: CampaignDraft, user: User, action: Parameters<typeof appendLog>[0]["action"], details: Record<string, unknown> = {}) {
  draft.history.push({ at: new Date().toISOString(), by: user.id, action });
  appendLog({ actor: user.name, role: user.role, businessId: draft.businessId, action,
    details: { draftId: draft.id, signalId: draft.option.signalId, ...details } });
}
function getDraft(id: string): CampaignDraft {
  const draft = getStore().drafts.find(item => item.id === id);
  if (!draft) throw new CampaignError(404, "Draft not found.");
  return draft;
}
function checkBudget(draft: CampaignDraft, user: User) {
  const cap = findBusiness(draft.businessId)!.brandKit.monthlyAdBudgetCapRM;
  if (!Number.isFinite(draft.budgetRM) || draft.budgetRM < 0 || draft.budgetRM > cap) {
    appendLog({ actor: user.name, role: user.role, businessId: draft.businessId,
      action: "BUDGET_BLOCKED", details: { draftId: draft.id, signalId: draft.option.signalId, budgetRM: draft.budgetRM, cap } });
    throw new CampaignError(400, `Budget must be between RM0 and RM${cap}.`);
  }
}
function checkPublishable(draft: CampaignDraft, user: User) {
  const business = findBusiness(draft.businessId)!;
  const text = [draft.copy.headline, draft.copy.caption_bm, draft.copy.caption_en,
    ...draft.copy.hashtags, draft.copy.cta, draft.option.offer].join("\n");
  const violations = findViolations(text, business.brandKit.neverSay);
  if (violations.length) {
    appendLog({ actor: user.name, role: user.role, businessId: draft.businessId,
      action: "NEVER_SAY_BLOCKED", details: { draftId: draft.id, signalId: draft.option.signalId, violations } });
    throw new CampaignError(400, `Remove blocked terms: ${violations.join(", ")}.`, violations);
  }
  if (![draft.copy.headline, draft.copy.caption_bm, draft.copy.caption_en, draft.copy.cta, draft.option.offer].every(value => value.trim())) {
    throw new CampaignError(400, "Headline, both captions, CTA and offer are required.");
  }
  if (!draft.channels.length || draft.channels.some(channel =>
    !["facebook", "instagram"].includes(channel) || !business.brandKit.channels.includes(channel))) {
    throw new CampaignError(400, "Choose an available Facebook or Instagram channel. WhatsApp and TikTok are coming soon.");
  }
}

export function updateDraft(input: {
  draftId: string; copy?: CampaignCopy; offer?: string; budgetRM?: number;
  channels?: Channel[]; action?: "submit";
}, user: User): CampaignDraft {
  const draft = getDraft(input.draftId);
  if (publishing().has(draft.id) || !["draft", "rejected"].includes(draft.status)) {
    throw new CampaignError(409, "Only draft or rejected campaigns can be edited or submitted.");
  }
  // Validate a detached candidate first; failed requests never partially overwrite a draft.
  const candidate = structuredClone(draft);
  if (input.copy) candidate.copy = { ...input.copy, source: "template" };
  if (input.offer !== undefined) candidate.option.offer = input.offer;
  if (input.budgetRM !== undefined) candidate.budgetRM = input.budgetRM;
  if (input.channels) candidate.channels = [...new Set(input.channels)];
  checkBudget(candidate, user);
  if (input.action === "submit") checkPublishable(candidate, user);
  const edited = input.copy !== undefined || input.offer !== undefined || input.budgetRM !== undefined || input.channels !== undefined;
  candidate.status = input.action === "submit" ? "pending_approval" : "draft";
  delete candidate.rejectReason;
  Object.assign(draft, candidate);
  delete draft.rejectReason;
  if (edited) record(draft, user, "DRAFT_EDITED");
  if (input.action === "submit") record(draft, user, "SUBMITTED_FOR_APPROVAL");
  else if (!edited) record(draft, user, "DRAFT_EDITED", { reopened: true });
  return draft;
}

export async function decideDraft(input: {
  draftId: string; decision: "approve" | "reject"; budgetRM?: number; reason?: string;
}, user: User): Promise<CampaignDraft> {
  const draft = getDraft(input.draftId);
  if (user.role !== "owner") {
    appendLog({ actor: user.name, role: user.role, businessId: draft.businessId,
      action: "ACTION_DENIED", details: { draftId: draft.id, signalId: draft.option.signalId, decision: input.decision } });
    throw new CampaignError(403, "Only the Owner can approve or reject campaigns.");
  }
  if (draft.status !== "pending_approval" || publishing().has(draft.id)) {
    throw new CampaignError(409, "This draft is not awaiting approval, or publishing is already in progress.");
  }
  if (input.decision === "reject") {
    if (!input.reason?.trim()) throw new CampaignError(400, "A rejection reason is required.");
    draft.status = "rejected";
    draft.rejectReason = input.reason.trim();
    record(draft, user, "REJECTED", { reason: draft.rejectReason });
    return draft;
  }
  const candidate = structuredClone(draft);
  if (input.budgetRM !== undefined) candidate.budgetRM = input.budgetRM;
  checkBudget(candidate, user);
  checkPublishable(candidate, user);
  publishing().add(draft.id);
  try {
    const connector = getConnector();
    const business = findBusiness(draft.businessId)!;
    const result = await connector.publishPost(candidate, business);
    if (candidate.budgetRM > 0) result.adId = (await connector.createAd(candidate, business, candidate.budgetRM)).adId;
    draft.budgetRM = candidate.budgetRM;
    draft.approvedBy = user.id;
    record(draft, user, "APPROVED", { budgetRM: draft.budgetRM });
    draft.publishResult = result;
    draft.status = "published";
    record(draft, user, "PUBLISHED", { ...result, budgetRM: draft.budgetRM });
    return draft;
  } finally {
    publishing().delete(draft.id);
  }
}
