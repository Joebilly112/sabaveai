import { readFileSync } from "node:fs";
import { join } from "node:path";
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
  const seedPath = join(process.cwd(), "..", "..", "data", "businesses.json");
  const parsed: unknown = JSON.parse(readFileSync(seedPath, "utf8"));
  const businesses = ListBusinessesResponse.parse(parsed) as Business[];

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
