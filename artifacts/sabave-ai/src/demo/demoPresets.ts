import type { BrandKitChannelsItem, BrandKitLanguage, BusinessInput, BusinessInputType } from '@workspace/api-client-react';

/**
 * One entry per demo account. Values are copied from data/businesses.json.
 * Passwords are never stored here. Dobi and Butik are created by normal signup;
 * matching is the username, or the email signup stored, case-insensitive.
 * Takeaway is not in the seed file. The wizard requires a yes/no, so each owner
 * preset includes one. It stays editable.
 */
export const DEMO_PREFILL_BADGE = 'Demo data pre-filled · you can edit anything';

export type DemoTeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  invited: boolean;
};

export type DemoMenuItem = {
  id: string;
  name: string;
  priceRM: number;
  imagePath: string;
};

type DemoBusiness = {
  name: string;
  type: BusinessInputType;
  description: string;
  city: string;
  lat: number;
  lon: number;
  delivery: boolean;
  takeaway: boolean;
  channels: BrandKitChannelsItem[];
  language: BrandKitLanguage;
  logoPath: string;
  brandColours: string[];
  toneChips: string[];
  posterPath: string;
  posterDescription: string;
  posterStyleSummary: string;
  posterColours: string[];
  websiteUrl: string;
  websiteVoiceSummary: string;
  menu: DemoMenuItem[];
  team: DemoTeamMember[];
  budget: number;
  baseline: number;
  dip: number;
  neverSay: string[];
  targetCustomers: string;
};

export type OwnerDemoPreset = {
  username: string;
  aliases: string[];
  role: 'owner';
  business: DemoBusiness;
};

export type StaffDemoPreset = {
  username: string;
  aliases: string[];
  role: 'staff';
  joins: string;
};

export type DemoPreset = OwnerDemoPreset | StaffDemoPreset;

const TONE: Record<string, string> = {
  warm: 'Warm',
  family: 'Family',
  traditional: 'Traditional',
  modern: 'Modern',
  playful: 'Playful',
  premium: 'Premium',
  'halal-friendly': 'Halal-friendly',
  neighbourly: 'Neighbourly',
};

function tones(values: string[]) {
  return values.map((value) => TONE[value.toLowerCase()] ?? value);
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    username: 'Tan',
    aliases: ['tan', 'mr. tan'],
    role: 'owner',
    business: {
      name: 'Kopitiam Selera Pagi',
      type: 'cafe',
      description: 'Old-school kopitiam warmth, affordable breakfast for working families.',
      city: 'Shah Alam',
      lat: 3.0733,
      lon: 101.5185,
      delivery: true,
      takeaway: true,
      channels: ['facebook', 'instagram', 'whatsapp'],
      language: 'both',
      logoPath: '/seed/selera-pagi-logo.svg',
      brandColours: ['#B45309', '#FDE68A'],
      toneChips: tones(['traditional', 'family', 'halal-friendly']),
      posterPath: '/seed/selera-pagi-poster.svg',
      posterDescription: 'A warm breakfast poster with bold type and a simple kopi cup illustration.',
      posterStyleSummary: 'Traditional kopitiam warmth, friendly rounded lettering, and clear product-led layouts.',
      posterColours: ['#B45309', '#FDE68A'],
      websiteUrl: 'https://example.com/selerapagi',
      websiteVoiceSummary: 'Friendly, familiar Malaysian breakfast language that emphasizes value and family.',
      menu: [
        { id: 'mi_selera_kopi', name: 'Kopi O', priceRM: 2.5, imagePath: '/demo/selera-kopi.svg' },
        { id: 'mi_selera_nasi', name: 'Nasi Lemak Ayam', priceRM: 8, imagePath: '/demo/selera-nasi.svg' },
        { id: 'mi_selera_roti', name: 'Roti Bakar Kaya', priceRM: 4, imagePath: '/demo/selera-roti.svg' },
      ],
      team: [
        { id: 'tm_selera_owner', name: 'Mr. Tan', email: 'tan@selerapagi.demo', role: 'owner', invited: false },
        { id: 'tm_selera_aisyah', name: 'Aisyah', email: 'aisyah@selerapagi.demo', role: 'staff', invited: true },
      ],
      budget: 600,
      baseline: 9000,
      dip: 22,
      neverSay: ['pork', 'alcohol', 'cheapest in town'],
      targetCustomers: 'Office workers and families nearby.',
    },
  },
  {
    username: 'Aisyah',
    aliases: ['aisyah'],
    role: 'staff',
    joins: 'Tan',
  },
  {
    username: 'Dobi',
    aliases: ['dobi'],
    role: 'owner',
    business: {
      name: 'Dobi Ceria Express',
      type: 'laundromat',
      description: 'Fast, clean and friendly self-service laundry for busy people.',
      city: 'Petaling Jaya',
      lat: 3.1073,
      lon: 101.6067,
      delivery: false,
      takeaway: false,
      channels: ['facebook', 'instagram', 'tiktok'],
      language: 'both',
      logoPath: '/seed/dobi-ceria-logo.svg',
      brandColours: ['#0369A1', '#BAE6FD'],
      toneChips: tones(['modern', 'playful']),
      posterPath: '/seed/dobi-ceria-poster.svg',
      posterDescription: 'A bright laundry service poster with clean blocks and playful bubbles.',
      posterStyleSummary: 'Modern, cheerful, and practical with rounded typography and quick-to-read offers.',
      posterColours: ['#0369A1', '#BAE6FD'],
      websiteUrl: 'https://example.com/dobiceria',
      websiteVoiceSummary: 'Upbeat and helpful language for busy students and working adults.',
      menu: [
        { id: 'mi_dobi_wash', name: 'Wash', priceRM: 5, imagePath: '/demo/dobi-wash.svg' },
        { id: 'mi_dobi_dry', name: 'Dry', priceRM: 5, imagePath: '/demo/dobi-dry.svg' },
        { id: 'mi_dobi_fold', name: 'Wash & Fold (5kg)', priceRM: 15, imagePath: '/demo/dobi-fold.svg' },
        { id: 'mi_dobi_duvet', name: 'Duvet Clean', priceRM: 25, imagePath: '/demo/dobi-duvet.svg' },
      ],
      team: [
        { id: 'tm_dobi_owner', name: 'Dobi', email: 'dobi@dobiceria.demo', role: 'owner', invited: false },
      ],
      budget: 300,
      baseline: 4500,
      dip: 15,
      neverSay: ['kills all germs', '100% hygienic'],
      targetCustomers: 'Students and young working adults.',
    },
  },
  {
    username: 'Butik',
    aliases: ['butik'],
    role: 'owner',
    business: {
      name: 'Butik Anggun',
      type: 'retail',
      description: 'Elegant modest fashion at honest prices.',
      city: 'Johor Bahru',
      lat: 1.4927,
      lon: 103.7414,
      delivery: true,
      takeaway: true,
      channels: ['facebook', 'instagram', 'whatsapp'],
      language: 'bm',
      logoPath: '/seed/butik-anggun-logo.svg',
      brandColours: ['#BE185D', '#FCE7F3'],
      toneChips: tones(['premium', 'traditional']),
      posterPath: '/seed/butik-anggun-poster.svg',
      posterDescription: 'An elegant modest-fashion poster with generous spacing and soft pink accents.',
      posterStyleSummary: 'Elegant, feminine layouts with refined typography and focused product photography.',
      posterColours: ['#BE185D', '#FCE7F3'],
      websiteUrl: 'https://example.com/butikanggun',
      websiteVoiceSummary: 'Confident Bahasa Malaysia copy centered on modest style and honest pricing.',
      menu: [
        { id: 'mi_butik_baju', name: 'Baju Kurung', priceRM: 129, imagePath: '/demo/butik-baju.svg' },
        { id: 'mi_butik_tudung', name: 'Tudung Bawal', priceRM: 35, imagePath: '/demo/butik-tudung.svg' },
        { id: 'mi_butik_batik', name: 'Batik Shirt', priceRM: 89, imagePath: '/demo/butik-batik.svg' },
      ],
      team: [
        { id: 'tm_butik_owner', name: 'Butik', email: 'butik@butikanggun.demo', role: 'owner', invited: false },
      ],
      budget: 800,
      baseline: 12000,
      dip: 28,
      neverSay: ['cheap', 'murah gila', 'Butik Seri'],
      targetCustomers: 'Women aged 25-50 shopping for work and festive occasions.',
    },
  },
];

