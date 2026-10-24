import { hazeSignal } from "./hazeSignal";
import type { SignalId } from "../lib/types";
import type { WeatherSignal } from "./signal";

export const registeredSignals: WeatherSignal[] = [hazeSignal];

export function getSignal(id: SignalId): WeatherSignal | undefined {
  return registeredSignals.find((signal) => signal.id === id);
}
