export type SiteLink = { href: string; label: string };

export const primaryNav: SiteLink[] = [
  { href: '/', label: 'Home' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/pricing', label: 'Pricing' },
];

/** Compact marketing footer. Docs index still reads the Docs column below. */
export const footerLinks: SiteLink[] = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/login', label: 'Log in' },
  { href: '/docs', label: 'Docs' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

export const footerColumns: { title: string; links: SiteLink[] }[] = [
  {
    title: 'Product',
    links: [
      { href: '/', label: 'Home' },
      { href: '/solutions', label: 'Solutions' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/login', label: 'Live demo' },
      { href: '/changelog', label: 'Changelog' },
    ],
  },
  {
    title: 'Docs',
    links: [
      { href: '/docs/getting-started', label: 'Getting started' },
      { href: '/docs/brand-kit', label: 'Brand Kit' },
      { href: '/docs/campaigns', label: 'Campaigns & approvals' },
      { href: '/docs/roles', label: 'Roles & team' },
      { href: '/docs/activity-log', label: 'Activity log' },
      { href: '/docs/weather', label: 'Weather signals & data' },
      { href: '/docs/orbyte', label: 'Orbyte integration & API' },
      { href: '/docs/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/research', label: 'Research & sources' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy & PDPA' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/security', label: 'Security' },
    ],
  },
];

export const docPages: Record<string, { title: string; lede: string }> = {
  'getting-started': {
    title: 'Getting started',
    lede: 'Sign up, finish the shop survey, meet the first haze alert, and approve a campaign.',
  },
  'brand-kit': {
    title: 'Brand Kit',
    lede: 'Every field the poster uses: logo, colours, tone, menu photos, and the never-say list.',
  },
  campaigns: {
    title: 'Campaigns & approvals',
    lede: 'How rules pick the options, what AI is allowed to write, and what approve or reject does.',
  },
  roles: {
    title: 'Roles & team',
    lede: 'What Owner and Staff can each do, and where the server enforces it.',
  },
  'activity-log': {
    title: 'Activity log',
    lede: 'What gets recorded, how to read a line, and how to export it.',
  },
  weather: {
    title: 'Weather signals & data',
    lede: 'Where the haze forecast comes from, the PM2.5 bands, and what simulate mode does.',
  },
  orbyte: {
    title: 'Orbyte integration & API',
    lede: 'Which business-profile fields sabave.ai reads, and the endpoints a connector can call.',
  },
  faq: {
    title: 'FAQ',
    lede: 'Straight answers: ChatGPT, a wrong forecast, who can approve, cost, and calm months.',
  },
};