export type DemoIdentity = { username?: string; name?: string; email?: string; role?: string } | null | undefined;

function identityKeys(identity: DemoIdentity): string[] {
  if (!identity) return [];
  const email = identity.email?.trim().toLowerCase() ?? '';
  const local = email.includes('@') ? email.slice(0, email.indexOf('@')) : '';
  return [identity.username, identity.name, email, local]
    .map((value) => value?.trim().toLowerCase() ?? '')
    .filter((value) => value.length > 0);
}

export function matchDemoPreset(identity: DemoIdentity): DemoPreset | undefined {
  const keys = identityKeys(identity);
  if (!keys.length) return undefined;
  return DEMO_PRESETS.find((preset) => preset.aliases.some((alias) => keys.includes(alias.toLowerCase())));
}

export function ownerDemoPreset(identity: DemoIdentity): OwnerDemoPreset | undefined {
  const preset = matchDemoPreset(identity);
  return preset?.role === 'owner' ? preset : undefined;
}

export function isDemoIdentity(identity: DemoIdentity): boolean {
  return !!matchDemoPreset(identity);
}

export function isStaffSession(identity: DemoIdentity): boolean {
  if (!identity) return false;
  if (identity.role === 'staff') return true;
  return matchDemoPreset(identity)?.role === 'staff';
}

export function ownerShellInput(input: {
  businessName: string;
  ownerName: string;
  email: string;
  userId: string;
}): BusinessInput {
  const email = input.email.trim().toLowerCase();
  return {
    name: input.businessName.trim().slice(0, 150) || 'New business',
    type: 'cafe',
    city: '',
    lat: 0,
    lon: 0,
    onboardingCompleted: false,
    onboardingStep: 0,
    teamMembers: [{
      id: 'tm_owner_shell',
      name: input.ownerName.trim().slice(0, 150) || 'Owner',
      email,
      role: 'owner',
      invited: false,
    }],
    brandKit: {
      brandColours: ['#0F7A5C'],
      ethos: '',
      toneChips: [],
      products: [],
      targetCustomers: '',
      delivery: false,
      channels: [],
      language: 'both',
      neverSay: [],
      monthlyAdBudgetCapRM: 0,
      approverUserId: input.userId,
    },
  };
}

export async function resetDemoAccount(userId: string): Promise<void> {
  const response = await fetch('/api/demo/reset', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user-id': userId },
  });
  if (!response.ok) {
    let message = 'This demo could not be reset.';
    try {
      const body = await response.json() as { error?: string };
      if (body.error) message = body.error;
    } catch { /* keep the fallback */ }
    throw new Error(message);
  }
}
