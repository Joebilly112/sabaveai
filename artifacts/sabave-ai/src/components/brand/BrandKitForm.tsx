import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import type { BrandKitChannelsItem, TeamMember } from '@workspace/api-client-react';
import { CITY_PRESETS, type FormState } from '@/lib/brandForm';
import { ImageUploader } from './ImageUploader';
import { ColourSwatches } from './ColourSwatches';
import { ChipInput } from './ChipInput';
import { ProductListEditor } from './ProductListEditor';
import { MenuGallery } from './MenuGallery';
import { TeamPanel } from './TeamPanel';
import { PosterAnalysisPanel, WebsiteAnalysisPanel } from './BrandAnalysis';

const TONES = ['Warm', 'Family', 'Traditional', 'Modern', 'Playful', 'Premium', 'Halal-friendly', 'Neighbourly', 'Straight-talking', 'Witty', 'Calm'];
const NEVER = ['health claims', 'pork', 'alcohol', 'cheapest in town'];
const CHANNELS: { id: BrandKitChannelsItem; label: string }[] = [
  { id: 'facebook', label: 'Facebook' }, { id: 'instagram', label: 'Instagram' }, { id: 'whatsapp', label: 'WhatsApp' }, { id: 'tiktok', label: 'TikTok' },
];

function Section({ n, title, sub, children }: { n: string; title: string; sub: string; children: ReactNode }) {
  return (
    <section className="kit-section">
      <header className="kit-section-head"><span className="kit-num">{n}</span><div><h2>{title}</h2><p>{sub}</p></div></header>
      <div className="kit-section-body">{children}</div>
    </section>
  );
}
function Field({ label, htmlFor, hint, children, wide }: { label: string; htmlFor?: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return <div className={`field ${wide ? 'wide' : ''}`}><label className="field-label" htmlFor={htmlFor}>{label}</label>{children}{hint && <small className="field-hint">{hint}</small>}</div>;
}

type Props = {
  form: FormState; update: (p: Partial<FormState>) => void; businessId?: string; userId: string;
  team?: TeamMember[]; epoch: number; busy: { poster: boolean; website: boolean }; onBusy: (k: 'poster' | 'website', b: boolean) => void;
};

export function BrandKitForm({ form, update, businessId, userId, team, epoch, busy, onBusy }: Props) {
  const preset = CITY_PRESETS.find((c) => c.city === form.city && String(c.lat) === form.lat && String(c.lon) === form.lon)?.city || '';
  return (
    <div className="kit-form">
      <Section n="01" title="The shop" sub="Who you are and where the weather hits you.">
        <div className="field-grid">
          <Field label="Business name" htmlFor="biz-name"><input id="biz-name" className="text-input" maxLength={150} value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="Kopi Lane Bangsar" data-testid="input-business-name" /></Field>
          <Field label="Type" htmlFor="biz-type">
            <select id="biz-type" className="text-input" value={form.type} onChange={(e) => update({ type: e.target.value as FormState['type'] })} data-testid="select-business-type">
              <option value="cafe">Café / F&B</option><option value="laundromat">Laundromat</option><option value="retail">Boutique / Retail</option><option value="salon">Salon</option><option value="other">Other</option>
            </select>
          </Field>
          <Field label="City preset" htmlFor="biz-preset" hint="Pick a major city, or type your own coordinates.">
            <select id="biz-preset" className="text-input" value={preset} data-testid="select-city-preset"
              onChange={(e) => { const c = CITY_PRESETS.find((x) => x.city === e.target.value); if (c) update({ city: c.city, lat: String(c.lat), lon: String(c.lon) }); }}>
              <option value="">Custom location</option>
              {CITY_PRESETS.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
            </select>
          </Field>
          <Field label="City / town" htmlFor="biz-city"><input id="biz-city" className="text-input" maxLength={150} value={form.city} onChange={(e) => update({ city: e.target.value })} data-testid="input-city" /></Field>
          <Field label="Short description" htmlFor="biz-description" wide hint="Optional. 200 characters at most."><textarea id="biz-description" className="text-input" rows={2} maxLength={200} value={form.description} onChange={(e) => update({ description: e.target.value })} data-testid="input-description" /></Field>
          <Field label="Latitude" htmlFor="biz-lat"><input id="biz-lat" className="text-input mono" inputMode="decimal" value={form.lat} onChange={(e) => update({ lat: e.target.value })} data-testid="input-lat" /></Field>
          <Field label="Longitude" htmlFor="biz-lon"><input id="biz-lon" className="text-input mono" inputMode="decimal" value={form.lon} onChange={(e) => update({ lon: e.target.value })} data-testid="input-lon" /></Field>
        </div>
      </Section>

      <Section n="02" title="Look" sub="Logo and colours. Images stay in memory and are re-encoded in your browser.">
        <div className="look-grid">
          <ImageUploader id="logo" label="Logo" hint="PNG, JPEG, SVG or WebP · max 2 MB" kind="logo" colourCount={3} value={form.logoDataUrl || (form.logoPath ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${form.logoPath.replace(/^\//, '')}` : '')}
            onImage={(img) => update({ logoDataUrl: img.dataUrl, ...(img.colours.length ? { brandColours: img.colours.slice(0, 3) } : {}) })}
            onClear={() => update({ logoDataUrl: '', logoPath: undefined })} />
          <div className="field">
            <span className="field-label">Brand colours</span>
            <small className="field-hint">Extracted from the logo. Edit 1 to 3 hex codes.</small>
            <ColourSwatches id="brand-colour" values={form.brandColours} min={1} max={3} onChange={(v) => update({ brandColours: v })} />
          </div>
        </div>
      </Section>

      <Section n="03" title="Past poster" sub="Show us one campaign that worked. Only colours and your description are analysed.">
        <div className="look-grid">
          <ImageUploader id="poster" label="Past poster" hint="Reference only · never sent for analysis" kind="poster" colourCount={5} value={form.pastPosterDataUrl || (form.pastPosterPath || form.posterPath ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${(form.pastPosterPath || form.posterPath)!.replace(/^\//, '')}` : '')} disabled={busy.poster}
            onImage={(img) => update({ pastPosterDataUrl: img.dataUrl, posterColours: img.colours.slice(0, 5) })}
            onClear={() => update({ pastPosterDataUrl: '', pastPosterPath: undefined, posterPath: undefined })} />
          <div className="field">
            <span className="field-label">Poster colours</span>
            <ColourSwatches id="poster-colour" values={form.posterColours} min={0} max={5} disabled={busy.poster} onChange={(v) => update({ posterColours: v })} />
            <label className="field-label" htmlFor="poster-desc" style={{ marginTop: 14 }}>What is on it?</label>
            <textarea id="poster-desc" className="text-input" rows={3} maxLength={2000} disabled={busy.poster} value={form.posterDescription}
              placeholder="Big bold headline, photo of iced drinks on a marble table, price sticker bottom-right…" onChange={(e) => update({ posterDescription: e.target.value })} data-testid="input-poster-description" />
          </div>
        </div>
        <PosterAnalysisPanel form={form} update={update} businessId={businessId} epoch={epoch} onBusy={onBusy} />
      </Section>

      <Section n="04" title="Voice" sub="How you sound. The website read is optional; ethos is the source of truth.">
        <WebsiteAnalysisPanel form={form} update={update} businessId={businessId} epoch={epoch} onBusy={onBusy} />
        <Field label="Brand ethos" htmlFor="ethos" wide><textarea id="ethos" className="text-input" rows={3} maxLength={2000} value={form.ethos} onChange={(e) => update({ ethos: e.target.value })} placeholder="Neighbourhood kopi, honest prices, regulars know our names." data-testid="input-ethos" /></Field>
        <Field label="Tone" htmlFor="tone" wide><ChipInput id="tone" values={form.toneChips} onChange={(v) => update({ toneChips: v })} placeholder="Type a tone, press Enter" suggestions={TONES} max={20} maxLen={80} disabled={busy.poster} /></Field>
        <Field label="Never say" htmlFor="never" wide hint="Words or claims drafts must avoid. Campaign rules read this list."><ChipInput id="never" tone="warn" values={form.neverSay} onChange={(v) => update({ neverSay: v })} placeholder="Type a phrase, press Enter" suggestions={NEVER} max={100} maxLen={100} /></Field>
        <Field label="Language">
          <div className="segmented" role="radiogroup">
            {(['bm', 'en', 'both'] as const).map((l) => (
              <button type="button" key={l} role="radio" aria-checked={form.language === l} className={form.language === l ? 'on' : ''} onClick={() => update({ language: l })} data-testid={`button-language-${l}`}>{l === 'bm' ? 'Bahasa Melayu' : l === 'en' ? 'English' : 'Both'}</button>
            ))}
          </div>
        </Field>
      </Section>

      <Section n="05" title="Offer" sub="What you sell and who buys it.">
        <Field label="Menu or products" wide hint="Add your real items and photos. We'll use them in your posters and offers. If this gallery has items, it replaces the product list below."><MenuGallery values={form.menuItems} onChange={(menuItems) => update({ menuItems })} /></Field>
        <Field label="Products" wide><ProductListEditor values={form.products} onChange={(v) => update({ products: v })} /></Field>
        <Field label="Target customers" htmlFor="customers" wide><textarea id="customers" className="text-input" rows={2} maxLength={2000} value={form.targetCustomers} onChange={(e) => update({ targetCustomers: e.target.value })} placeholder="Office workers in Bangsar South, weekend families" data-testid="input-target-customers" /></Field>
        <div className="field-grid">
          <Field label="Delivery">
            <label className="toggle"><input type="checkbox" checked={form.delivery} onChange={(e) => update({ delivery: e.target.checked })} data-testid="toggle-delivery" /><span className="toggle-track" /><span>{form.delivery ? 'We deliver' : 'Walk-in only'}</span></label>
          </Field>
          <Field label="Takeaway">
            <label className="toggle"><input type="checkbox" checked={form.takeaway} onChange={(e) => update({ takeaway: e.target.checked })} data-testid="toggle-takeaway" /><span className="toggle-track" /><span>{form.takeaway ? 'Takeaway' : 'No takeaway'}</span></label>
          </Field>
          <Field label="Channels">
            <div className="channel-row">
              {CHANNELS.map((c) => {
                const on = form.channels.includes(c.id);
                return <button type="button" key={c.id} className={`channel ${on ? 'on' : ''}`} aria-pressed={on} data-testid={`toggle-channel-${c.id}`}
                  onClick={() => update({ channels: on ? form.channels.filter((x) => x !== c.id) : [...form.channels, c.id] })}>{c.label}</button>;
              })}
            </div>
          </Field>
        </div>
      </Section>

      <Section n="06" title="Money and sign-off" sub="Guardrails for every weather-triggered campaign.">
        <div className="field-grid three">
          <Field label="Monthly ad budget cap" htmlFor="budget"><div className="rm-input"><span>RM</span><input id="budget" inputMode="decimal" value={form.budget} onChange={(e) => update({ budget: e.target.value })} data-testid="input-budget" /></div></Field>
          <Field label="Baseline weekly sales" htmlFor="baseline"><div className="rm-input"><span>RM</span><input id="baseline" inputMode="decimal" value={form.baseline} onChange={(e) => update({ baseline: e.target.value })} data-testid="input-baseline-sales" /></div></Field>
          <Field label="Last bad-weather dip" htmlFor="dip"><div className="rm-input suffix"><input id="dip" inputMode="decimal" value={form.dip} onChange={(e) => update({ dip: e.target.value })} data-testid="input-dip-pct" /><span>%</span></div></Field>
        </div>
        <div className="approver" data-testid="text-approver"><Lock size={14} /><div>{form.approverUserId === 'u2' ? <strong>Approver: Mr. Tan (u2) · Owner</strong> : <strong>Approver: account owner</strong>}<span>{form.approverUserId === 'u2' ? 'Fixed for this pilot. Every draft needs his sign-off.' : 'The owner approves every draft before it can publish.'}</span></div></div>
      </Section>

      <Section n="07" title="Team" sub="Who can prepare drafts, and who can approve them.">
        <TeamPanel businessId={businessId} userId={userId} members={team ?? []} />
      </Section>
    </div>
  );
}
