export type Role = "staff" | "owner";
export type SignalId = "haze" | "rain";
export type BusinessType = "cafe" | "laundromat" | "retail" | "other";
export type Channel = "facebook" | "instagram" | "whatsapp" | "tiktok";
export type Language = "bm" | "en" | "both";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Product {
  name: string;
  priceRM: number;
}

export interface BrandKit {
  logoPath?: string;
  logoDataUrl?: string;
  brandColours: string[];
  pastPosterPath?: string;
  pastPosterDataUrl?: string;
  posterColours?: string[];
  posterDescription?: string;
  posterStyleSummary?: string;
  websiteUrl?: string;
  websiteVoiceSummary?: string;
  ethos: string;
  toneChips: string[];
  products: Product[];
  targetCustomers: string;
  delivery: boolean;
  channels: Channel[];
  language: Language;
  neverSay: string[];
  monthlyAdBudgetCapRM: number;
  approverUserId: string;
  baselineWeeklySalesRM: number;
  lastBadWeatherDipPct: number;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  city: string;
  lat: number;
  lon: number;
  socialPages: {
    facebookPageId: string;
    instagramHandle: string;
  };
  brandKit: BrandKit;
}

export interface SignalDay {
  date: string;
  value: number;
  unit: string;
  level: 0 | 1 | 2 | 3;
  levelLabel: string;
  detail?: string;
}

export interface SignalForecast {
  signalId: SignalId;
  businessId: string;
  days: SignalDay[];
  source: "open-meteo" | "simulated" | "offline";
  fetchedAt: string;
}

export interface WeatherAlert {
  id: string;
  businessId: string;
  signalId: SignalId;
  affectedDates: string[];
  peakDate: string;
  peakLevelLabel: string;
  daysAhead: number;
  createdAt: string;
  open: boolean;
}

export interface CampaignOption {
  id: string;
  signalId: SignalId;
  kind: string;
  title: string;
  description: string;
  reason: string;
  offer: string;
  suggestedBudgetRM: number;
}

export interface CampaignCopy {
  headline: string;
  caption_bm: string;
  caption_en: string;
  hashtags: string[];
  cta: string;
  rationale: string;
  source: "ai" | "template";
  model?: string;
  fallbackReason?: string;
}

export type DraftStatus =
  | "draft"
  | "pending_approval"
  | "published"
  | "rejected";

export interface PublishResult {
  platforms: string[];
  postIds: Record<string, string>;
  adId?: string;
  status: "published (simulated)";
  publishedAt: string;
}

export interface CampaignDraft {
  id: string;
  businessId: string;
  alertId: string;
  option: CampaignOption;
  copy: CampaignCopy;
  budgetRM: number;
  channels: Channel[];
  status: DraftStatus;
  createdBy: string;
  approvedBy?: string;
  rejectReason?: string;
  publishResult?: PublishResult;
  history: { at: string; by: string; action: string }[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  businessId: string;
  action:
    | "FORECAST_CHECKED"
    | "SIGNAL_SIMULATED"
    | "ALERT_TRIGGERED"
    | "OPTION_SELECTED"
    | "DRAFT_GENERATED"
    | "DRAFT_EDITED"
    | "NEVER_SAY_BLOCKED"
    | "SUBMITTED_FOR_APPROVAL"
    | "APPROVED"
    | "REJECTED"
    | "PUBLISHED"
    | "BUDGET_BLOCKED"
    | "ACTION_DENIED"
    | "BRAND_KIT_CREATED"
    | "BRAND_KIT_UPDATED"
    | "POSTER_ANALYZED"
    | "WEBSITE_ANALYZED"
    | "ANALYSIS_FALLBACK"
    | "AI_FALLBACK";
  details: Record<string, unknown>;
}
