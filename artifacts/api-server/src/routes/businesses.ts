import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { AddTeamMemberBody, ListBusinessesResponse, SignupOwnerBody } from "@workspace/api-zod";
import { getStore, findBusiness } from "../lib/store";
import { getUserById, registerUser } from "../lib/users";
import { appendLog } from "../lib/activityLog";
import { assertEmail, parseBusiness } from "../lib/brandValidation";
import { businessesToReset, canAccessBusiness, isDemoUser } from "../lib/access";
import type { Business, TeamMember, User } from "../lib/types";

const router: IRouter = Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireUser(header: string | undefined) {
  if (!header?.trim()) return undefined;
  return getUserById(header);
}

function visibleBusiness(user: User, id: string) {
  const business = findBusiness(id);
  if (!business || !canAccessBusiness(business, user)) return undefined;
  return business;
}

function emptyBusiness(name: string, ownerId: string, ownerName: string, email: string): Business {
  const id = `b_${randomUUID()}`;
  const owner: TeamMember = {
    id: `tm_${randomUUID()}`,
    name: ownerName,
    email,
    role: "owner",
    invited: false,
  };
  return {
    id,
    name,
    // Placeholder so the response schema stays valid before step 1. The wizard
    // treats type as unanswered until onboardingStep is at least 1.
    type: "cafe",
    city: "",
    lat: 0,
    lon: 0,
    onboardingCompleted: false,
    onboardingStep: 0,
    teamMembers: [owner],
    socialPages: { facebookPageId: "", instagramHandle: "" },
    brandKit: {
      brandColours: ["#0F7A5C"],
      ethos: "",
      toneChips: [],
      products: [],
      targetCustomers: "",
      delivery: false,
      channels: [],
      language: "both",
      neverSay: [],
      monthlyAdBudgetCapRM: 0,
      approverUserId: ownerId,
    },
  };
}

router.post("/signup", (req, res) => {
  const parsed = SignupOwnerBody.safeParse(req.body);
  const name = parsed.success ? parsed.data.name.trim() : "";
  const businessName = parsed.success ? parsed.data.businessName.trim() : "";
  const email = parsed.success ? parsed.data.email.trim().toLowerCase() : "";
  if (!parsed.success || !name || !businessName || !EMAIL.test(email)) {
    res.status(400).json({ error: "Name, business name and a valid email are required." });
    return;
  }
  try {
    const user = registerUser({ id: `u_${randomUUID()}`, name, role: "owner", email });
    const business = emptyBusiness(businessName, user.id, name, email);
    getStore().businesses.push(business);
    res.json({ user: { id: user.id, name: user.name, role: user.role, email: user.email }, business });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Could not create the account." });
  }
});

