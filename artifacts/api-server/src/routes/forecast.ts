import { Router, type IRouter } from "express";
import {
  GetForecastQueryParams,
  GetForecastResponse,
} from "@workspace/api-zod";
import { appendLog } from "../lib/activityLog";
import { findBusiness, getStore } from "../lib/store";
import { getSignal } from "../signals/registry";
import { getUserById } from "../lib/users";

const router: IRouter = Router();

router.get("/forecast", async (req, res) => {
  const parsed = GetForecastQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid businessId and signalId are required." });
    return;
  }
  const { businessId, signalId, mode } = parsed.data;
  const business = findBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: "Business not found." });
    return;
  }
  const signal = getSignal(signalId);
  if (!signal) {
    res.status(404).json({ error: "Signal not found." });
    return;
  }

  const forecast =
    mode === "simulated"
      ? signal.simulate(business)
      : await signal.fetchForecast(business);
  getStore().forecasts.set(`${businessId}:${signalId}`, forecast);

  const user = getUserById(req.header("x-user-id") ?? "u1");
  const actor = user?.name ?? "Aisyah";
  appendLog({
    actor,
    role: user?.role ?? "staff",
    businessId,
    action: mode === "simulated" ? "SIGNAL_SIMULATED" : "FORECAST_CHECKED",
    details: {
      signalId,
      source: forecast.source,
      note:
        mode === "simulated"
          ? "Haze signal forecast simulated for the Stage 1 preview."
          : "Five-day haze forecast checked.",
    },
  });

  res.json(GetForecastResponse.parse(forecast));
});

export default router;
