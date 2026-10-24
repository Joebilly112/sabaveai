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

function createState(): SabaveState {
  // esbuild embeds the JSON in the server bundle: no production cwd/file lookup.
  const businesses = ListBusinessesResponse.parse(seedBusinesses).map(business => ({
    ...business, brandKit: { ...business.brandKit, pastPosterPath: business.brandKit.pastPosterPath ?? business.brandKit.posterPath },
  })) as Business[];

  return {
    businesses,
    forecasts: new Map(),
    alerts: [],
    drafts: [],
    logs: [],
  };
}

export function getStore(): SabaveState {
  globalThis.__sabaveAiState ??= createState();
  return globalThis.__sabaveAiState;
}

export function findBusiness(id: string): Business | undefined {
  return getStore().businesses.find((business) => business.id === id);
}