router.get("/businesses", (req, res) => {
  const user = requireUser(req.header("x-user-id"));
  if (!user) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  const businesses = ListBusinessesResponse.parse(getStore().businesses.filter((business) => canAccessBusiness(business, user)));
  res.json(businesses);
});
router.get("/businesses/:id", (req, res) => {
  const user = requireUser(req.header("x-user-id"));
  if (!user) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  const business = visibleBusiness(user, req.params.id);
  if (!business) { res.status(404).json({ error: "Business not found." }); return; }
  res.json(business);
});
router.post("/businesses", (req, res) => {
  const user = requireUser(req.header("x-user-id"));
  if (!user) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  try {
    const input = parseBusiness(req.body);
    input.brandKit.approverUserId = user.id;
    if (input.onboardingCompleted === false) {
      const existing = getStore().businesses.find((business) =>
        business.brandKit.approverUserId === user.id && business.onboardingCompleted === false);
      if (existing) { res.json(existing); return; }
    }
    const id = randomUUID();
    const business = { ...input, id, socialPages: { facebookPageId: `demo_fb_${id}`, instagramHandle: "@demo_business" } };
    getStore().businesses.push(business);
    appendLog({ actor: user.name, role: user.role, businessId: id, action: "BRAND_KIT_CREATED", details: { name: business.name } });
    res.json(business);
  } catch (error) { res.status(400).json({ error: error instanceof Error && error.name !== "ZodError" ? error.message : "Check the required fields, colours, product prices, budget and sales values." }); }
});
router.post("/demo/reset", (req, res) => {
  const user = requireUser(req.header("x-user-id"));
  if (!user) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  if (!isDemoUser(user)) { res.status(403).json({ error: "Reset is only available for demo accounts." }); return; }
  const store = getStore();
  const targets = businessesToReset(user, store.businesses);
  const ids = new Set(targets.map((business) => business.id));
  store.businesses = store.businesses.filter((business) => !ids.has(business.id));
  store.drafts = store.drafts.filter((draft) => !ids.has(draft.businessId));
  store.alerts = store.alerts.filter((alert) => !ids.has(alert.businessId));
  store.logs = store.logs.filter((entry) => !ids.has(entry.businessId));
  for (const key of [...store.forecasts.keys()]) {
    const businessId = key.slice(0, key.lastIndexOf(":"));
    if (ids.has(businessId)) store.forecasts.delete(key);
  }
  res.json({ reset: true, removed: ids.size });
});
router.patch("/businesses/:id", (req, res) => {
  const user = requireUser(req.header("x-user-id"));
  if (!user) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  const business = visibleBusiness(user, req.params.id);
  if (!business) { res.status(404).json({ error: "Business not found." }); return; }
  try {
    const input = parseBusiness(req.body);
    const old = business.brandKit;
    const wasComplete = business.onboardingCompleted !== false;
    const finishing = input.onboardingCompleted === true && business.onboardingCompleted === false;
    // Preserve seed images when omitted; explicit empty data URLs remove an image.
    input.brandKit.logoPath = input.brandKit.logoDataUrl === "" ? undefined : old.logoPath;
    input.brandKit.pastPosterPath = input.brandKit.pastPosterDataUrl === "" ? undefined : old.pastPosterPath;
    if ((!input.brandKit.menuItems || input.brandKit.menuItems.length === 0) && input.brandKit.products.length === 0) {
      input.brandKit.products = old.products;
      input.brandKit.menuItems = old.menuItems;
    }
    const previousCompleted = business.onboardingCompleted;
    const previousStep = business.onboardingStep;
    const previousTeam = business.teamMembers;
    const approverUserId = old.approverUserId;
    Object.assign(business, input);
    business.brandKit.approverUserId = approverUserId;
    if (input.onboardingCompleted === undefined) business.onboardingCompleted = previousCompleted;
    if (input.onboardingStep === undefined) business.onboardingStep = previousStep;
    if (input.teamMembers === undefined) business.teamMembers = previousTeam;
    getStore().forecasts.delete(`${business.id}:haze`);
    getStore().forecasts.delete(`${business.id}:rain`);
    if (finishing) {
      appendLog({
        actor: user.name,
        role: user.role,
        businessId: business.id,
        action: "BRAND_KIT_UPDATED",
        details: { name: business.name, message: `Owner completed setup for ${business.name}` },
      });
    } else if (wasComplete) {
      appendLog({ actor: user.name, role: user.role, businessId: business.id, action: "BRAND_KIT_UPDATED", details: { name: business.name } });
    }
    res.json(business);
  } catch (error) { res.status(400).json({ error: error instanceof Error && error.name !== "ZodError" ? error.message : "Check the required fields, colours, product prices, budget and sales values." }); }
});

router.post("/businesses/:id/team", (req, res) => {
  const user = requireUser(req.header("x-user-id"));
  if (!user) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  const business = visibleBusiness(user, req.params.id);
  if (!business) { res.status(404).json({ error: "Business not found." }); return; }
  const parsed = AddTeamMemberBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Name, email and role are required." }); return; }
  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim().toLowerCase();
  const role = parsed.data.role;
  if (!name) { res.status(400).json({ error: "Name and role are required." }); return; }
  try { assertEmail(email); } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Enter a valid email address." }); return; }
  const team = business.teamMembers ?? [];
  if (team.length >= 30) { res.status(400).json({ error: "This team is full." }); return; }
  const member: TeamMember = { id: `tm_${randomUUID()}`, name, email, role, invited: true };
  business.teamMembers = [...team, member];
  res.json(business.teamMembers);
});

router.delete("/businesses/:id/team/:memberId", (req, res) => {
  const user = requireUser(req.header("x-user-id"));
  if (!user) { res.status(401).json({ error: "Unknown simulated user." }); return; }
  const business = visibleBusiness(user, req.params.id);
  if (!business) { res.status(404).json({ error: "Business not found." }); return; }
  const team = business.teamMembers ?? [];
  const member = team.find((item) => item.id === req.params.memberId);
  if (!member) { res.status(404).json({ error: "Team member not found." }); return; }
  if (!member.invited && member.role === "owner") {
    res.status(400).json({ error: "The account owner cannot be removed." });
    return;
  }
  business.teamMembers = team.filter((item) => item.id !== member.id);
  res.json(business.teamMembers);
});

export default router;
