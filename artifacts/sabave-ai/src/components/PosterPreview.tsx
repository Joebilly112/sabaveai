import type { Business } from '@workspace/api-client-react';

export function PosterPreview({ business, headline, offer, cta }: { business?: Business; headline: string; offer: string; cta: string }) {
  const colours = business?.brandKit?.brandColours?.length ? business.brandKit.brandColours : ['#1f6b57', '#e8875d'];
  const [c1, c2 = c1, c3 = '#fbf6ea'] = colours;
  const logo = business?.brandKit?.logoPath;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const src = logo ? (/^https?:/.test(logo) ? logo : `${base}/${logo.replace(/^\//, '')}`) : '';
  return (
    <figure className="poster" style={{ background: c1, color: c3 }} data-testid="poster-preview">
      <div className="poster-band" style={{ background: c2 }} />
      <div className="poster-top">
        {src ? <img src={src} alt="" className="poster-logo" /> : <span className="poster-initial" style={{ background: c3, color: c1 }}>{(business?.name || 'S').slice(0, 1)}</span>}
        <span>{business?.name || 'Your business'}</span>
      </div>
      <h5>{headline || 'Your headline here'}</h5>
      {offer && <div className="poster-offer" style={{ background: c3, color: c1 }}>{offer}</div>}
      <div className="poster-cta" style={{ borderColor: c3 }}>{cta || 'Call to action'}</div>
      <figcaption className="sr-only">Poster preview</figcaption>
    </figure>
  );
}
