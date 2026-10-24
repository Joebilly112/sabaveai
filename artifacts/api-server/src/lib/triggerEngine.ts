import { randomUUID } from "node:crypto";
import { appendLog } from "./activityLog";
import { getStore } from "./store";
import { getSignal } from "../signals/registry";
import type { Business, SignalForecast, User, WeatherAlert } from "./types";

export function malaysiaDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

// Synchronous evaluation keeps duplicate checks and creation atomic within this process.
export function evaluate(
  forecast: SignalForecast, business: Business, user: User, now = new Date(),
): WeatherAlert | null {
  const signal = getSignal(forecast.signalId);
  if (!signal) throw new Error("Unregistered weather signal");
  if (forecast.businessId !== business.id) throw new Error("Forecast business mismatch");
  const days = forecast.days.filter(day => day.level >= signal.triggerLevel)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!days.length) return null;
  const affectedDates = [...new Set(days.map(day => day.date.slice(0, 10)))];
  const existing = getStore().alerts.find(alert =>
    alert.open && alert.businessId === business.id && alert.signalId === forecast.signalId &&
    JSON.stringify(alert.affectedDates) === JSON.stringify(affectedDates));
  const peak = days.reduce((best, day) =>
    day.level > best.level || (day.level === best.level && day.value > best.value) ? day : best);
  const daysAhead = Math.max(0, Math.round(
    (Date.parse(affectedDates[0]!) - Date.parse(malaysiaDate(now))) / 86_400_000,
  ));
  if (existing) {
    // Keep the same alert identity, but don't show stale severity after a new check.
    existing.peakDate = peak.date.slice(0, 10);
    existing.peakLevelLabel = peak.levelLabel;
    existing.daysAhead = daysAhead;
    return existing;
  }
  const alert: WeatherAlert = {
    id: randomUUID(), businessId: business.id, signalId: forecast.signalId,
    affectedDates, peakDate: peak.date.slice(0, 10), peakLevelLabel: peak.levelLabel,
    daysAhead, createdAt: now.toISOString(), open: true,
  };
  getStore().alerts.push(alert);
  appendLog({
    actor: user.name, role: user.role, businessId: business.id,
    action: "ALERT_TRIGGERED",
    details: { alertId: alert.id, signalId: forecast.signalId, affectedDates, peakLevelLabel: peak.levelLabel },
  });
  return alert;
}
