import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Business, SignalDay, SignalForecast } from "../lib/types";
import type { WeatherSignal } from "./signal";

interface AirQualityResponse {
  hourly?: {
    time?: string[];
    pm2_5?: (number | null)[];
  };
}

interface OfflineForecast {
  haze: number[];
}

function localDate(offset = 0): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  const year = Number(part("year"));
  const month = Number(part("month"));
  const day = Number(part("day"));
  return new Date(Date.UTC(year, month - 1, day + offset))
    .toISOString()
    .slice(0, 10);
}

function levelFor(value: number): SignalDay["level"] {
  if (value < 35) return 0;
  if (value <= 55) return 1;
  if (value <= 150) return 2;
  return 3;
}

function labelFor(level: SignalDay["level"]): string {
  return ["Good", "Moderate", "Unhealthy", "Very Unhealthy"][level];
}

function makeForecast(
  business: Business,
  values: number[],
  source: SignalForecast["source"],
): SignalForecast {
  const days = values.slice(0, 5).map((value, index) => {
    const level = levelFor(value);
    return {
      date: localDate(index),
      value: Math.round(value),
      unit: "µg/m³",
      level,
      levelLabel: labelFor(level),
    };
  });
  return {
    signalId: "haze",
    businessId: business.id,
    days,
    source,
    fetchedAt: new Date().toISOString(),
  };
}

function offlineValues(): number[] {
  const raw = JSON.parse(
    readFileSync(
      join(process.cwd(), "..", "..", "data", "offlineForecast.json"),
      "utf8",
    ),
  ) as OfflineForecast;
  return raw.haze;
}

function simulatedForecast(business: Business): SignalForecast {
  return makeForecast(business, [45, 90, 165, 120, 50], "simulated");
}

async function liveForecast(business: Business): Promise<SignalForecast> {
  const url = new URL(
    "https://air-quality-api.open-meteo.com/v1/air-quality",
  );
  url.search = new URLSearchParams({
    latitude: String(business.lat),
    longitude: String(business.lon),
    hourly: "pm2_5",
    forecast_days: "5",
    timezone: "Asia/Kuala_Lumpur",
  }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) {
    throw new Error(`Open-Meteo returned HTTP ${response.status}`);
  }
  const payload = (await response.json()) as AirQualityResponse;
  const times = payload.hourly?.time;
  const values = payload.hourly?.pm2_5;
  if (!times || !values || times.length !== values.length) {
    throw new Error("Open-Meteo returned an incomplete PM2.5 forecast");
  }

  const maxima = new Map<string, number>();
  for (let index = 0; index < times.length; index += 1) {
    const value = values[index];
    if (value === null || value === undefined || !Number.isFinite(value)) {
      continue;
    }
    const date = times[index]?.slice(0, 10);
    if (!date) continue;
    maxima.set(date, Math.max(maxima.get(date) ?? Number.NEGATIVE_INFINITY, value));
  }
  const daily = [...maxima.values()].slice(0, 5);
  if (daily.length !== 5) {
    throw new Error("Open-Meteo returned fewer than five forecast days");
  }
  return makeForecast(business, daily, "open-meteo");
}

export const hazeSignal: WeatherSignal = {
  id: "haze",
  label: "Haze",
  icon: "cloud-haze",
  triggerLevel: 2,
  async fetchForecast(business) {
    try {
      return await liveForecast(business);
    } catch {
      return makeForecast(business, offlineValues(), "offline");
    }
  },
  simulate: simulatedForecast,
};
