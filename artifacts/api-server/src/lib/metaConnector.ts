import { randomInt } from "node:crypto";
import type { Business, CampaignDraft, PublishResult } from "./types";

export interface SocialConnector {
  publishPost(draft: CampaignDraft, business: Business): Promise<PublishResult>;
  createAd(draft: CampaignDraft, business: Business, budgetRM: number): Promise<{ adId: string }>;
}
const fakeId = (prefix: string) => `${prefix}_${randomInt(100000, 1000000)}`;

export class MockMetaConnector implements SocialConnector {
  async publishPost(draft: CampaignDraft, _business: Business): Promise<PublishResult> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const platforms = draft.channels.filter(channel => channel === "facebook" || channel === "instagram");
    const postIds = Object.fromEntries(platforms.map(channel =>
      [channel, fakeId(channel === "facebook" ? "fb_post" : "ig_post")]));
    return { platforms, postIds, status: "published (simulated)", publishedAt: new Date().toISOString() };
  }
  async createAd(_draft: CampaignDraft, _business: Business, _budgetRM: number) {
    return { adId: fakeId("ad") };
  }
}

// Reusable Orbyte connector: replace this factory with a real Graph API adapter later.
// No Meta API calls, credentials, payments or real ad spend occur in this mock.
export function getConnector(): SocialConnector { return new MockMetaConnector(); }
