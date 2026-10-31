import type { Business, CampaignOption, WeatherAlert } from "./types";
import { generateJSON, isAIConfigured } from "./llm";

const ALLOWED_TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polygon", "polyline"]);
const ALLOWED_ATTR = /^(viewBox|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|d|cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|points|opacity)$/;

const INK = "#14231F";
const PAPER = "#F2EEE6";
const LEAF = "#0F7A5C";
const GOLD = "#E0A82E";
const HAZE = "#F08A3C";
const HOT = "#E0563F";

/** Plate centre the menu photo sits on. Keep PosterPreview's photo slot in step with this. */
export const POSTER_PLATE = { cx: 164, cy: 128, diameter: 86 };

const SUBJECTS = ["haze", "sun", "person", "bowl", "cup", "cone", "shirt", "basket"] as const;
type Subject = (typeof SUBJECTS)[number];
const PRODUCT_SUBJECTS = new Set<Subject>(["bowl", "cup", "cone", "shirt", "basket"]);

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
  const products = (business.brandKit?.products ?? []).filter((item) => item.name?.trim());
  const named = products
    .filter((item) => offer.includes(item.name.trim().toLowerCase()))
    .sort((a, b) => b.name.length - a.name.length)[0];
  return named?.name || products[0]?.name || option?.title || "Today's special";
}

export function productSubject(name: string, type: Business["type"]): Subject {
  const text = name.toLowerCase();
  if (/ais krim|ice cream|aiskrim|gelato/.test(text)) return "cone";
  if (/kopi|coffee|teh|tea|drink|milo|sirap/.test(text)) return "cup";
  if (/baju|shirt|kemeja|blouse|dress|tudung|batik/.test(text) || type === "retail") return "shirt";
  if (/lipat|fold|dobi|laundry|basuh|wash|duvet|dry|kain/.test(text) || type === "laundromat") return "basket";
  return "bowl";
}

function gloomy(alert?: WeatherAlert) {
  return !alert || alert.peakLevelLabel === "Unhealthy" || alert.peakLevelLabel === "Very Unhealthy";
}

function sun(alert?: WeatherAlert) {
  const dim = gloomy(alert);
  return `<circle cx="196" cy="22" r="14" fill="${PAPER}" opacity="${dim ? "0.42" : "0.92"}"/><circle cx="196" cy="22" r="6" fill="${GOLD}" opacity="${dim ? "0.5" : "0.9"}"/>`;
}

function haze(alert?: WeatherAlert) {
  if (alert?.peakLevelLabel === "Good") {
    return `<ellipse cx="90" cy="40" rx="54" ry="12" fill="${PAPER}" opacity="0.32"/><ellipse cx="190" cy="34" rx="64" ry="12" fill="${PAPER}" opacity="0.22"/>`;
  }
  const fill = alert?.peakLevelLabel === "Very Unhealthy" ? HOT : alert?.peakLevelLabel === "Moderate" ? GOLD : HAZE;
  return `<ellipse cx="78" cy="36" rx="72" ry="18" fill="${fill}" opacity="0.78"/><ellipse cx="168" cy="30" rx="80" ry="16" fill="${GOLD}" opacity="0.42"/><ellipse cx="248" cy="42" rx="64" ry="18" fill="${fill}" opacity="0.7"/><ellipse cx="150" cy="62" rx="120" ry="13" fill="${fill}" opacity="0.3"/>`;
}

function person(alert?: WeatherAlert) {
  const mouth = gloomy(alert) ? "M33 116q6 5 12 0" : "M33 118q6-5 12 0";
  return `<path d="M6 84L40 52l34 32" fill="${HOT}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><rect x="12" y="80" width="56" height="70" rx="2" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><rect x="20" y="90" width="40" height="44" fill="${INK}"/><rect x="20" y="90" width="7" height="26" fill="${GOLD}"/><rect x="53" y="90" width="7" height="26" fill="${GOLD}"/><circle cx="40" cy="108" r="12" fill="${PAPER}"/><path d="M29 106c0-11 22-11 22 0" fill="${GOLD}"/><circle cx="36" cy="109" r="1.4" fill="${INK}"/><circle cx="44" cy="109" r="1.4" fill="${INK}"/><path d="${mouth}" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/><path d="M27 124c3-7 23-7 26 0v12H27z" fill="${LEAF}"/><rect x="16" y="136" width="48" height="6" rx="1" fill="${INK}"/>`;
}

function ricePlate() {
  return `<polygon points="86,152 164,134 246,156 164,186" fill="${LEAF}"/><ellipse cx="164" cy="156" rx="74" ry="24" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/><ellipse cx="150" cy="124" rx="10" ry="6" fill="${PAPER}" opacity="0.9"/><ellipse cx="168" cy="118" rx="8" ry="5" fill="${PAPER}" opacity="0.85"/><ellipse cx="178" cy="132" rx="9" ry="5" fill="${PAPER}" opacity="0.9"/><ellipse cx="126" cy="118" rx="20" ry="13" fill="${HOT}" stroke="${INK}" stroke-width="1.6"/><rect x="104" y="114" width="18" height="7" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="1.3"/><circle cx="104" cy="117" r="4.5" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/><circle cx="192" cy="112" r="15" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/><circle cx="192" cy="112" r="6.5" fill="${GOLD}"/><ellipse cx="186" cy="146" rx="13" ry="8" fill="${HOT}"/><ellipse cx="138" cy="150" rx="16" ry="6" fill="${LEAF}" stroke="${INK}" stroke-width="1.2"/><circle cx="156" cy="148" r="3.2" fill="${GOLD}"/><circle cx="164" cy="152" r="2.6" fill="${GOLD}"/><circle cx="150" cy="154" r="2.2" fill="${GOLD}"/>`;
}

