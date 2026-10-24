import type { Business, SignalForecast, SignalId } from "../lib/types";

export interface WeatherSignal {
  id: SignalId;
  label: string;
  icon: string;
  triggerLevel: number;
  fetchForecast(business: Business): Promise<SignalForecast>;
  simulate(business: Business): SignalForecast;
}
