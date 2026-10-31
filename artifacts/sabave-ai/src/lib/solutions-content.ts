export const solutionsDocumentTitle = 'Solutions · sabave.ai';

export const solutionActions = {
  demo: { label: 'Try the demo', href: '/login' },
  pricing: { label: 'See pricing', href: '/pricing' },
} as const;

export const heroContent = {
  eyebrow: 'SOLUTIONS',
  title: 'Weather changes how customers buy. sabave.ai changes your marketing before it does.',
  subtext:
    'sabave.ai watches the forecast for your outlet, picks the right campaign for your business, writes the poster copy in BM and English, and waits for the owner to approve. Built as an Orbyte module for Malaysian SMEs.',
};

export type ProblemStat = {
  value: string;
  detail: string;
  attribution: string;
};

export const problemContent = {
  heading: 'The problem in numbers',
  stats: [
    {
      value: '20–35%',
      detail: 'Sales drop reported by eateries during haze.',
      attribution: 'Source: Malay Mail, 25 Oct 2026',
    },
    {
      value: 'RM20–50m / day',
      detail: 'Estimated economic losses during haze episodes.',
      attribution: 'Source: The Star, 14 Oct 2026',
    },
    {
      value: '~90 min',
      detail: 'To check the forecast, design a poster, write captions and post, by hand.',
      attribution: 'Estimate; manual process',
    },
  ] satisfies ProblemStat[],
  closing: 'Big chains have marketing teams. A kopitiam has the owner.',
};

export type SolutionStep = {
  title: string;
  body: string;
};

export const howItWorksContent = {
  heading: 'How it works',
  steps: [
    {
      title: 'Watch',
      body: "checks the PM2.5 forecast for the outlet's location (Open-Meteo / Copernicus CAMS).",
    },
    {
      title: 'Trigger',
      body: 'when air quality is forecast to turn Unhealthy, it acts about 2 days ahead.',
    },
    {
      title: 'Decide',
      body: "fixed business rules pick campaign options that fit the business (for example, no delivery push for a shop that doesn't deliver).",
    },
    {
      title: 'Draft',
      body: 'AI writes the poster copy in BM and English using the Brand Kit. AI is used only to write the copy.',
    },
    {
      title: 'Approve and post',
      body: 'staff can draft; only the owner can approve. Every step is written to the activity log.',
    },
  ] satisfies SolutionStep[],
  callout: {
    title: 'Why 2 days early?',
    body: 'Ad review can take up to 24 hours (Meta, via Social Media Today 2021), and a Facebook post loses half its reach in about 81 minutes (Graffius 2025). Acting on the day is too late.',
  },
};

export type BusinessTab = {
  id: string;
  label: string;
  weather: string;
  suggestions: readonly string[];
  exampleHeadline?: string;
  tag?: string;
  note?: string;
  citation?: string;
};

export const businessContent = {
  heading: 'Solutions by business type',
  weatherLabel: 'What the weather does to you',
  suggestsLabel: 'What sabave.ai suggests',
  tabs: [
    {
      id: 'fnb',
      label: 'F&B · Kopitiam / café / hawker',
      weather: 'Fewer walk-ins on hazy and rainy days; takeaway and delivery hold steady.',
      suggestions: [
        'Delivery push',
        'Family breakfast bundle',
        '"Warm welcome indoors" dine-in offer',
      ],
      exampleHeadline: 'Jerebu di luar? Kopi panas sampai ke pintu anda.',
      tag: 'Starting here: F&B in the Klang Valley',
    },
    {
      id: 'laundromat',
      label: 'Laundromat / services',
      weather: "Rain and haze mean people won't dry clothes outdoors; demand shifts to machines and pickup.",
      suggestions: ['Pickup and wash-and-fold', 'Comfortable indoor drop-off offer'],
      note: "No delivery? sabave.ai never suggests a delivery campaign for this business.",
    },
    {
      id: 'retail',
      label: 'Retail / boutique',
      weather: 'Foot traffic falls; shoppers move online and treat themselves on gloomy days.',
      suggestions: ['Online order push', 'Indoor shopping promotion', 'Small "treat yourself" bundle'],
      citation: 'Kim & Trusov 2025: polluted days shift spending towards treat purchases',
    },
  ] satisfies BusinessTab[],
  closing: 'Same engine, different Brand Kit. A new business is a setup change, not a rebuild.',
};

export type SignalStatus = 'live' | 'coming-next' | 'planned';

export type WeatherSignal = {
  id: 'haze' | 'rain' | 'heat' | 'floods';
  name: string;
  status: SignalStatus;
  legend?: string;
};

export const signalStatusLabels: Record<SignalStatus, string> = {
  live: 'Live',
  'coming-next': 'Coming next',
  planned: 'Planned',
};

export const signalsContent = {
  heading: 'Weather signals',
  items: [
    {
      id: 'haze',
      name: 'Haze (PM2.5)',
      status: 'live',
      legend: 'Good <35 · Moderate 35–55 · Unhealthy 55–150 · Very Unhealthy >150 µg/m³.',
    },
    {
      id: 'rain',
      name: 'Rain',
      status: 'coming-next',
    },
    {
      id: 'heat',
      name: 'Heat',
      status: 'coming-next',
    },
    {
      id: 'floods',
      name: 'Floods / monsoon alerts',
      status: 'planned',
    },
  ] satisfies WeatherSignal[],
};

export type ControlRow = {
  label: string;
  detail: string;
};

export const controlContent = {
  eyebrow: 'You stay in control',
  heading: 'The owner always has the final say',
  rows: [
    {
      label: 'Approval gate',
      detail: 'the server blocks publishing until the Owner approves',
    },
    {
      label: 'Reject',
      detail: 'stops the action and records the reason',
    },
    {
      label: 'Exceptions',
      detail: 'missing data goes to a person, never a guess',
    },
    {
      label: 'Activity log',
      detail: 'who, what, when and why, written live',
    },
    {
      label: "AI's job",
      detail: 'captions and brand summaries only, never budgets or decisions',
    },
    {
      label: 'Privacy',
      detail: 'business data only, per PDPA 2010 principles',
    },
  ] satisfies ControlRow[],
};

export const orbyteContent = {
  heading: 'Built for Orbyte',
  points: [
    'Reads business profiles from the Orbyte hub',
    'Reusable social-connector API for other Orbyte modules',
    'New weather signals plug into the same journey',
  ],
};

export const ctaContent = {
  heading: "Weather can't be stopped. Lost sales can.",
};

export const sourcesContent = {
  heading: 'Sources',
  line: 'Malay Mail (25 Oct 2026); The Star (14 Oct 2026); Meta via Social Media Today (2021); Graffius (2025); Kim & Trusov (2025); Open-Meteo / Copernicus CAMS; DOSM Economic Census 2023.',
};
