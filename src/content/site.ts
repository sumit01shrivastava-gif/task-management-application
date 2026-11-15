/**
 * Site content.
 *
 * Every product statement here is taken from the Globaz IroNav / homepage
 * reference wireframes (comdez.co.uk/globaz-wireframes). Do not add technical
 * figures, specifications, certifications or compatibility claims without an
 * approved source.
 */

const GLOBAZ = 'https://www.globaztechnologies.com';

export const links = {
  contact: `${GLOBAZ}/contact`,
  about: `${GLOBAZ}/about`,
  news: `${GLOBAZ}/news`,
  careers: `${GLOBAZ}/careers`,
  allProducts: `${GLOBAZ}/products`,
  infinidomeIroNav: 'https://infinidome.com/ironav/',
  email: 'info@globaztechnologies.com',
} as const;

export const nav = [
  { label: 'Systems', href: '#systems' },
  { label: 'Air Systems', href: '#systems', filter: 'air' },
  { label: 'Navigation & Connectivity', href: '#ironav' },
  { label: 'Engineering', href: '#integration' },
  { label: 'About Globaz', href: links.about, external: true },
  { label: 'Contact', href: '#contact' },
] as const;

export const hero = {
  kicker: 'Globaz Technologies / Navigation & Connectivity',
  headline: ['Redefining Navigation', 'for Autonomous Aerospace.'],
  body: 'Advanced navigation technologies and aerospace integration for next-generation uncrewed platforms.',
  primary: { label: 'Explore IroNav', href: '#experience' },
  secondary: { label: 'Discuss Integration', href: '#contact' },
  facts: [
    { k: 'Technology developer', v: 'infiniDome' },
    { k: 'India integration enquiries', v: 'Globaz Technologies' },
    { k: 'Configuration and availability', v: 'Discuss with Globaz' },
  ],
};

export const ironav = {
  name: 'IroNav',
  tagline: 'Visual navigation and GNSS interference protection',
  developer: 'Developed by infiniDome for uncrewed aircraft.',
  platformLabel: 'IroNav Integrated Navigation Platform',
};

/** Overlay copy for each stage of the scroll-controlled experience. */
export const experience = {
  stages: [
    {
      id: 'reveal',
      index: '01',
      kicker: 'Platform',
      title: ironav.platformLabel,
      body: 'A multirotor uncrewed aircraft with an IroNav module mounted beneath the central assembly.',
    },
    {
      id: 'orbit',
      index: '02',
      kicker: 'Airframe',
      title: 'One platform, every angle.',
      body: 'Carbon-fibre arms, coaxial motor and propeller assemblies, landing gear and the central equipment stack.',
    },
    {
      id: 'explode',
      index: '03',
      kicker: 'Exploded assembly',
      title: 'Separated along its build axes.',
      body: 'Each major assembly moves along a deliberate path so the integration of the aircraft remains readable.',
    },
    {
      id: 'ironav',
      index: '04',
      kicker: 'Navigation module',
      title: ironav.name,
      body: ironav.tagline,
    },
    {
      id: 'internals',
      index: '05',
      kicker: 'Conceptual visualisation',
      title: 'An illustrative look inside.',
      body: 'Circuit board, processing components, connectors, interfaces and enclosure — shown as a conceptual exploded view.',
    },
    {
      id: 'reassemble',
      index: '06',
      kicker: 'Integration',
      title: 'Engineered for navigation resilience.',
      body: 'Explore IroNav and discuss integration possibilities for your uncrewed aircraft platform with Globaz Technologies.',
    },
  ],
  disclaimer:
    'Illustrative CGI only. These elements are conceptual and do not represent the verified internal architecture of IroNav.',
  modelNote:
    'Conceptual 3D representation based on the reference photograph. Not CAD-derived; proportions are approximate.',
};

export const productInfo = {
  kicker: 'Understanding IroNav',
  headline: 'Visual Navigation. Resilient Operations.',
  intro:
    'IroNav provides visual navigation and GNSS interference protection. It is developed by infiniDome for uncrewed aircraft. Globaz Technologies handles integration enquiries, platform evaluation and support discussions in India.',
  pillars: [
    {
      id: 'visual',
      title: 'Visual navigation',
      body: 'IroNav is positioned as a visual navigation technology for uncrewed aircraft — relevant to programmes that must plan for operation where satellite positioning may be disrupted or unavailable.',
    },
    {
      id: 'gnss',
      title: 'GNSS interference protection',
      body: 'Alongside visual navigation, IroNav is presented by its developer as providing GNSS interference protection. Ask Globaz which test results and integration documents are available for your configuration.',
    },
    {
      id: 'uas',
      title: 'Uncrewed aircraft applications',
      body: 'Developed by infiniDome for uncrewed aircraft. Suitability for a specific airframe and mission is assessed case by case with the Globaz team.',
    },
    {
      id: 'integration',
      title: 'Platform integration considerations',
      body: 'Airframe interfaces, sensor placement, size, weight and power requirements all depend on the configuration and are reviewed during an integration discussion.',
    },
  ],
  evidence: {
    title: 'Technical information and evidence',
    body: 'Start with the OEM’s published technical overview. Ask Globaz which test results and integration documents are available for your configuration.',
    cta: { label: 'View infiniDome’s product overview', href: links.infinidomeIroNav },
  },
};

