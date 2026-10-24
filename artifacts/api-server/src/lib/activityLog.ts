import { randomUUID } from "node:crypto";
import { getStore } from "./store";
import type { LogEntry, Role } from "./types";

export type ActivityAction = LogEntry["action"];

export function appendLog(entry: Omit<LogEntry, "id" | "timestamp">): LogEntry {
  const saved: LogEntry = {
    ...entry,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
  };
  getStore().logs.push(saved);
  return saved;
}

export function listLogs(businessId?: string): LogEntry[] {
  const logs = getStore().logs;
  const filtered = businessId
    ? logs.filter((entry) => entry.businessId === businessId)
    : logs;
  return [...filtered].reverse().sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function recordForecastCheck(
  businessId: string,
  actor: string,
  role: Role,
  simulated: boolean,
  source: string,
): void {
  appendLog({
    actor,
    role,
    businessId,
    action: simulated ? "SIGNAL_SIMULATED" : "FORECAST_CHECKED",
    details: {
      signalId: "haze",
      source,
      note: simulated
        ? "Haze signal forecast simulated for the Stage 1 preview."
        : "Five-day haze forecast checked.",
    },
  });
}
