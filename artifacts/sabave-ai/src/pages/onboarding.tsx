import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { Coffee, Scissors, Shirt, ShoppingBag, Store } from 'lucide-react';
import {
  createBusiness, getGetBusinessQueryKey, getListBusinessesQueryKey, listBusinesses, useGetBusiness, useUpdateBusiness,
  type BrandKitChannelsItem, type BrandKitLanguage, type Business, type BusinessInput, type BusinessInputType, type TeamMember,
} from '@workspace/api-client-react';
import { SabaveLogo } from '@/components/SabaveLogo';
import { ColourSwatches } from '@/components/brand/ColourSwatches';
import { MenuGallery } from '@/components/brand/MenuGallery';
import { Stepper } from '@/components/ui/stepper';
import { useDocumentTitle } from '@/lib/use-document-title';
import { asArray } from '@/lib/as-array';
import { DEMO_PREFILL_BADGE, isStaffSession, ownerDemoPreset, ownerShellInput, resetDemoAccount, type OwnerDemoPreset } from '@/demo/demoPresets';
import { rasterizeImage } from '@/demo/rasterizeImage';
import { apiErrorInfo, useWorkspace } from '@/lib/workspace';
import { userHeaders } from '@/lib/session-api';
import { isHex } from '@/lib/colorExtract';
import type { MenuDraft } from '@/lib/brandForm';
import { sanitizeImage } from '@/lib/imageSanitize';
import { onboardingCities } from '@/lib/shop-cities';
import { useLocation } from 'wouter';
import 'leaflet/dist/leaflet.css';
import '@/onboarding.css';

const STEPS = [
  { id: 'business', label: 'Business' },
  { id: 'location', label: 'Location' },
  { id: 'selling', label: 'Selling' },
  { id: 'brand', label: 'Brand' },
  { id: 'menu', label: 'Menu' },
  { id: 'team', label: 'Team' },
  { id: 'budget', label: 'Budget' },
  { id: 'review', label: 'Review' },
];

const TYPES: { id: BusinessInputType; label: string; icon: typeof Coffee }[] = [
  { id: 'cafe', label: 'Café / F&B', icon: Coffee },
  { id: 'laundromat', label: 'Laundromat', icon: Shirt },
  { id: 'retail', label: 'Boutique / Retail', icon: ShoppingBag },
  { id: 'salon', label: 'Salon', icon: Scissors },
  { id: 'other', label: 'Other', icon: Store },
];

