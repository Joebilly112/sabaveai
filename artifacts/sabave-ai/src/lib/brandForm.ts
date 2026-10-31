import type { Business, BusinessInput, BrandKitChannelsItem, BrandKitLanguage, BusinessInputType } from '@workspace/api-client-react';
import { asArray } from './as-array';
import { isHex } from './colorExtract';
import type { ProductRow } from '@/components/brand/ProductListEditor';

export type MenuDraft = { id: string; name: string; price: string; imageDataUrl: string; bestseller: boolean };

export const CITY_PRESETS = [
  { city: 'Kuala Lumpur', lat: 3.139, lon: 101.6869 },
  { city: 'Petaling Jaya', lat: 3.1073, lon: 101.6067 },
  { city: 'Shah Alam', lat: 3.0733, lon: 101.5185 },
  { city: 'George Town', lat: 5.4141, lon: 100.3288 },
  { city: 'Ipoh', lat: 4.5975, lon: 101.0901 },
  { city: 'Johor Bahru', lat: 1.4927, lon: 103.7414 },
  { city: 'Melaka', lat: 2.1896, lon: 102.2501 },
  { city: 'Seremban', lat: 2.7297, lon: 101.9381 },
  { city: 'Kuantan', lat: 3.8077, lon: 103.326 },
  { city: 'Kota Bharu', lat: 6.1254, lon: 102.2381 },
  { city: 'Alor Setar', lat: 6.1248, lon: 100.3678 },
  { city: 'Kota Kinabalu', lat: 5.9804, lon: 116.0735 },
  { city: 'Kuching', lat: 1.5535, lon: 110.3593 },
];

export type FormState = {
  name: string; type: BusinessInputType; city: string; lat: string; lon: string;
  logoDataUrl: string; brandColours: string[];
  pastPosterDataUrl: string; posterColours: string[]; posterDescription: string; posterStyleSummary: string;
  websiteUrl: string; websiteVoiceSummary: string;
  description: string; ethos: string; toneChips: string[]; products: ProductRow[]; menuItems: MenuDraft[];
  targetCustomers: string; delivery: boolean; takeaway: boolean;
  channels: BrandKitChannelsItem[]; language: BrandKitLanguage; neverSay: string[];
  budget: string; baseline: string; dip: string; approverUserId: string;
  // pass-through fields we don't edit
  logoPath?: string; posterPath?: string; pastPosterPath?: string;
};

export const blankForm = (): FormState => ({
  name: '', type: 'cafe', city: 'Kuala Lumpur', lat: '3.139', lon: '101.6869',
  logoDataUrl: '', brandColours: ['#1F6F5C'], pastPosterDataUrl: '', posterColours: [], posterDescription: '', posterStyleSummary: '',
  websiteUrl: '', websiteVoiceSummary: '', description: '', ethos: '', toneChips: [], products: [{ name: '', price: '' }], menuItems: [],
  targetCustomers: '', delivery: false, takeaway: false,
  channels: ['facebook', 'instagram'], language: 'both', neverSay: [], budget: '300', baseline: '', dip: '', approverUserId: 'u2',
});

export function fromBusiness(b: Business): FormState {
  const k = b?.brandKit;
  const products = asArray(k?.products);
  const menuItems = asArray(k?.menuItems);
  const colours = asArray<string>(k?.brandColours);
  return {
    name: b?.name || '', type: (b?.type as BusinessInputType) || 'cafe', city: b?.city || '', lat: String(b?.lat ?? ''), lon: String(b?.lon ?? ''),
    logoDataUrl: k?.logoDataUrl || '', brandColours: colours.length ? [...colours] : ['#1F6F5C'],
    pastPosterDataUrl: k?.pastPosterDataUrl || '', posterColours: [...asArray<string>(k?.posterColours)], posterDescription: k?.posterDescription || '',
    posterStyleSummary: k?.posterStyleSummary || '', websiteUrl: k?.websiteUrl || '', websiteVoiceSummary: k?.websiteVoiceSummary || '',
    description: k?.description || '', ethos: k?.ethos || '', toneChips: [...asArray<string>(k?.toneChips)],
    products: products.length ? products.map((p) => ({ name: p.name, price: String(p.priceRM) })) : [{ name: '', price: '' }],
    menuItems: menuItems.map((item) => ({ id: item.id, name: item.name, price: String(item.priceRM), imageDataUrl: item.imageDataUrl || '', bestseller: !!item.bestseller })),
    targetCustomers: k?.targetCustomers || '', delivery: !!k?.delivery, takeaway: !!k?.takeaway, channels: [...asArray<BrandKitChannelsItem>(k?.channels)], language: k?.language || 'both',
    neverSay: [...asArray<string>(k?.neverSay)], budget: String(k?.monthlyAdBudgetCapRM ?? ''),
    baseline: k?.baselineWeeklySalesRM == null ? '' : String(k.baselineWeeklySalesRM),
    dip: k?.lastBadWeatherDipPct == null ? '' : String(k.lastBadWeatherDipPct),
    approverUserId: k?.approverUserId || 'u2',
    logoPath: k?.logoPath, posterPath: k?.posterPath, pastPosterPath: k?.pastPosterPath,
  };
}

