import type { Business, CampaignOption, SignalForecast, WeatherAlert } from "./types";

export function suggestedBudget(cap: number, peakLevel: number, triggeringDays: number): number {
  if (!Number.isFinite(cap) || cap < 0) throw new Error("Invalid budget cap");
  const raw = cap * (peakLevel >= 3 ? 0.5 : 0.3) * Math.min(1, triggeringDays / 3);
  // For caps below RM20, respecting the cap takes priority over the minimum.
  return Math.min(cap, Math.max(20, Math.round(raw / 10) * 10));
}

// Campaign selection and spending are deterministic; no LLM participates.
export function campaignOptions(
  business: Business, alert: WeatherAlert, forecast: SignalForecast,
): CampaignOption[] {
  if (alert.signalId !== "haze") throw new Error("Campaign rules are not registered for this signal");
  const product = business.type === "cafe"
    ? business.brandKit.products.find(p => /nasi lemak/i.test(p.name)) ?? business.brandKit.products[0]
    : business.type === "laundromat"
      ? business.brandKit.products.find(p => /fold/i.test(p.name)) ?? business.brandKit.products[0]
      : business.brandKit.products[0];
  if (!product) throw new Error("A product is required to prepare campaign options");
  const money = (amount: number) => `RM${Number(amount.toFixed(2))}`;
  const discount = Math.min(2, product.priceRM);
  const offer = `${money(discount)} off ${product.name} (${money(product.priceRM)} → ${money(product.priceRM - discount)})`;
  const peakLevel = Math.max(...forecast.days.filter(d => alert.affectedDates.includes(d.date.slice(0, 10))).map(d => d.level));
  const cap = business.brandKit.monthlyAdBudgetCapRM;
  const baseBudget = suggestedBudget(cap, peakLevel, alert.affectedDates.length);
  const option = (kind: string, title: string, description: string, rationale: string, optionOffer = offer, multiplier = 1): CampaignOption => ({
    id: `${alert.id}:${kind}`, signalId: "haze", kind, title, description,
    reason: rationale, offer: optionOffer,
    suggestedBudgetRM: Math.min(cap, Math.max(20, Math.round((baseBudget * multiplier) / 10) * 10)),
  });
  const options: CampaignOption[] = [];
  if (business.brandKit.delivery) {
    options.push(option("delivery_push", "Bring your favourites home",
      "Promote delivery orders while customers spend more time indoors.",
      "You deliver, so a delivery push can keep orders coming while walk-ins fall."));
  }
  const bundles = {
    cafe: ["A family breakfast bundle", "Offer a family meal or drinks pack for a morning at home.", "A family pack gives nearby households a reason to order together."],
    laundromat: ["Pickup, wash & fold", "Promote pickup with wash-and-fold for busy households.", "Pickup and wash-and-fold help customers avoid an extra trip."],
    retail: ["Order online, collect later", "Promote online ordering with click-and-collect.", "Customers can choose their outfit from home and collect when convenient."],
    other: ["Plan your order from home", "Promote advance orders for convenient collection.", "Advance orders help maintain sales when fewer customers walk in."],
  } as const;
  const bundle = bundles[business.type];
  const familyOffer = business.type === "cafe"
    ? `Family pack: 2 × ${product.name} (${money(product.priceRM * 2)} → ${money(product.priceRM * 2 - discount)})`
    : offer;
  options.push(option("stay_home_bundle", bundle[0], bundle[1], bundle[2], familyOffer, 0.8));
  options.push(option("clean_air_walk_in", "A warm welcome indoors",
    "Let nearby customers know you are open, with a small in-store offer.",
    "A modest in-store offer gives customers already nearby a reason to stop in, without making air-quality or health claims.",
    offer, 0.6));
  return options;
}