const TONES = ['Warm', 'Family', 'Traditional', 'Modern', 'Playful', 'Premium', 'Halal-friendly', 'Neighbourly'];
const CHANNELS: { id: BrandKitChannelsItem; label: string }[] = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'tiktok', label: 'TikTok' },
];
const NEVER = ['health claims', 'pork', 'alcohol', 'cheapest in town'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Draft = {
  name: string;
  type: '' | BusinessInputType;
  description: string;
  city: string;
  lat: string;
  lon: string;
  exact: boolean;
  delivery: boolean | null;
  takeaway: boolean | null;
  channels: BrandKitChannelsItem[];
  language: '' | BrandKitLanguage;
  logoDataUrl: string;
  brandColours: string[];
  toneChips: string[];
  pastPosterDataUrl: string;
  posterDescription: string;
  websiteUrl: string;
  menu: MenuDraft[];
  team: TeamMember[];
  budget: string;
  baseline: string;
  dip: string;
  neverSay: string[];
  neverDraft: string;
  targetCustomers: string;
  posterStyleSummary: string;
  websiteVoiceSummary: string;
  posterColours: string[];
};

const emptyDraft = (): Draft => ({
  name: '', type: '', description: '', city: '', lat: '', lon: '', exact: false,
  delivery: null, takeaway: null, channels: [], language: '',
  logoDataUrl: '', brandColours: ['#0F7A5C'], toneChips: [],
  pastPosterDataUrl: '', posterDescription: '', websiteUrl: '',
  menu: [], team: [], budget: '', baseline: '', dip: '', neverSay: [], neverDraft: '',
  targetCustomers: '', posterStyleSummary: '', websiteVoiceSummary: '', posterColours: [],
});

function coordsOk(lat: string, lon: string) {
  const la = Number(lat);
  const lo = Number(lon);
  return Number.isFinite(la) && la >= -90 && la <= 90 && Number.isFinite(lo) && lo >= -180 && lo <= 180;
}

function urlOk(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch { return false; }
}

function menuReady(menu: MenuDraft[]) {
  if (!menu.length || menu.length > 15) return false;
  return menu.every((item) => item.name.trim() && Number(item.price) > 0);
}

function coloursOk(colours: string[]) {
  return colours.length >= 1 && colours.length <= 3 && colours.every(isHex);
}

function stepValid(index: number, draft: Draft) {
  if (index === 0) return !!draft.name.trim() && !!draft.type;
  if (index === 1) return onboardingCities.some((city) => city.name === draft.city) && coordsOk(draft.lat, draft.lon);
  if (index === 2) return draft.delivery !== null && draft.takeaway !== null && draft.channels.length > 0 && !!draft.language;
  if (index === 3) return coloursOk(draft.brandColours) && draft.toneChips.length <= 3 && draft.description.length <= 200 && urlOk(draft.websiteUrl);
  if (index === 4) return menuReady(draft.menu);
  if (index === 5) return draft.team.some((member) => member.role === 'owner' && !member.invited) && draft.team.every((member) => member.name.trim() && EMAIL.test(member.email));
  if (index === 6) {
    const budget = Number(draft.budget);
    const baselineOk = draft.baseline.trim() === '' || Number(draft.baseline) >= 0;
    const dip = Number(draft.dip);
    const dipOk = draft.dip.trim() === '' || (dip >= 0 && dip <= 100);
    return draft.budget.trim() !== '' && Number.isFinite(budget) && budget >= 0 && baselineOk && dipOk;
  }
  return true;
}

function fromBusiness(business: Business): Draft {
  if (!business || typeof business !== 'object') return emptyDraft();
  const step = business.onboardingStep ?? 0;
  const kit = business.brandKit;
  if (!kit || typeof kit !== 'object') return { ...emptyDraft(), name: business.name || '' };
  const colours = asArray<string>(kit.brandColours);
  return {
    name: business.name,
    type: step >= 1 ? business.type : '',
    description: kit.description ?? '',
    city: step >= 2 ? business.city : '',
    lat: step >= 2 && business.city ? String(business.lat) : '',
    lon: step >= 2 && business.city ? String(business.lon) : '',
    exact: false,
    delivery: step >= 3 ? kit.delivery : null,
    takeaway: step >= 3 ? !!kit.takeaway : null,
    channels: step >= 3 ? [...asArray<BrandKitChannelsItem>(kit.channels)] : [],
    language: step >= 3 ? kit.language : '',
    logoDataUrl: kit.logoDataUrl ?? '',
    brandColours: colours.length ? [...colours] : ['#0F7A5C'],
    toneChips: asArray<string>(step >= 4 ? kit.toneChips : []).slice(0, 3),
    pastPosterDataUrl: kit.pastPosterDataUrl ?? '',
    posterDescription: kit.posterDescription ?? '',
    websiteUrl: kit.websiteUrl ?? '',
    menu: asArray(kit.menuItems).map((item) => ({
      id: item.id, name: item.name, price: String(item.priceRM), imageDataUrl: item.imageDataUrl || '', bestseller: !!item.bestseller,
    })),
    team: asArray<TeamMember>(business.teamMembers),
    budget: step >= 7 ? String(kit.monthlyAdBudgetCapRM) : '',
    baseline: step >= 7 && kit.baselineWeeklySalesRM != null ? String(kit.baselineWeeklySalesRM) : '',
    dip: step >= 7 && kit.lastBadWeatherDipPct != null ? String(kit.lastBadWeatherDipPct) : '',
    neverSay: step >= 7 ? [...asArray<string>(kit.neverSay)] : [],
    neverDraft: '',
    targetCustomers: kit.targetCustomers ?? '',
    posterStyleSummary: kit.posterStyleSummary ?? '',
    websiteVoiceSummary: kit.websiteVoiceSummary ?? '',
    posterColours: [...asArray<string>(kit.posterColours)],
  };
}

function draftFromPreset(preset: OwnerDemoPreset): Draft {
  const shop = preset.business;
  return {
    ...emptyDraft(),
    name: shop.name,
    type: shop.type,
    description: shop.description,
    city: shop.city,
    lat: String(shop.lat),
    lon: String(shop.lon),
    delivery: shop.delivery,
    takeaway: shop.takeaway,
    channels: [...shop.channels],
    language: shop.language,
    logoDataUrl: shop.logoPath,
    brandColours: [...shop.brandColours],
    toneChips: [...shop.toneChips],
    pastPosterDataUrl: shop.posterPath,
    posterDescription: shop.posterDescription,
    websiteUrl: shop.websiteUrl,
    menu: shop.menu.map((item) => ({
      id: item.id,
      name: item.name,
      price: String(item.priceRM),
      imageDataUrl: item.imagePath,
      bestseller: false,
    })),
    team: shop.team.map((member) => ({ ...member })),
    budget: String(shop.budget),
    baseline: String(shop.baseline),
    dip: String(shop.dip),
    neverSay: [...shop.neverSay],
    targetCustomers: shop.targetCustomers,
    posterStyleSummary: shop.posterStyleSummary,
    websiteVoiceSummary: shop.websiteVoiceSummary,
    posterColours: [...shop.posterColours],
  };
}

async function rasterizeDraft(draft: Draft): Promise<Draft> {
  const [logoDataUrl, pastPosterDataUrl, menu] = await Promise.all([
    rasterizeImage(draft.logoDataUrl, 'logo'),
    rasterizeImage(draft.pastPosterDataUrl, 'poster'),
    Promise.all(draft.menu.map(async (item) => ({ ...item, imageDataUrl: await rasterizeImage(item.imageDataUrl, 'logo') }))),
  ]);
  return { ...draft, logoDataUrl, pastPosterDataUrl, menu };
}

function toInput(draft: Draft, business: Business, completedStep: number, finished: boolean): BusinessInput {
  const menu = draft.menu.filter((item) => item.name.trim() && Number(item.price) > 0);
  const products = menu.length
    ? menu.map((item) => ({ name: item.name.trim(), priceRM: Number(item.price) }))
    : business.brandKit.products;
  const description = draft.description.trim();
  const name = draft.name.trim() || business.name;
  const baseline = draft.baseline.trim() === '' ? undefined : Number(draft.baseline);
  const dip = draft.dip.trim() === '' ? undefined : Number(draft.dip);
  return {
    name,
    type: (draft.type || business.type) as BusinessInputType,
    city: draft.city.trim(),
    lat: coordsOk(draft.lat, draft.lon) ? Number(draft.lat) : business.lat,
    lon: coordsOk(draft.lat, draft.lon) ? Number(draft.lon) : business.lon,
    onboardingCompleted: finished,
    onboardingStep: finished ? 8 : completedStep,
    teamMembers: draft.team,
    brandKit: {
      logoDataUrl: draft.logoDataUrl || undefined,
      pastPosterDataUrl: draft.pastPosterDataUrl || undefined,
      logoPath: business.brandKit.logoPath,
      pastPosterPath: business.brandKit.pastPosterPath,
      posterPath: business.brandKit.posterPath,
      brandColours: (draft.brandColours.length ? draft.brandColours : ['#0F7A5C']).map((colour) => colour.toUpperCase()),
      description: description || undefined,
      posterDescription: draft.posterDescription.trim() || undefined,
      websiteUrl: draft.websiteUrl.trim() || undefined,
      ethos: description || business.brandKit.ethos.trim() || name,
      toneChips: draft.toneChips,
      products,
      menuItems: menu.map((item) => ({
        id: item.id,
        name: item.name.trim(),
        priceRM: Number(item.price),
        imageDataUrl: item.imageDataUrl || undefined,
        bestseller: item.bestseller || undefined,
      })),
      targetCustomers: draft.targetCustomers.trim() || business.brandKit.targetCustomers.trim() || name,
      posterStyleSummary: draft.posterStyleSummary.trim() || business.brandKit.posterStyleSummary,
      websiteVoiceSummary: draft.websiteVoiceSummary.trim() || business.brandKit.websiteVoiceSummary,
      posterColours: draft.posterColours.length ? draft.posterColours : business.brandKit.posterColours,
      delivery: draft.delivery ?? false,
      takeaway: draft.takeaway ?? undefined,
      channels: draft.channels.length ? draft.channels : business.brandKit.channels,
      language: (draft.language || business.brandKit.language || 'both') as BrandKitLanguage,
      neverSay: draft.neverSay,
      monthlyAdBudgetCapRM: draft.budget.trim() === '' ? business.brandKit.monthlyAdBudgetCapRM : Number(draft.budget),
      approverUserId: business.brandKit.approverUserId,
      ...(baseline != null && Number.isFinite(baseline) ? { baselineWeeklySalesRM: baseline } : {}),
      ...(dip != null && Number.isFinite(dip) ? { lastBadWeatherDipPct: dip } : {}),
    },
  };
}

function ShopMap({ lat, lon }: { lat: number; lon: number }) {
  return (
    <div className="ob-map">
      <MapContainer key={`${lat},${lon}`} center={[lat, lon]} zoom={13} scrollWheelZoom={false} attributionControl>
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <CircleMarker center={[lat, lon]} radius={9} pathOptions={{ color: '#F7F4EE', weight: 2, fillColor: '#0F7A5C', fillOpacity: 1 }} />
      </MapContainer>
    </div>
  );
}

function shellEmail(email: string | undefined, username: string) {
  if (email?.includes('@')) return email.trim().toLowerCase();
  const local = username.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'owner';
  return `${local}@sabave.demo`;
}

export default function Onboarding() {
  const { session, businessId, setBusinessId, userId } = useWorkspace();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const preset = ownerDemoPreset(session);
  const staff = isStaffSession(session);
  const detail = useGetBusiness(businessId, {
    query: { enabled: !!businessId && !!userId && !staff, queryKey: getGetBusinessQueryKey(businessId) },
    request: userHeaders(userId),
  });
  const update = useUpdateBusiness({ request: userHeaders(userId) });
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => (preset ? draftFromPreset(preset) : emptyDraft()));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const hydrated = useRef(false);
  useDocumentTitle('Set up your shop · sabave.ai');

  useEffect(() => {
    document.documentElement.classList.add('theme-night');
    return () => document.documentElement.classList.remove('theme-night');
  }, []);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [session, navigate]);

  useEffect(() => {
    if (!session || done) return;
    if (staff) navigate('/app');
  }, [session, staff, done, navigate]);

  useEffect(() => {
    if (!session || staff || !userId) return;
    let cancel = false;
    const headers = userHeaders(userId);
    (async () => {
      try {
        const list = await listBusinesses(headers);
        const mine = list.find((business) => business.brandKit.approverUserId === userId) ?? list[0];
        const business = mine ?? await createBusiness(ownerShellInput({
          businessName: preset?.business.name || 'New business',
          ownerName: session.name,
          email: shellEmail(session.email, session.username),
          userId,
        }), headers);
        if (cancel) return;
        qc.setQueryData(getGetBusinessQueryKey(business.id), business);
        setBusinessId(business.id);
      } catch (err) {
        if (!cancel) setError(apiErrorInfo(err).message);
      }
    })();
    return () => { cancel = true; };
  }, [session?.username, session?.name, session?.email, staff, userId, preset, qc, setBusinessId]);

  useEffect(() => {
    if (done || !session || staff) return;
    if (detail.data?.onboardingCompleted) navigate('/app');
  }, [detail.data, done, session, staff, navigate]);

  useEffect(() => {
    if (preset || !detail.data || typeof detail.data !== 'object' || hydrated.current) return;
    hydrated.current = true;
    setDraft(fromBusiness(detail.data));
    setIndex(Math.min(7, Math.max(0, detail.data.onboardingStep ?? 0)));
  }, [detail.data, preset]);

  const patch = (partial: Partial<Draft>) => setDraft((current) => ({ ...current, ...partial }));
  const valid = stepValid(index, draft);
  const optional = index === 3 || index === 5;
  const cityMatch = onboardingCities.find((city) => city.name === draft.city);
  const showMap = coordsOk(draft.lat, draft.lon) && (!!cityMatch || draft.exact);
  const matches = useMemo(
    () => onboardingCities.filter((city) => city.name.toLowerCase().includes(draft.city.trim().toLowerCase())),
    [draft.city],
  );

  const persist = async (nextDraft: Draft, completedStep: number, finished: boolean) => {
    if (!detail.data || typeof detail.data !== 'object' || saving) return;
    setSaving(true);
    setError('');
    try {
      const next = await rasterizeDraft(nextDraft);
      setDraft(next);
      const savedBusiness = await update.mutateAsync({ id: detail.data.id, data: toInput(next, detail.data, completedStep, finished) });
      qc.setQueryData(getGetBusinessQueryKey(savedBusiness.id), savedBusiness);
      qc.setQueryData([...getListBusinessesQueryKey(), userId], (old: unknown) => {
        const list = Array.isArray(old) ? old.filter((item: Business) => item?.id !== savedBusiness.id) : [];
        return [...list, savedBusiness];
      });
      await qc.invalidateQueries({ queryKey: getListBusinessesQueryKey() });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
      if (finished) {
        setDone(true);
        navigate('/app');
      } else setIndex(Math.min(7, completedStep));
    } catch (err) {
      setError(apiErrorInfo(err).message);
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (!session || resetting) return;
    setResetting(true);
    setError('');
    try {
      await resetDemoAccount(userId);
      qc.clear();
      const headers = userHeaders(userId);
      const created = await createBusiness(ownerShellInput({
        businessName: preset?.business.name || 'New business',
        ownerName: session.name,
        email: shellEmail(session.email, session.username),
        userId,
      }), headers);
      qc.setQueryData(getGetBusinessQueryKey(created.id), created);
      setBusinessId(created.id);
      if (preset) {
        setDraft(draftFromPreset(preset));
        setIndex(0);
      }
    } catch (err) {
      setError(apiErrorInfo(err).message);
    } finally {
      setResetting(false);
    }
  };

  const onLogo = async (file?: File) => {
    if (!file) return;
    try {
      const image = await sanitizeImage(file, { kind: 'logo', colourCount: 3 });
      patch({ logoDataUrl: image.dataUrl, ...(image.colours.length ? { brandColours: image.colours.slice(0, 3) } : {}) });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That logo could not be read.');
    }
  };

  const onPoster = async (file?: File) => {
    if (!file) return;
    try {
      const image = await sanitizeImage(file, { kind: 'poster', colourCount: 1 });
      patch({ pastPosterDataUrl: image.dataUrl });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That poster could not be read.');
    }
  };

  const addNever = (raw: string) => {
    const value = raw.trim();
    if (!value || draft.neverSay.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    patch({ neverSay: [...draft.neverSay, value], neverDraft: '' });
  };

  if (!session || staff || (!done && detail.data?.onboardingCompleted)) return null;

  if (done) {
    return (
      <div className="ob-wizard theme-night">
        <div className="ob-success">
          <div className="ob-success-card">
            <SabaveLogo height={36} />
            <h1>You're all set. sabave.ai is now watching the weather for {draft.city || 'your shop'}.</h1>
            <button type="button" className="ob-primary" data-testid="button-go-dashboard" onClick={() => navigate('/app')}>Go to dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const titles = [
    ['Tell us about your business', 'This is the shop sabave.ai will watch.'],
    ['Where is your shop?', 'We check the haze forecast for this exact spot every 6 hours.'],
    ['How do you sell?', 'Delivery, takeaway and where your regulars already are.'],
    ['Your brand', 'Logo, colours and the words you want kept off a poster.'],
    ['Your menu or products', "Add your real items and photos. We'll use them in your posters and offers."],
    ['Your team', 'Owner: approve or reject campaigns, set budget, edit Brand Kit, manage team. Staff: see alerts, prepare and edit drafts, submit for approval. Cannot publish.'],
    ['Budget and rules', 'Campaigns can never go over this.'],
    ['Review and finish', 'Check the answers. You can edit any of them later in Brand Kit.'],
  ] as const;
  const [title, helper] = titles[index];

  return (
    <div className="ob-wizard theme-night">
      <div className="ob-shell">
        <header className="ob-top">
          <div className="ob-top-row">
            <SabaveLogo height={32} />
            {preset && (
              <button type="button" className="ob-link" data-testid="button-reset-demo" disabled={resetting || saving} onClick={() => void onReset()}>
                {resetting ? 'Resetting…' : 'Reset my demo'}
              </button>
            )}
          </div>
          <div className="ob-progress">
            <div className="ob-step-count">
              <span>Step {index + 1} of 8</span>
              {saved && <span className="ob-saved" data-testid="text-setup-saved">Saved</span>}
            </div>
            <div className="ob-track" aria-hidden><span style={{ width: `${((index + 1) / 8) * 100}%` }} /></div>
            <Stepper steps={STEPS} current={index} />
          </div>
        </header>

        <section className="ob-card">
          {preset && <p className="ob-badge" data-testid="text-demo-prefill">{DEMO_PREFILL_BADGE}</p>}
          <h1 data-testid="text-onboarding-title">{title}</h1>
          <p className="ob-help">{helper}</p>

          {index === 0 && (
            <>
              <label className="ob-field">Business name
                <input value={draft.name} maxLength={150} onChange={(event) => patch({ name: event.target.value })} data-testid="input-onboarding-name" />
              </label>
              <div className="ob-label">Business type</div>
              <div className="ob-types">
                {TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button type="button" key={type.id} className={`ob-type ${draft.type === type.id ? 'on' : ''}`} aria-pressed={draft.type === type.id} onClick={() => patch({ type: type.id })} data-testid={`button-type-${type.id}`}>
                      <Icon size={18} aria-hidden />{type.label}
                    </button>
                  );
                })}
              </div>
              <label className="ob-field" style={{ marginTop: 14 }}>Short description
                <textarea maxLength={200} value={draft.description} onChange={(event) => patch({ description: event.target.value })} data-testid="input-onboarding-description" />
                <span className="ob-count">{draft.description.length}/200</span>
              </label>
            </>
          )}

          {index === 1 && (
            <>
              <label className="ob-field">City
                <div className="ob-city">
                  <input
                    value={draft.city}
                    role="combobox"
                    aria-expanded={cityOpen}
                    aria-autocomplete="list"
                    onFocus={() => setCityOpen(true)}
                    onBlur={() => window.setTimeout(() => setCityOpen(false), 150)}
                    onChange={(event) => { patch({ city: event.target.value, lat: '', lon: '' }); setCityOpen(true); }}
                    data-testid="input-onboarding-city"
                  />
                  {cityOpen && matches.length > 0 && (
                    <div className="ob-city-list" role="listbox">
                      {matches.map((city) => (
                        <button
                          type="button"
                          key={city.name}
                          role="option"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            patch({ city: city.name, lat: String(city.lat), lon: String(city.lon) });
                            setCityOpen(false);
                          }}
                          data-testid={`option-city-${city.name}`}
                        >{city.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              </label>
              <label className="ob-check">
                <input type="checkbox" checked={draft.exact} onChange={(event) => patch({ exact: event.target.checked })} data-testid="toggle-exact-coordinates" />
                Use exact coordinates
              </label>
              {draft.exact && (
                <div className="ob-pair">
                  <label className="ob-field">Latitude
                    <input type="number" value={draft.lat} onChange={(event) => patch({ lat: event.target.value })} data-testid="input-onboarding-lat" />
                  </label>
                  <label className="ob-field">Longitude
                    <input type="number" value={draft.lon} onChange={(event) => patch({ lon: event.target.value })} data-testid="input-onboarding-lon" />
                  </label>
                </div>
              )}
              {showMap && <ShopMap lat={Number(draft.lat)} lon={Number(draft.lon)} />}
            </>
          )}

          {index === 2 && (
            <>
              <div className="ob-label">Do you deliver?</div>
              <div className="ob-choice">
                <button type="button" className={draft.delivery === true ? 'on' : ''} aria-pressed={draft.delivery === true} onClick={() => patch({ delivery: true })} data-testid="button-delivery-yes">Yes</button>
                <button type="button" className={draft.delivery === false ? 'on' : ''} aria-pressed={draft.delivery === false} onClick={() => patch({ delivery: false })} data-testid="button-delivery-no">No</button>
              </div>
              <div className="ob-label" style={{ marginTop: 14 }}>Do you offer takeaway?</div>
              <div className="ob-choice">
                <button type="button" className={draft.takeaway === true ? 'on' : ''} aria-pressed={draft.takeaway === true} onClick={() => patch({ takeaway: true })} data-testid="button-takeaway-yes">Yes</button>
                <button type="button" className={draft.takeaway === false ? 'on' : ''} aria-pressed={draft.takeaway === false} onClick={() => patch({ takeaway: false })} data-testid="button-takeaway-no">No</button>
              </div>
              <div className="ob-label" style={{ marginTop: 14 }}>Where do you post?</div>
              <div className="ob-chips">
                {CHANNELS.map((channel) => {
                  const on = draft.channels.includes(channel.id);
                  return (
                    <button type="button" key={channel.id} className={on ? 'on' : ''} aria-pressed={on} data-testid={`button-setup-channel-${channel.id}`}
                      onClick={() => patch({ channels: on ? draft.channels.filter((item) => item !== channel.id) : [...draft.channels, channel.id] })}>
                      {channel.label}
                    </button>
                  );
                })}
              </div>
              <div className="ob-label" style={{ marginTop: 14 }}>Language</div>
              <div className="ob-seg" role="radiogroup">
                {(['bm', 'en', 'both'] as const).map((language) => (
                  <button type="button" key={language} role="radio" aria-checked={draft.language === language} className={draft.language === language ? 'on' : ''} onClick={() => patch({ language })} data-testid={`button-setup-language-${language}`}>
                    {language === 'bm' ? 'Bahasa Melayu' : language === 'en' ? 'English' : 'Both'}
                  </button>
                ))}
              </div>
            </>
          )}

          {index === 3 && (
            <>
              <label className="ob-field">Logo
                <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" data-testid="input-setup-logo" onChange={(event) => { void onLogo(event.target.files?.[0]); event.target.value = ''; }} />
              </label>
              {draft.logoDataUrl && <img className="ob-preview" src={draft.logoDataUrl} alt="Logo preview" />}
              <div className="ob-label">Brand colours</div>
              <ColourSwatches id="setup-colour" values={draft.brandColours} min={1} max={3} onChange={(brandColours) => patch({ brandColours })} />
              <div className="ob-label" style={{ marginTop: 14 }}>Tone, up to 3</div>
              <div className="ob-chips">
                {TONES.map((tone) => {
                  const on = draft.toneChips.includes(tone);
                  return (
                    <button type="button" key={tone} className={on ? 'on' : ''} aria-pressed={on} disabled={!on && draft.toneChips.length >= 3}
                      onClick={() => patch({ toneChips: on ? draft.toneChips.filter((item) => item !== tone) : [...draft.toneChips, tone] })}>
                      {tone}
                    </button>
                  );
                })}
              </div>
              <label className="ob-field" style={{ marginTop: 14 }}>Past poster
                <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" data-testid="input-setup-poster" onChange={(event) => { void onPoster(event.target.files?.[0]); event.target.value = ''; }} />
              </label>
              {draft.pastPosterDataUrl && <img className="ob-preview" src={draft.pastPosterDataUrl} alt="Past poster preview" />}
              <label className="ob-field">What's on it?
                <input value={draft.posterDescription} maxLength={2000} onChange={(event) => patch({ posterDescription: event.target.value })} data-testid="input-setup-poster-note" />
              </label>
              <label className="ob-field">Website or social link
                <input type="url" value={draft.websiteUrl} placeholder="https://" onChange={(event) => patch({ websiteUrl: event.target.value })} data-testid="input-setup-website" />
              </label>
            </>
          )}

          {index === 4 && <MenuGallery values={draft.menu} onChange={(menu) => patch({ menu })} />}

          {index === 5 && (
            <>
              <ul>
                {draft.team.map((member) => (
                  <li key={member.id} className="ob-team-row" data-testid={`setup-member-${member.role}`}>
                    <div>
                      <strong>{member.name}</strong>
                      <div className="ob-help" style={{ margin: 0 }}>{member.email}</div>
                      <span className={`role-chip r-${member.role}`}>{member.role === 'owner' && !member.invited ? 'Owner (approver)' : member.role === 'owner' ? 'Owner' : 'Staff'}</span>
                      {member.invited && <span className="status-chip"> Invite sent (demo)</span>}
                    </div>
                    {member.invited && <button type="button" className="ob-link" onClick={() => patch({ team: draft.team.filter((item) => item.id !== member.id) })}>Remove</button>}
                  </li>
                ))}
              </ul>
              <TeamAdd onAdd={(member) => patch({ team: [...draft.team, member] })} />
            </>
          )}

          {index === 6 && (
            <>
              <label className="ob-field">Monthly ad budget cap RM
                <input type="number" min={0} value={draft.budget} onChange={(event) => patch({ budget: event.target.value })} data-testid="input-onboarding-budget" />
              </label>
              <p className="ob-help">Campaigns can never go over this.</p>
              <div className="ob-label">Never say</div>
              <div className="ob-chips">
                {draft.neverSay.map((phrase) => (
                  <button type="button" key={phrase} className="on" onClick={() => patch({ neverSay: draft.neverSay.filter((item) => item !== phrase) })}>{phrase} ×</button>
                ))}
              </div>
              <div className="ob-chips" style={{ marginTop: 8 }}>
                {NEVER.filter((phrase) => !draft.neverSay.some((item) => item.toLowerCase() === phrase.toLowerCase())).map((phrase) => (
                  <button type="button" key={phrase} onClick={() => addNever(phrase)} data-testid={`button-never-${phrase.replace(/\s+/g, '-')}`}>+ {phrase}</button>
                ))}
              </div>
              <label className="ob-field">Add a phrase
                <input value={draft.neverDraft} placeholder="Press Enter to add" onChange={(event) => patch({ neverDraft: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addNever(draft.neverDraft); } }} data-testid="input-onboarding-never" />
              </label>
              <label className="ob-field">Average weekly sales RM
                <input type="number" min={0} value={draft.baseline} onChange={(event) => patch({ baseline: event.target.value })} data-testid="input-onboarding-baseline" />
              </label>
              <label className="ob-field">How much did sales drop in the last bad-weather spell? (%)
                <input type="number" min={0} max={100} value={draft.dip} onChange={(event) => patch({ dip: event.target.value })} data-testid="input-onboarding-dip" />
              </label>
              <p className="ob-help">Eateries reported 20–35% during the Oct 2026 haze.</p>
            </>
          )}

          {index === 7 && (
            <div className="ob-review">
              <Review title="Business" onEdit={() => setIndex(0)} testid="button-edit-step-1">
                {`${draft.name} · ${TYPES.find((type) => type.id === draft.type)?.label || 'Type not set'}${draft.description ? `\n${draft.description}` : ''}`}
              </Review>
              <Review title="Shop" onEdit={() => setIndex(1)} testid="button-edit-step-2">
                {`${draft.city || 'City not set'} · ${draft.lat}, ${draft.lon}`}
              </Review>
              <Review title="Selling" onEdit={() => setIndex(2)} testid="button-edit-step-3">
                {`Delivery ${yesNo(draft.delivery)} · Takeaway ${yesNo(draft.takeaway)}\n${draft.channels.join(', ') || 'No channels'} · ${draft.language || 'Language not set'}`}
              </Review>
              <Review title="Brand" onEdit={() => setIndex(3)} testid="button-edit-step-4">
                {`${draft.brandColours.join(' ')}${draft.toneChips.length ? `\n${draft.toneChips.join(', ')}` : ''}`}
              </Review>
              <Review title="Menu" onEdit={() => setIndex(4)} testid="button-edit-step-5">
                {draft.menu.map((item) => `${item.name || 'Untitled'} · RM ${item.price}${item.bestseller ? ' · Bestseller' : ''}`).join('\n') || 'No items'}
              </Review>
              <Review title="Team" onEdit={() => setIndex(5)} testid="button-edit-step-6">
                {draft.team.map((member) => `${member.name} · ${member.role}${member.invited ? ' · Invite sent (demo)' : ''}`).join('\n')}
              </Review>
              <Review title="Budget" onEdit={() => setIndex(6)} testid="button-edit-step-7">
                {`Cap RM ${draft.budget || '0'}${draft.neverSay.length ? `\nNever say: ${draft.neverSay.join(', ')}` : ''}`}
              </Review>
            </div>
          )}

          {error && <p className="ob-error" role="alert">{error}</p>}
          {detail.isLoading && <p className="ob-help">Loading your setup…</p>}
          {(detail.isError || (detail.data != null && typeof detail.data !== 'object')) && <p className="ob-error" role="alert">This setup could not load. <button type="button" className="ob-link" onClick={() => void detail.refetch()}>Try again</button></p>}
        </section>
      </div>

      <div className="ob-bar">
        <div className="ob-bar-inner">
          {index > 0 && <button type="button" className="ob-ghost" onClick={() => setIndex((current) => current - 1)} disabled={update.isPending || saving} data-testid="button-onboarding-back">Back</button>}
          {optional && (
            <button type="button" className="ob-link" disabled={update.isPending || saving} data-testid="button-onboarding-skip"
              onClick={() => {
                const next = { ...draft };
                if (index === 3) {
                  if (!coloursOk(next.brandColours)) next.brandColours = ['#0F7A5C'];
                  if (!urlOk(next.websiteUrl)) next.websiteUrl = '';
                }
                setDraft(next);
                void persist(next, index + 1, false);
              }}>
              Skip for now
            </button>
          )}
          <button
            type="button"
            className="ob-primary"
            disabled={!valid || update.isPending || saving || !detail.data || typeof detail.data !== 'object'}
            data-testid="button-onboarding-continue"
            onClick={() => void persist(draft, index + 1, index === 7)}
          >
            {update.isPending || saving ? 'Saving…' : index === 7 ? 'Finish setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

function yesNo(value: boolean | null) {
  if (value === null) return 'not set';
  return value ? 'yes' : 'no';
}

function Review({ title, children, onEdit, testid }: { title: string; children: string; onEdit: () => void; testid: string }) {
  return (
    <article>
      <header>
        <h2>{title}</h2>
        <button type="button" className="ob-link" onClick={onEdit} data-testid={testid}>Edit</button>
      </header>
      <p>{children}</p>
    </article>
  );
}

function TeamAdd({ onAdd }: { onAdd: (member: TeamMember) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'staff'>('staff');
  const ready = !!name.trim() && EMAIL.test(email.trim());
  return (
    <div>
      <div className="ob-label">Add team member</div>
      <label className="ob-field">Name
        <input value={name} onChange={(event) => setName(event.target.value)} data-testid="input-setup-team-name" />
      </label>
      <label className="ob-field">Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} data-testid="input-setup-team-email" />
      </label>
      <label className="ob-field">Role
        <select value={role} onChange={(event) => setRole(event.target.value as 'owner' | 'staff')} data-testid="select-setup-team-role">
          <option value="staff">Staff</option>
          <option value="owner">Owner</option>
        </select>
      </label>
      <button
        type="button"
        className="ob-ghost"
        disabled={!ready}
        data-testid="button-setup-add-member"
        onClick={() => {
          onAdd({ id: `tm_${crypto.randomUUID()}`, name: name.trim(), email: email.trim().toLowerCase(), role, invited: true });
          setName('');
          setEmail('');
          setRole('staff');
        }}
      >Add team member</button>
    </div>
  );
}
