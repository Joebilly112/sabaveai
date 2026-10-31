import { useState, type CSSProperties } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Business } from '@workspace/api-client-react';
import { HERO_MIN_EDGE, POSTER_DIRECTIONS, headlineFit, parseOffer, posterChecks, posterPalette, priceDigits, rm } from '@/components/posterDesign';
import type { PosterDirection } from '@/components/posterDesign';
import { ShortVideoTeaser } from '@/components/ShortVideoTeaser';

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

const TONE_DIRECTION: Record<Tone, PosterDirection> = { premium: 'editorial', playful: 'bold', traditional: 'heritage', default: 'heritage' };
const directionKey = (id?: string) => `sabave.posterDirection.${id || 'none'}`;

function savedDirection(id?: string): PosterDirection | null {
  try {
    const value = window.localStorage.getItem(directionKey(id));
    return POSTER_DIRECTIONS.some((item) => item.id === value) ? value as PosterDirection : null;
  } catch { return null; }
}

function saveDirection(id: string | undefined, direction: PosterDirection) {
  try { window.localStorage.setItem(directionKey(id), direction); } catch { /* the choice just lasts this session */ }
}

export function menuItemForOffer<T extends { name: string }>(offer: string, items: T[]): T | undefined {
  const hay = offer.toLowerCase();
  return items
    .map((item) => ({ item, name: item.name.trim().toLowerCase() }))
    .filter((row) => row.name.length > 1 && hay.includes(row.name))
    .sort((a, b) => b.name.length - a.name.length)[0]?.item;
}

function productName(business: Business | undefined, offer: string): string {
  const menu = business?.brandKit?.menuItems || [];
  const products = business?.brandKit?.products || [];
  return menuItemForOffer(offer, [...menu, ...products])?.name || products.find((item) => item.name)?.name || '';
}

export function PosterPreview({
  business, headline, offer, cta, weatherLabel, productImage,
}: {
  business?: Business;
  headline: string;
  offer: string;
  cta: string;
  weatherLabel?: string;
  productImage?: string;
}) {
  const kit = business?.brandKit as (Business['brandKit'] & { logoDataUrl?: string }) | undefined;
  const isFood = business?.type === 'cafe';
  const malay = kit?.language === 'bm';
  const [picked, setPicked] = useState(() => savedDirection(business?.id));
  const direction = picked ?? TONE_DIRECTION[posterTone(business)];
  const palette = posterPalette(direction, kit?.brandColours?.length ? kit.brandColours : ['#FDE68A', '#92400E', '#FFF7D6'], isFood);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const dataUrl = kit?.logoDataUrl && /^data:image\//.test(kit.logoDataUrl) ? kit.logoDataUrl : '';
  const logo = kit?.logoPath;
  const src = dataUrl || (logo ? (/^https?:/.test(logo) ? logo : `${base}/${logo.replace(/^\//, '')}`) : '');
  const name = productName(business, offer);
  const photo = productImage && /^data:image\/(?:png|jpeg|webp);/.test(productImage) ? productImage : '';
  const [photoSize, setPhotoSize] = useState({ src: '', edge: 0 });
  const photoEdge = photoSize.src === photo ? photoSize.edge : 0;
  const image = !photo ? 'no-image' : photoEdge && photoEdge < HERO_MIN_EDGE ? 'has-inset' : 'has-hero';
  const line = headline.trim() || name || 'Your headline here';
  const headlineHasName = name && line.toLowerCase().includes(name.toLowerCase());
  const parts = parseOffer(offer);
  const hasPrice = parts.now != null || Boolean(parts.flat);
  const note = parts.note && parts.note.toLowerCase() !== name.toLowerCase() ? parts.note : '';
  const save = parts.save != null && !line.toLowerCase().includes(rm(parts.save).toLowerCase()) ? parts.save : null;
  const kicker = weatherLabel && !/good/i.test(weatherLabel) ? (malay ? 'Istimewa musim jerebu' : 'Haze-day special') : '';
  const issues = posterChecks({ product: name, isFood, hasPhoto: Boolean(photo), photoEdge, offer, headline, cta });
  const style = {
    '--ground': palette.ground, '--ink': palette.ink, '--price': palette.price, '--price-ink': palette.priceInk,
    '--fit': headlineFit(line),
  } as CSSProperties;
  return (
    <div className="poster-col">
      <div className="poster-directions" role="group" aria-label="Poster direction">
        {POSTER_DIRECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === direction ? 'active' : ''}
            aria-pressed={item.id === direction}
            onClick={() => { setPicked(item.id); saveDirection(business?.id, item.id); }}
            data-testid={`poster-direction-${item.id}`}
          >{item.label}</button>
        ))}
      </div>
      <figure className={`poster d-${direction} ${image}`} style={style} data-testid="poster-preview" data-direction={direction}>
        {photo ? (
          <div className="poster-hero">
            <img src={photo} alt="" onLoad={(event) => setPhotoSize({ src: photo, edge: Math.min(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight) })} />
          </div>
        ) : null}
        <div className="poster-copy">
          <div className="poster-line">
            {kicker ? <p className="poster-kicker">{kicker}</p> : null}
            {name && !headlineHasName ? <p className="poster-product">{name}</p> : null}
            <h5>{line}</h5>
            {note ? <p className={hasPrice ? 'poster-note' : 'poster-note is-offer'}>{note}</p> : null}
          </div>
          {hasPrice ? (
            <div className="poster-deal">
              {parts.was != null || save != null ? (
                <span className="poster-was">
                  {parts.was != null ? <s>{rm(parts.was)}</s> : null}
                  {save != null ? <span>{malay ? 'Jimat' : 'Save'} {rm(save)}</span> : null}
                </span>
              ) : null}
              {parts.now != null ? (
                <strong className={`poster-now ${priceDigits(parts.now).length > 3 ? 'is-long' : ''}`}><small>RM</small>{priceDigits(parts.now)}</strong>
              ) : <strong className="poster-now is-flat">{parts.flat}</strong>}
            </div>
          ) : null}
        </div>
        <div className="poster-signoff">
          <span className="poster-brand">
            {src ? <img src={src} alt="" className="poster-logo" /> : null}
            <span className="poster-shop">{business?.name || 'Your business'}</span>
          </span>
          <span className="poster-cta">{cta || 'Call to action'}<ArrowRight aria-hidden="true" /></span>
        </div>
        <figcaption className="sr-only">Poster for {name || 'the menu item'}{weatherLabel ? ` during ${weatherLabel} haze` : ''}. {offer}</figcaption>
      </figure>
      {issues.length ? (
        <div className="poster-checks" role="status" data-testid="poster-checks">
          <strong><AlertTriangle size={13} aria-hidden="true" />Before this goes out</strong>
          <ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        </div>
      ) : (
        <div className="poster-checks is-clear" role="status" data-testid="poster-checks"><strong><CheckCircle2 size={13} aria-hidden="true" />Hero, price and action all read clearly</strong></div>
      )}
      <ShortVideoTeaser headline={line} />
    </div>
  );
}
