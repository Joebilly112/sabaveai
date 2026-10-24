import { Router, type IRouter } from "express";
import { TriggerSignalBody, TriggerSignalResponse } from "@workspace/api-zod";
import { findBusiness, getStore } from "../lib/store";
import { getSignal } from "../signals/registry";
import { getUserById } from "../lib/users";
import { appendLog } from "../lib/activityLog";
import { evaluate } from "../lib/triggerEngine";
import { campaignOptions } from "../lib/campaignRules";

const router: IRouter = Router();
router.post("/trigger", async (req, res) => {
  const parsed = TriggerSignalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide businessId, signalId haze, and an optional boolean simulate." });
    return;
  }
  const user = getUserById(req.header("x-user-id") ?? "u1");
  if (!user) {
    res.status(401).json({ error: "Unknown simulated user." });
    return;
  }
  const { businessId, signalId, simulate } = parsed.data;
  const business = findBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: "Business not found." });
    return;
  }
  const signal = getSignal(signalId)!;
  const forecast = simulate ? signal.simulate(business) : await signal.fetchForecast(business);
  getStore().forecasts.set(`${businessId}:${signalId}`, forecast);
  appendLog({
    actor: user.name, role: user.role, businessId,
    action: simulate ? "SIGNAL_SIMULATED" : "FORECAST_CHECKED",
    details: { signalId, source: forecast.source },
  });
  const alert = evaluate(forecast, business, user);
  const options = alert ? campaignOptions(business, alert, forecast) : [];
  res.json(TriggerSignalResponse.parse({ forecast, alert, options }));
});
export default router;