function kopiCup() {
  return `<ellipse cx="168" cy="168" rx="50" ry="12" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><rect x="136" y="112" width="64" height="50" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><rect x="144" y="120" width="48" height="14" rx="4" fill="${INK}"/><path d="M200 126h10c10 0 10 22 0 22h-10" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M152 104c4-8 4-8 8 0M170 98c4-10 4-10 8 0" fill="none" stroke="${PAPER}" stroke-width="2" stroke-linecap="round"/>`;
}

function iceCream() {
  return `<circle cx="150" cy="112" r="20" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/><circle cx="176" cy="106" r="18" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/><path d="M142 126h64l-32 52z" fill="${HOT}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
}

function shirt() {
  return `<path d="M118 108l22 16 16-16 30 18-14 16v44H102v-44l-14-16z" fill="${PAPER}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M140 108l8 12 8-12" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
}

function basket() {
  return `<rect x="118" y="118" width="96" height="52" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><path d="M138 118c0-16 56-16 56 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M132 134h68M132 148h68M132 160h68" stroke="${LEAF}" stroke-width="3" stroke-linecap="round"/>`;
}

const DRAW: Record<Subject, (alert?: WeatherAlert) => string> = {
  sun,
  haze,
  person,
  bowl: () => ricePlate(),
  cup: () => kopiCup(),
  cone: () => iceCream(),
  shirt: () => shirt(),
  basket: () => basket(),
};

export function defaultSubjects(product: Subject, alert?: WeatherAlert): Subject[] {
  const subjects: Subject[] = ["sun", "haze"];
  if (gloomy(alert)) subjects.push("person");
  subjects.push(product);
  return subjects;
}

export function sceneFromPlan(value: unknown, product: Subject): Subject[] | null {
  const list = value && typeof value === "object" && Array.isArray((value as { subjects?: unknown }).subjects)
    ? (value as { subjects: unknown[] }).subjects
    : null;
  if (!list) return null;
  const subjects = [...new Set(list.filter((item): item is Subject => typeof item === "string" && (SUBJECTS as readonly string[]).includes(item)))];
  if (subjects.length < 2 || subjects.length > 4) return null;
  if (!subjects.includes("haze") && !subjects.includes("sun")) return null;
  const icons = subjects.filter((item) => PRODUCT_SUBJECTS.has(item));
  if (icons.length !== 1 || icons[0] !== product) return null;
  if (!subjects.includes("haze")) subjects.unshift("haze");
  return subjects;
}

export function renderPosterSvg(subjects: Subject[], alert?: WeatherAlert): string {
  const order: Subject[] = ["sun", "haze", "person", "bowl", "cup", "cone", "shirt", "basket"];
  const body = order.filter((item) => subjects.includes(item)).map((item) => DRAW[item](alert)).join("");
  return `<svg viewBox="0 0 300 200">${body}</svg>`;
}

/** Local vectors used when DeepSeek is off or its scene plan is rejected. */
export function fallbackPosterSvg(business: Business, option: CampaignOption, alert?: WeatherAlert): string {
  const product = productSubject(productLabel(business, option), business.type);
  return renderPosterSvg(defaultSubjects(product, alert), alert);
}

export async function posterArtFor(business: Business, alert: WeatherAlert, option: CampaignOption): Promise<string> {
  const name = productLabel(business, option);
  const product = productSubject(name, business.type);
  const fallback = fallbackPosterSvg(business, option, alert);
  if (!isAIConfigured()) return fallback;
  try {
    const output = await generateJSON({
      systemPrompt: "Choose a short scene for a Malaysian shop poster. Return JSON {\"subjects\":[...]} and nothing else. Allowed words only: haze, sun, person, bowl, cup, cone, shirt, basket. Include haze. Include exactly one product subject that matches the named product: bowl for rice or cooked food, cup for kopi tea or drinks, cone for ice cream, shirt for clothing, basket for laundry. Include person when people should stay indoors during unhealthy haze. Do not return SVG, paths, or labels.",
      userPrompt: JSON.stringify({
        weather: `${alert.peakLevelLabel} haze`,
        product: name,
        productSubject: product,
        businessType: business.type,
        offer: option.offer,
      }),
      exampleSchema: { subjects: ["haze", "sun", "person", product] },
    }, (value) => {
      const subjects = sceneFromPlan(value, product);
      if (!subjects) throw new Error("invalid scene");
      const svg = sanitizePosterSvg(renderPosterSvg(subjects, alert));
      if (!svg) throw new Error("invalid svg");
      return svg;
    });
    return output.value;
  } catch {
    return fallback;
  }
}
