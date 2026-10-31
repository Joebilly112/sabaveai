/**
 * Art direction for campaign posters. A poster is an advertisement, not a UI card:
 * the reader meets the product, then the selling line, then the price, then the brand and the action.
 * One hero, two font families at most, three or four colours, and no decoration without a job.
 */

export type PosterDirection = 'heritage' | 'bold' | 'editorial';

export const POSTER_DIRECTIONS: { id: PosterDirection; label: string }[] = [
  { id: 'heritage', label: 'Heritage' },
  { id: 'bold', label: 'Bold' },
  { id: 'editorial', label: 'Editorial' },
];

export type PosterPalette = { ground: string; ink: string; price: string; priceInk: string };

/** Below this edge a photo goes soft at full bleed, so it sits as an inset instead. */
export const HERO_MIN_EDGE = 600;

const FOREST = '#12382B';
const CREAM = '#FBF5E6';
const PAPER = '#F6F1E7';
const NEAR_BLACK = '#1C1A17';
const CHILLI = '#D5331E';

function channels(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHsl(hex: string) {
  const [r, g, b] = channels(hex).map((channel) => channel / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  if (!delta) return { h: 0, s: 0, l };
  const s = delta / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: h * 60, s, l };
}

function fromHsl(h: number, s: number, l: number) {
  const amount = s * Math.min(l, 1 - l);
  const part = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = l - amount * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255).toString(16).padStart(2, '0');
  };
  return `#${part(0)}${part(8)}${part(4)}`.toUpperCase();
}

