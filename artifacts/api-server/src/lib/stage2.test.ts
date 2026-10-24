import { test } from "node:test";
import assert from "node:assert/strict";
import { getStore } from "./store";
import { evaluate, malaysiaDate } from "./triggerEngine";
import { campaignOptions, suggestedBudget } from "./campaignRules";
import { hazeSignal } from "../signals/hazeSignal";
import { users } from "./users";

test("simulated haze creates one alert and deterministic options, without duplicate log entries", () => {
  const state = getStore();
  state.alerts = [];
  state.logs = [];
  const business = state.businesses[0]!;
  const forecast = hazeSignal.simulate(business);
  const alert = evaluate(forecast, business, users[0]!)!;
  assert.equal(alert.daysAhead, 1);
  assert.equal(alert.affectedDates.length, 3);
  assert.equal(alert.peakLevelLabel, "Very Unhealthy");
  const repeated = evaluate(forecast, business, users[1]!)!;
  assert.equal(repeated.id, alert.id);
  assert.equal(state.alerts.length, 1);
  assert.equal(state.logs.filter(log => log.action === "ALERT_TRIGGERED").length, 1);
  const options = campaignOptions(business, alert, forecast);
  assert.equal(options.length, 3);
  assert.equal(options[0]!.suggestedBudgetRM, 300);
  assert.equal(options[1]!.suggestedBudgetRM, 240);
  assert.equal(options[2]!.suggestedBudgetRM, 180);
  assert.match(options[0]!.offer, /Nasi Lemak Ayam.*RM8.*RM6/);
  assert.equal(options[0]!.reason, "You deliver, so a delivery push can keep orders coming while walk-ins fall.");
  assert.ok(!options[0]!.reason.includes("22%"));
  assert.deepEqual(options, campaignOptions(business, alert, forecast));
});

test("non-delivery businesses get two options and calm forecasts get no alert", () => {
  const business = getStore().businesses[1]!;
  const forecast = hazeSignal.simulate(business);
  const alert = evaluate(forecast, business, users[0]!)!;
  const options = campaignOptions(business, alert, forecast);
  assert.equal(options.length, 2);
  assert.ok(options.every(option => option.kind !== "delivery_push"));
  assert.equal(options[0]!.suggestedBudgetRM, 120);
  assert.equal(options[1]!.suggestedBudgetRM, 90);
  const calm = { ...forecast, days: forecast.days.map(day => ({ ...day, level: 0 as const })) };
  assert.equal(evaluate(calm, business, users[0]!), null);
});

test("budgets follow severity, duration, rounding, minimum and cap", () => {
  assert.equal(suggestedBudget(600, 2, 1), 60);
  assert.equal(suggestedBudget(600, 2, 3), 180);
  assert.equal(suggestedBudget(600, 3, 5), 300);
  assert.equal(suggestedBudget(300, 2, 2), 60);
  assert.equal(suggestedBudget(30, 2, 1), 20);
  assert.equal(suggestedBudget(10, 3, 3), 10);
  assert.equal(suggestedBudget(0, 3, 3), 0);
  assert.throws(() => suggestedBudget(-1, 2, 3));
});

test("lead time uses Malaysian calendar days across midnight UTC", () => {
  assert.equal(malaysiaDate(new Date("2026-10-24T20:00:00Z")), "2026-10-25");
});
