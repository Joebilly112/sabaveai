import type { Business, TeamMember, User } from "./types";

/** Usernames from the frontend demo presets. No passwords live here. */
const DEMO_ALIASES = new Set(["tan", "aisyah", "dobi", "butik"]);

export function isDemoUser(user: User): boolean {
  if (user.id === "u1" || user.id === "u2") return true;
  const name = user.name.trim().toLowerCase();
  const email = user.email?.trim().toLowerCase() ?? "";
  const local = email.includes("@") ? email.slice(0, email.indexOf("@")) : "";
  return DEMO_ALIASES.has(name) || DEMO_ALIASES.has(email) || DEMO_ALIASES.has(local);
}

export function memberMatches(member: Pick<TeamMember, "name" | "email">, user: User): boolean {
  const memberName = member.name.trim().toLowerCase();
  const userName = user.name.trim().toLowerCase();
  if (memberName && memberName === userName) return true;
  const email = user.email?.trim().toLowerCase();
  if (email && member.email.trim().toLowerCase() === email) return true;
  return false;
}

/** Owners see their own shop, including an unfinished setup. Staff see a shop only after setup is submitted and they are on the team. */
export function canAccessBusiness(business: Business, user: User): boolean {
  if (business.brandKit.approverUserId === user.id) return true;
  if (business.onboardingCompleted === false) return false;
  return (business.teamMembers ?? []).some((member) => memberMatches(member, user));
}

export function businessesToReset(user: User, businesses: Business[]): Business[] {
  const owned = businesses.filter((business) => business.brandKit.approverUserId === user.id);
  if (user.role === "owner" || owned.length > 0) return owned;
  return businesses.filter((business) => canAccessBusiness(business, user));
}