export const integration = {
  kicker: 'Platform integration',
  headline: 'How Globaz approaches an integration discussion.',
  intro:
    'Globaz brings defence and aerospace technologies onto land, air and maritime platforms. The India-based team supports engineering, integration and testing.',
  cards: [
    {
      index: '01',
      title: 'Mission Requirement',
      body: 'Evaluate navigation requirements where satellite positioning may be disrupted or unavailable.',
      icon: 'mission',
    },
    {
      index: '02',
      title: 'Aircraft Compatibility',
      body: 'Review interfaces, sensor placement, size, weight and power requirements for the specific configuration.',
      icon: 'aircraft',
    },
    {
      index: '03',
      title: 'Integration & Evaluation',
      body: 'Discuss integration, evaluation and support scope with Globaz Technologies.',
      icon: 'integration',
    },
  ] as const,
  capabilities: [
    { title: 'Systems Integration & Testing', body: 'Discuss platform interfaces, configuration and evaluation requirements.' },
    { title: 'Noida Facility & Local Assembly', body: 'Review the local engineering and assembly scope for your programme.' },
    { title: 'Training & Lifecycle Support', body: 'Discuss available operator training, maintenance and support.' },
  ],
};

export type Domain = 'land' | 'air' | 'maritime' | 'navigation' | 'autonomy';

export interface PortfolioItem {
  name: string;
  group: string;
  domains: Domain[];
  /** Only descriptions published on the Globaz reference pages. */
  summary?: string;
  oem?: string;
  href: string;
  glyph: 'mortar' | 'shield' | 'solar' | 'wave' | 'nav' | 'sun' | 'aura' | 'link' | 'pilot' | 'land' | 'hover';
}

export const portfolio: { kicker: string; headline: string; intro: string; filters: { id: 'all' | Domain; label: string }[]; items: PortfolioItem[] } = {
  kicker: 'Explore other systems',
  headline: 'The Globaz systems portfolio.',
  intro: 'Platforms, defence systems, navigation, connectivity and autonomy technologies listed on the Globaz Technologies website.',
  filters: [
    { id: 'all', label: 'All systems' },
    { id: 'land', label: 'Land' },
    { id: 'air', label: 'Air' },
    { id: 'maritime', label: 'Naval & Maritime' },
    { id: 'navigation', label: 'Navigation & Connectivity' },
    { id: 'autonomy', label: 'Autonomy' },
  ],
  items: [
    { name: 'IroNav', group: 'Navigation & connectivity', domains: ['air', 'navigation'], summary: 'Visual navigation and GNSS interference protection from infiniDome.', oem: 'infiniDome', href: '#ironav', glyph: 'nav' },
    { name: 'Thyreon Counter-UAS', group: 'Platforms & defence systems', domains: ['land'], summary: 'Integrated counter-drone system.', href: `${GLOBAZ}/product/thyreon`, glyph: 'shield' },
    { name: 'Halo', group: 'Navigation & connectivity', domains: ['navigation'], summary: 'Multi-link connectivity for uncrewed systems from Elsight.', oem: 'Elsight', href: `${GLOBAZ}/product/halo`, glyph: 'link' },
    { name: 'Automated Mortar System', group: 'Platforms & defence systems', domains: ['land'], href: `${GLOBAZ}/product/ams`, glyph: 'mortar' },
    { name: 'Marine Solar Drone', group: 'Platforms & defence systems', domains: ['air'], href: `${GLOBAZ}/product/marine-solar`, glyph: 'solar' },
    { name: 'Naval Degaussing', group: 'Platforms & defence systems', domains: ['maritime'], href: `${GLOBAZ}/product/degaussing`, glyph: 'wave' },
    { name: 'SunStone', group: 'Navigation & connectivity', domains: ['navigation'], href: `${GLOBAZ}/product/sunstone`, glyph: 'sun' },
    { name: 'Aura', group: 'Navigation & connectivity', domains: ['navigation'], href: `${GLOBAZ}/product/aura`, glyph: 'aura' },
    { name: 'OptiPilot', group: 'Autonomy', domains: ['autonomy'], href: `${GLOBAZ}/product/optipilot`, glyph: 'pilot' },
    { name: 'WonderLand', group: 'Autonomy', domains: ['autonomy'], href: `${GLOBAZ}/product/wonderland`, glyph: 'land' },
    { name: 'HoverSafe', group: 'Autonomy', domains: ['autonomy'], href: `${GLOBAZ}/product/hoversafe`, glyph: 'hover' },
  ],
};

export const partners = ['infiniDome', 'Wonder Robotics', 'Elsight', 'Marine Instruments'];

/**
 * Brahmastra — associated second business.
 * No approved brand information or imagery was supplied, so this section
 * deliberately makes no product or capability statements. Add approved copy
 * to `statement` / `points` and a logo/image path when available.
 */
export const brahmastra = {
  name: 'Brahmastra',
  kicker: 'Associated business',
  statement: 'Brahmastra is an associated business of Globaz Technologies.',
  body: 'For information about Brahmastra, its activities and how it works alongside Globaz Technologies, please contact the team directly.',
  points: [] as string[],
  image: null as string | null,
  cta: { label: 'Enquire about Brahmastra', subject: 'Brahmastra enquiry' },
};

export const contact = {
  kicker: 'Discuss a requirement',
  headline: 'Discuss IroNav with Globaz.',
  intro:
    'Share a brief, non-sensitive summary. The team can arrange the appropriate channel for programme and technical details.',
  enquiries: [
    { id: 'briefing', title: 'Request a Technical Briefing', body: 'Discuss platform fit and available evaluation material.', subject: 'IroNav — Technical briefing request' },
    { id: 'integration', title: 'Discuss Platform Integration', body: 'Ask about integrating IroNav on your platform.', subject: 'IroNav — Platform integration' },
    { id: 'rfi', title: 'Discuss an RFI/RFP', body: 'Discuss your requirement and India support scope.', subject: 'RFI/RFP discussion' },
    { id: 'general', title: 'General Enquiries', body: 'General and media enquiries for Globaz Technologies.', subject: 'General enquiry' },
  ],
  offices: ['Corporate office in New Delhi', 'Electronics facility in Noida'],
};
