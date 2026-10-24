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

export function PosterPreview({ business, headline, offer, cta }: { business?: Business; headline: string; offer: string; cta: string }) {
  const kit = business?.brandKit as (Business['brandKit'] & { logoDataUrl?: string }) | undefined;
  const colours = kit?.brandColours?.length ? kit.brandColours : ['#1f6b57', '#e8875d'];
  const [c1, c2 = c1, c3 = '#fbf6ea'] = colours;
  const tone = posterTone(business);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const dataUrl = kit?.logoDataUrl && /^data:image\//.test(kit.logoDataUrl) ? kit.logoDataUrl : '';
  const logo = kit?.logoPath;
  const src = dataUrl || (logo ? (/^https?:/.test(logo) ? logo : `${base}/${logo.replace(/^\//, '')}`) : '');
  return (
    <figure className={`poster t-${tone}`} style={{ background: c1, color: c3 }} data-testid="poster-preview" data-tone={tone}>
      <div className="poster-band" style={{ background: c2 }} />
      <div className="poster-haze" aria-hidden="true" />
      <div className="poster-top">
        {src ? <img src={src} alt="" className="poster-logo" /> : <span className="poster-initial" style={{ background: c3, color: c1 }}>{(business?.name || 'S').slice(0, 1)}</span>}
        <span>{business?.name || 'Your business'}</span>
      </div>
      <h5>{headline || 'Your headline here'}</h5>
      {offer && <div className="poster-offer" style={{ background: c3, color: c1 }}>{offer}</div>}
      <div className="poster-cta" style={{ borderColor: c3 }}>{cta || 'Call to action'}</div>
      <figcaption className="sr-only">Poster preview · {tone} style</figcaption>
    </figure>
  );
}
