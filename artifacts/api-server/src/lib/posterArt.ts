import type { Business, CampaignOption, WeatherAlert } from "./types";
import { generateJSON, isAIConfigured } from "./llm";

const ALLOWED_TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polygon", "polyline"]);
const ALLOWED_ATTR = /^(viewBox|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|d|cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|points|opacity)$/;

/** Keep model drawings renderable. Rejects scripts, images, links, and anything that is not a plain shape. */
export function sanitizePosterSvg(input: string): string | null {
  const raw = input.trim();
  if (raw.length < 20 || raw.length > 4000) return null;
  if (/<script|foreignObject|<\s*image|<\s*use|<\s*text|<!|<\?|on[a-z]+\s*=|javascript:|href\s*=|url\s*\(|style\s*=|&#/i.test(raw)) return null;
  const match = raw.match(/<svg\b[^>]*>[\s\S]*<\/svg>/i);
  if (!match || !/viewBox\s*=\s*["']0 0 \d{2,3} \d{2,3}["']/.test(match[0])) return null;
  const svg = match[0];
  const tags = [...svg.matchAll(/<\/?\s*([a-zA-Z0-9]+)/g)].map((item) => item[1]!.toLowerCase());
  if (!tags.length || tags.some((tag) => !ALLOWED_TAGS.has(tag))) return null;
  const attrs = [...svg.matchAll(/\s([a-zA-Z:-]+)\s*=/g)].map((item) => item[1]!);
  if (attrs.some((attr) => attr !== "xmlns" && !ALLOWED_ATTR.test(attr))) return null;
  return svg.replace(/\sxmlns="[^"]*"/g, "");
}

export function productLabel(business: Business, option: CampaignOption): string {
  const offer = (option?.offer || "").toLowerCase();
  const products = business.brandKit?.products ?? [];
  const named = products.find((item) => item.name && offer.includes(item.name.toLowerCase()));
  return named?.name || products.find((item) => item.name)?.name || option?.title || "Today's special";
}

function hazeFill(label: string | undefined): string {
  if (label === "Very Unhealthy") return "#E0563F";
  if (label === "Moderate") return "#E0A82E";
  if (label === "Good") return "#2BB673";
  return "#F08A3C";
}

function scene(parts: string[]): string {
  return `<svg viewBox="0 0 160 96">${parts.join("")}</svg>`;
}

function haze(fill: string): string {
  return `<circle cx="36" cy="34" r="16" fill="${fill}" opacity="0.9"/><circle cx="52" cy="38" r="11" fill="${fill}" opacity="0.55"/>`;
}

function sadPerson(): string {
  return `<circle cx="108" cy="30" r="12" fill="#F2EEE6"/><path d="M100 34c2.2 4 13.8 4 16 0" fill="none" stroke="#14231F" stroke-width="1.6" stroke-linecap="round"/><rect x="100" y="48" width="16" height="22" rx="6" fill="#F2EEE6"/>`;
}

function cup(): string {
  return `<rect x="96" y="28" width="22" height="26" rx="4" fill="#F2EEE6"/><path d="M118 34h6c4 0 4 12 0 12h-6" fill="none" stroke="#F2EEE6" stroke-width="2"/><rect x="100" y="56" width="14" height="3" rx="1" fill="#14231F"/>`;
}

function bowl(): string {
  return `<path d="M92 40h36c-2 16-10 24-18 24s-16-8-18-24z" fill="#F2EEE6"/><ellipse cx="110" cy="40" rx="18" ry="5" fill="#0F7A5C"/>`;
}

function shirt(): string {
  return `<path d="M96 32l8 6 6-6 10 8-6 8v22H92V48l-6-8z" fill="#F2EEE6"/>`;
}

function basket(): string {
  return `<rect x="94" y="36" width="32" height="22" rx="4" fill="#F2EEE6"/><path d="M100 36c0-8 20-8 20 0" fill="none" stroke="#F2EEE6" stroke-width="2"/>`;
}

function cone(): string {
  return `<circle cx="110" cy="28" r="10" fill="#F2EEE6"/><path d="M102 36h16l-8 28z" fill="#E0A82E"/>`;
}

function productIcon(name: string, type: Business["type"]): string {
  const text = name.toLowerCase();
  if (/ais krim|ice cream|aiskrim|gelato/.test(text)) return cone();
  if (/kopi|coffee|teh|tea|drink/.test(text)) return cup();
  if (/baju|shirt|kemeja|blouse|dress/.test(text) || type === "retail") return shirt();
  if (/lipat|fold|dobi|laundry|basuh/.test(text) || type === "laundromat") return basket();
  return bowl();
}

/** Local vectors used when DeepSeek is off or its drawing is rejected. */
export function fallbackPosterSvg(business: Business, option: CampaignOption, alert?: WeatherAlert): string {
  const gloomy = !alert || alert.peakLevelLabel === "Unhealthy" || alert.peakLevelLabel === "Very Unhealthy";
  return scene([
    haze(hazeFill(alert?.peakLevelLabel)),
    gloomy ? sadPerson() : `<circle cx="108" cy="34" r="14" fill="#F2EEE6"/>`,
    productIcon(productLabel(business, option), business.type),
  ]);
}

export async function posterArtFor(business: Business, alert: WeatherAlert, option: CampaignOption): Promise<string> {
  const fallback = fallbackPosterSvg(business, alert, option);
  if (!isAIConfigured()) return fallback;
  const product = productLabel(business, option);
  try {
    const output = await generateJSON({
      systemPrompt: "Draw one small poster icon as SVG for a Malaysian shop. Weather and the named product must both be visible, for example a sad person under haze beside a bowl, a cup of kopi, or an ice cream. Use only svg, g, path, circle, ellipse, rect, line, polygon, polyline. viewBox must be \"0 0 160 96\". No text, images, scripts, styles, or links. Fills only from #F08A3C #E0563F #E0A82E #2BB673 #F2EEE6 #0F7A5C #14231F. Return JSON {\"svg\":\"<svg ...>...</svg>\"} and nothing else.",
      userPrompt: JSON.stringify({
        weather: `${alert.peakLevelLabel} haze`,
        dates: alert.affectedDates,
        product,
        businessType: business.type,
        offer: option.offer,
      }),
      exampleSchema: { svg: "<svg viewBox=\"0 0 160 96\"><circle cx=\"40\" cy=\"36\" r=\"14\" fill=\"#F08A3C\"/><circle cx=\"110\" cy=\"40\" r=\"12\" fill=\"#F2EEE6\"/></svg>" },
    }, (value) => {
      const svg = value && typeof value === "object" && typeof (value as { svg?: unknown }).svg === "string"
        ? sanitizePosterSvg((value as { svg: string }).svg)
        : null;
      if (!svg) throw new Error("invalid svg");
      return svg;
    });
    return output.value;
  } catch {
    return fallback;
  }
}
