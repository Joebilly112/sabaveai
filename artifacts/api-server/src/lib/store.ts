import seedBusinesses from "../../../../data/businesses.json";
import { ListBusinessesResponse } from "@workspace/api-zod";
import type {
  Business,
  CampaignDraft,
  LogEntry,
  SignalForecast,
  WeatherAlert,
} from "./types";

interface SabaveState {
  businesses: Business[];
  forecasts: Map<string, SignalForecast>;
  alerts: WeatherAlert[];
  drafts: CampaignDraft[];
  logs: LogEntry[];
}

declare global {
  var __sabaveAiState: SabaveState | undefined;
}

function autoseedEnabled() {
  const flag = process.env.SABAVE_AUTOSEED?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes" || flag === "on";
}

function readSeedBusinesses(): Business[] {
  // esbuild embeds the JSON in the server bundle: no production cwd/file lookup.
  return ListBusinessesResponse.parse(seedBusinesses).map(business => ({
    ...business,
    onboardingCompleted: business.onboardingCompleted ?? true,
    onboardingStep: business.onboardingStep ?? 8,
    brandKit: { ...business.brandKit, pastPosterPath: business.brandKit.pastPosterPath ?? business.brandKit.posterPath },
  })) as Business[];
}

function createState(): SabaveState {
  // Default off so a login does not receive every sample shop. Set SABAVE_AUTOSEED=true to preload.
  return {
    businesses: autoseedEnabled() ? readSeedBusinesses() : [],
    forecasts: new Map(),
    alerts: [],
    drafts: [],
    logs: [],
  };
}

/** Stage tests still need the fixture shops. Does not run on a normal server start. */
export function ensureSeededStore() {
  const store = getStore();
  if (store.businesses.length === 0) store.businesses.push(...readSeedBusinesses());
  return store;
}

export function getStore(): SabaveState {
  globalThis.__sabaveAiState ??= createState();
  return globalThis.__sabaveAiState;
}

export function findBusiness(id: string): Business | undefined {
  return getStore().businesses.find((business) => business.id === id);
}