const num = (s: string) => (s.trim() === '' ? NaN : Number(s));
export const API_DATA_URL_LIMIT = 45 * 1024 * 1024;

export function toInput(f: FormState): { input?: BusinessInput; errors: string[] } {
  const e: string[] = [];
  const lat = num(f.lat), lon = num(f.lon), budget = num(f.budget), baseline = num(f.baseline), dip = num(f.dip);
  if (!f.name.trim()) e.push('Business name is required.');
  if (!f.city.trim()) e.push('City is required.');
  if (!(lat >= -90 && lat <= 90)) e.push('Latitude must be between -90 and 90.');
  if (!(lon >= -180 && lon <= 180)) e.push('Longitude must be between -180 and 180.');
  if (f.brandColours.length < 1 || f.brandColours.some((c) => !isHex(c))) e.push('Brand colours need 1 to 3 valid hex codes like #1F6F5C.');
  if (f.posterColours.some((c) => !isHex(c))) e.push('Poster colours must be valid hex codes.');
  if (f.description.trim().length > 200) e.push('Description must be 200 characters or fewer.');
  if (!f.ethos.trim()) e.push('Brand ethos is required.');
  const menu = f.menuItems.filter((item) => item.name.trim() || item.price.trim() || item.imageDataUrl);
  if (menu.length > 15) e.push('Keep the menu to 15 items.');
  menu.forEach((item, i) => {
    if (!item.name.trim()) e.push(`Menu item ${i + 1} needs a name.`);
    const price = num(item.price);
    if (!(price > 0)) e.push(`Menu item ${i + 1} needs a price above RM 0.`);
  });
  const products = menu.length
    ? menu.map((item) => ({ name: item.name.trim(), price: item.price }))
    : f.products.filter((p) => p.name.trim() || p.price.trim());
  if (!products.length) e.push('Add at least one product.');
  if (!menu.length) products.forEach((p, i) => {
    if (!p.name.trim()) e.push(`Product ${i + 1} needs a name.`);
    const v = num(p.price); if (!(v >= 0)) e.push(`Product ${i + 1} needs a price of RM 0 or more.`);
  });
  if (!f.targetCustomers.trim()) e.push('Describe your target customers.');
  if (!f.channels.length) e.push('Pick at least one channel.');
  if (!(budget >= 0 && budget <= 1_000_000)) e.push('Ad budget cap must be RM 0 – 1,000,000.');
  const baselineSet = f.baseline.trim() !== '';
  const dipSet = f.dip.trim() !== '';
  if (baselineSet && !(baseline >= 0)) e.push('Baseline weekly sales must be RM 0 or more.');
  if (dipSet && !(dip >= 0 && dip <= 100)) e.push('Bad-weather dip must be 0 – 100%.');
  const imgBytes = f.logoDataUrl.length + f.pastPosterDataUrl.length + f.menuItems.reduce((sum, item) => sum + item.imageDataUrl.length, 0);
  if (imgBytes >= API_DATA_URL_LIMIT) e.push(`Images total ${(imgBytes / 1048576).toFixed(1)} MB once encoded. Keep each image under 2 MB.`);
  if (e.length) return { errors: e };
  const opt = (s: string) => (s.trim() ? s.trim() : undefined);
  return {
    errors: [],
    input: {
      name: f.name.trim(), type: f.type, city: f.city.trim(), lat, lon,
      brandKit: {
        logoPath: f.logoPath, posterPath: f.posterPath, pastPosterPath: f.pastPosterPath,
        logoDataUrl: f.logoDataUrl || (f.logoPath ? undefined : ''),
        pastPosterDataUrl: f.pastPosterDataUrl || (f.pastPosterPath || f.posterPath ? undefined : ''),
        brandColours: f.brandColours.map((c) => c.toUpperCase()), posterColours: f.posterColours.map((c) => c.toUpperCase()),
        posterDescription: opt(f.posterDescription), posterStyleSummary: opt(f.posterStyleSummary),
        websiteUrl: opt(f.websiteUrl), websiteVoiceSummary: opt(f.websiteVoiceSummary),
        description: opt(f.description),
        ethos: f.ethos.trim(), toneChips: f.toneChips,
        products: products.map((p) => ({ name: p.name.trim(), priceRM: Number(p.price) })),
        menuItems: menu.length ? menu.map((item) => ({
          id: item.id, name: item.name.trim(), priceRM: Number(item.price),
          imageDataUrl: item.imageDataUrl || undefined, bestseller: item.bestseller || undefined,
        })) : [],
        targetCustomers: f.targetCustomers.trim(), delivery: f.delivery, takeaway: f.takeaway, channels: f.channels, language: f.language,
        neverSay: f.neverSay, monthlyAdBudgetCapRM: budget, approverUserId: f.approverUserId || 'u2',
        ...(baselineSet ? { baselineWeeklySalesRM: baseline } : {}),
        ...(dipSet ? { lastBadWeatherDipPct: dip } : {}),
      },
    },
  };
}
