import type { Business } from '@workspace/api-client-react';

type Tone = 'premium' | 'playful' | 'traditional' | 'default';
const KEYWORDS: Record<Exclude<Tone, 'default'>, string[]> = {
  premium: ['premium', 'luxury', 'elegant', 'refined', 'minimal', 'sophisticated', 'artisan', 'upscale', 'classy'],
  playful: ['playful', 'fun', 'cheerful', 'bubbly', 'quirky', 'bold', 'vibrant', 'youthful', 'friendly'],
  traditional: ['traditional', 'heritage', 'warm', 'nostalgic', 'classic', 'homely', 'kampung', 'family', 'old-school', 'authentic'],
};

function words(s: string) { return (s.toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}-]+/gu) || []).slice(0, 200); }

export function posterTone(business?: Business): Tone {
  const kit = business?.brandKit;
  if (!kit) return 'default';
  const chipWords = (kit.toneChips || []).slice(0, 20).flatMap((c) => words(c));
  const summaryWords = words((kit.posterStyleSummary || '').slice(0, 1000));
  let best: Tone = 'default'; let bestScore = 0;
  for (const tone of ['premium', 'playful', 'traditional'] as const) {
    const set = new Set(KEYWORDS[tone]);
    const score = chipWords.filter((w) => set.has(w)).length * 2 + summaryWords.filter((w) => set.has(w)).length;
    if (score > bestScore) { best = tone; bestScore = score; }
  }
  return best;
}

const ALLOWED_TAGS = new Set(['svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polygon', 'polyline']);
const ALLOWED_ATTR = /^(viewBox|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|d|cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|points|opacity)$/;

function safePosterSvg(input: string): string {
  const raw = input.trim();
  if (raw.length < 20 || raw.length > 4000) return '';
  if (/<script|foreignObject|<\s*image|<\s*use|<\s*text|<!|<\?|on[a-z]+\s*=|javascript:|href\s*=|url\s*\(|style\s*=|&#/i.test(raw)) return '';
  const match = raw.match(/<svg\b[^>]*>[\s\S]*<\/svg>/i);
  if (!match || !/viewBox\s*=\s*["']0 0 \d{2,3} \d{2,3}["']/.test(match[0])) return '';
  const tags = [...match[0].matchAll(/<\/?\s*([a-zA-Z0-9]+)/g)].map((item) => item[1]!.toLowerCase());
  if (!tags.length || tags.some((tag) => !ALLOWED_TAGS.has(tag))) return '';
  const attrs = [...match[0].matchAll(/\s([a-zA-Z:-]+)\s*=/g)].map((item) => item[1]!);
  if (attrs.some((attr) => attr !== 'xmlns' && !ALLOWED_ATTR.test(attr))) return '';
  return match[0].replace(/\sxmlns="[^"]*"/g, '');
}

function productName(business: Business | undefined, offer: string): string {
  const items = business?.brandKit?.products || [];
  const named = items.find((item) => item.name && offer.toLowerCase().includes(item.name.toLowerCase()));
  return named?.name || items[0]?.name || '';
}

export function PosterPreview({
  business, headline, offer, cta, weatherLabel, posterArt, productImage,
}: {
  business?: Business;
  headline: string;
  offer: string;
  cta: string;
  weatherLabel?: string;
  posterArt?: string;
  productImage?: string;
}) {
  const kit = business?.brandKit as (Business['brandKit'] & { logoDataUrl?: string }) | undefined;
  const colours = kit?.brandColours?.length ? kit.brandColours : ['#1f6b57', '#e8875d'];
  const [c1, c2 = c1, c3 = '#fbf6ea'] = colours;
  const tone = posterTone(business);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const dataUrl = kit?.logoDataUrl && /^data:image\//.test(kit.logoDataUrl) ? kit.logoDataUrl : '';
  const logo = kit?.logoPath;
  const src = dataUrl || (logo ? (/^https?:/.test(logo) ? logo : `${base}/${logo.replace(/^\//, '')}`) : '');
  const art = posterArt ? safePosterSvg(posterArt) : '';
  const name = productName(business, offer);
  const weather = weatherLabel ? `${weatherLabel} haze` : 'Haze alert';
  const photo = productImage && /^data:image\/(?:png|jpeg|webp);/.test(productImage) ? productImage : '';
  return (
    <figure className={`poster t-${tone}`} style={{ background: c1, color: c3 }} data-testid="poster-preview" data-tone={tone}>
      <div className="poster-band" style={{ background: c2 }} />
      <div className="poster-top">
        {src ? <img src={src} alt="" className="poster-logo" /> : <span className="poster-initial" style={{ background: c3, color: c1 }}>{(business?.name || 'S').slice(0, 1)}</span>}
        <span>{business?.name || 'Your business'}</span>
        <span className="poster-weather">{weather}</span>
      </div>
      <div className="poster-stage">
        {art ? <div className="poster-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: art }} /> : <div className="poster-haze" aria-hidden="true" />}
        {photo ? <img className="poster-photo" src={photo} alt="" /> : null}
      </div>
      {name ? <p className="poster-product">{name}</p> : null}
      <h5>{headline || 'Your headline here'}</h5>
      {offer && <div className="poster-offer" style={{ background: c3, color: c1 }}>{offer}</div>}
      <div className="poster-cta" style={{ borderColor: c3 }}>{cta || 'Call to action'}</div>
      <figcaption className="sr-only">Poster for {name || 'the menu item'} during {weather}</figcaption>
    </figure>
  );
}