function luminance(hex: string) {
  const [r, g, b] = channels(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

/** Walks a colour's lightness away from the ground until text on it clears the ratio. */
function readable(colour: string, ground: string, ratio: number) {
  const { h, s, l } = toHsl(colour);
  const direction = luminance(ground) < 0.2 ? 1 : -1;
  for (let step = 0; step <= 25; step += 1) {
    const next = fromHsl(h, s, Math.min(1, Math.max(0, l + direction * step * 0.04)));
    if (contrast(next, ground) >= ratio) return next;
  }
  return direction > 0 ? '#FFFFFF' : '#111111';
}

const chroma = (hex: string) => {
  const parts = channels(hex);
  return (Math.max(...parts) - Math.min(...parts)) / 255;
};
const byChroma = (colours: string[]) => [...colours].sort((a, b) => chroma(b) - chroma(a));

export function posterPalette(direction: PosterDirection, brandColours: string[], isFood: boolean): PosterPalette {
  const colours = brandColours.filter((colour) => /^#[0-9A-Fa-f]{6}$/.test(colour));
  const brand = colours.length ? colours : [FOREST];
  const strongest = byChroma(brand)[0]!;
  const bright = byChroma(brand.filter((colour) => toHsl(colour).l > 0.5))[0] ?? strongest;
  const palest = [...brand].sort((a, b) => luminance(b) - luminance(a))[0]!;
  if (direction === 'heritage') {
    // Banana-leaf green sets off the reds and browns of cooked food. Other trades deepen their own colour.
    const ground = isFood ? FOREST : fromHsl(toHsl(strongest).h, 0.6, 0.14);
    const ink = readable(luminance(palest) > 0.6 ? palest : CREAM, ground, 7);
    const price = readable(fromHsl(toHsl(bright).h, 0.9, 0.62), ground, 4.5);
    return { ground, ink, price, priceInk: ground };
  }
  if (direction === 'bold') {
    const ground = readable(fromHsl(toHsl(bright).h, 0.92, 0.62), NEAR_BLACK, 8);
    const ink = readable(fromHsl(toHsl(strongest).h, 0.6, 0.16), ground, 7);
    const price = isFood ? CHILLI : readable(strongest, ground, 3);
    return { ground, ink, price, priceInk: readable(CREAM, price, 4.5) };
  }
  const price = readable(strongest, PAPER, 4.5);
  return { ground: PAPER, ink: NEAR_BLACK, price, priceInk: PAPER };
}

export type OfferParts = {
  /** The price the customer pays. */
  now?: number;
  was?: number;
  save?: number;
  /** An offer with no single price, such as "RM2 OFF" or "20% OFF". */
  flat?: string;
  /** What the offer buys when the words add more than the price does, such as a family pack. */
  note?: string;
};

const MONEY = String.raw`RM\s*(\d+(?:\.\d{1,2})?)`;
const PRICE_DROP = new RegExp(`${MONEY}\\s*(?:→|->|to|ke)\\s*${MONEY}`, 'i');
const AMOUNT_OFF = new RegExp(`${MONEY}\\s*(?:off|discount|diskaun|potongan)`, 'i');
const PERCENT_OFF = /(\d{1,2})\s*%\s*(?:off|discount|diskaun|potongan)?/i;
const SINGLE = new RegExp(MONEY, 'i');

const money = (value: number) => Number(value.toFixed(2)).toString();
export const rm = (value: number) => `RM${money(value)}`;
/** Sen stays on screen as two digits, so RM2.8 reads as RM2.80. */
export const priceDigits = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(2));

export function parseOffer(offer: string): OfferParts {
  const text = offer.trim();
  const drop = PRICE_DROP.exec(text);
  if (drop) {
    const was = Number(drop[1]);
    const now = Number(drop[2]);
    const rest = text.replace(/\([^)]*\)/, '').replace(PRICE_DROP, '').trim().replace(/[:,·-]+$/, '').trim();
    const note = AMOUNT_OFF.test(rest) ? undefined : rest || undefined;
    return { now, was, save: was > now ? Number((was - now).toFixed(2)) : undefined, note };
  }
  const amount = AMOUNT_OFF.exec(text);
  if (amount) return { flat: `${rm(Number(amount[1]))} OFF`, note: text.replace(AMOUNT_OFF, '').trim() || undefined };
  const percent = PERCENT_OFF.exec(text);
  if (percent) return { flat: `${percent[1]}% OFF`, note: text.replace(PERCENT_OFF, '').trim() || undefined };
  const single = SINGLE.exec(text);
  if (single) return { now: Number(single[1]), note: text.replace(SINGLE, '').replace(/\b(now|only|just|hanya|cuma|kini)\b/gi, '').trim() || undefined };
  return text ? { note: text } : {};
}

/** Scales display type down as a line gets longer, so a long headline never spills over the hero. */
export function headlineFit(text: string) {
  const { length } = text.trim();
  if (length <= 18) return 1.12;
  if (length <= 28) return 1;
  if (length <= 42) return 0.84;
  return 0.7;
}

const GENERIC_CTA = /^(contact us|hubungi kami|learn more|click here|more info)\b/i;

/** The questions an art director asks before a poster goes out. Each string is something to fix. */
export function posterChecks(input: {
  product: string;
  isFood: boolean;
  hasPhoto: boolean;
  photoEdge: number;
  offer: string;
  headline: string;
  cta: string;
}): string[] {
  const issues: string[] = [];
  const thing = input.product || (input.isFood ? 'this dish' : 'this product');
  if (!input.hasPhoto) {
    issues.push(`Add a real photo of ${thing} in your menu. It should be the first thing people see.`);
  } else if (input.photoEdge && input.photoEdge < HERO_MIN_EDGE) {
    issues.push(`This photo is only ${input.photoEdge}px wide, too small to fill the poster. Use one at least ${HERO_MIN_EDGE}px wide.`);
  }
  const parts = parseOffer(input.offer);
  if (parts.now == null && !parts.flat) issues.push('Put a price in the offer, like RM8 → RM6, so it reads at a glance.');
  const words = input.headline.trim().split(/\s+/).filter(Boolean).length;
  if (!words) issues.push('Add a headline.');
  else if (words > 8) issues.push(`Cut the headline to 8 words or fewer. It has ${words}.`);
  const cta = input.cta.trim();
  if (!cta) issues.push('Add a call to action.');
  else if (cta.split(/\s+/).length > 5 || /[·|]/.test(cta)) issues.push('Make the call to action one short step, like "Order now".');
  else if (GENERIC_CTA.test(cta)) issues.push(`Say what to do next. "${cta}" does not give people a reason to act.`);
  return issues;
}
