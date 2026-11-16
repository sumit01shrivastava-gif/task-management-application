/**
 * IroNav — corporate product presentation by Globaz Technologies.
 *
 * Sources (all statements on the page must trace to one of these):
 *  [G]  globaztechnologies.com — home and About pages (corporate profile, credentials)
 *  [GP] globaztechnologies.com/product/ironav — IroNav description, differentiators,
 *       technical specifications and use cases as published by Globaz Technologies
 *  [W]  Globaz IroNav wireframe (comdez.co.uk/globaz-wireframes/ironav.html)
 *
 * IroNav is developed by infiniDome. Globaz Technologies is the integration and
 * evaluation contact in India. Visualisations on the page are illustrative and
 * are labelled as such; none is presented as a recorded product demonstration.
 */

export const LINKS = {
  globaz: 'https://www.globaztechnologies.com',
  productPage: 'https://www.globaztechnologies.com/product/ironav',
  infinidome: 'https://infinidome.com/ironav/',
} as const;

export const NAV = [
  { id: 'globaz', n: '01', label: 'Globaz' },
  { id: 'context', n: '02', label: 'Context' },
  { id: 'product', n: '03', label: 'Product' },
  { id: 'anatomy', n: '04', label: 'Architecture' },
  { id: 'operations', n: '05', label: 'Operations' },
  { id: 'integration', n: '06', label: 'Integration' },
] as const;

export const HERO = {
  category: 'Navigation & Communication Resilience', // [GP] vertical name
  headline: ['Navigation', 'Beyond GNSS', 'Dependency.'],
  // [GP] "IroNav combines autonomous visual navigation with battle-proven GNSS anti-jamming."
  sub: 'Autonomous visual navigation and GNSS anti-jamming in a single pod for uncrewed aircraft.',
  attribution: [
    { k: 'Developer', v: 'infiniDome' },
    { k: 'India', v: 'Globaz Technologies — integration and evaluation' },
  ],
  figure: 'IroNav-integrated multirotor platform',
};

export const GLOBAZ = {
  index: '01',
  label: 'Globaz Technologies',
  // [G] About: "an Indian defence and aerospace systems integrator ... build, integrate and field mission-ready systems"
  headline: 'An Indian defence and aerospace systems integrator.',
  body: [
    'Globaz Technologies builds, integrates and fields mission-ready systems for the Indian Armed Forces, Central Armed Police Forces, security agencies and OEMs seeking a capable Indian partner.',
    'Its portfolio spans land, air, naval and maritime systems, with a dedicated focus on navigation and communication resilience for operations in contested electromagnetic environments.',
  ],
  // [G] credentials as published
  credentials: [
    { v: 'AS9100D · ISO 9001:2015', k: 'Certified quality management' },
    { v: 'Industrial Licence', k: 'Defence manufacturing' },
    { v: '25,000+ sq ft', k: 'Manufacturing and assembly facility, Noida' },
    { v: '7', k: 'Global OEM partners' },
  ],
  // [G] portfolio: Full-Spectrum Resilience / Navigation & Enablers
  vertical: {
    title: 'Navigation & Enablers',
    items: ['IroNav', 'SunStone', 'Aura', 'OptiPilot', 'WonderLand', 'HoverSafe', 'Halo'],
  },
  // [G] news: "infiniDome Announces Strategic Partnership with Globaz Technologies"
  partnership: 'IroNav is developed by infiniDome. Globaz Technologies and infiniDome have announced a strategic partnership for India.',
  facilityCaption: 'Globaz Technologies',
};

export const CONTEXT = {
  index: '02',
  label: 'Operational context',
  headline: 'When satellite navigation cannot be assumed.',
  intro:
    'Uncrewed aircraft depend on GNSS for position. In contested electromagnetic environments that signal may be jammed, denied or unavailable. IroNav is designed for exactly this condition.',
  // [GP] description + differentiators
  states: [
    {
      id: 'protected',
      k: 'GNSS available',
      title: 'Protected reception',
      body: 'While GNSS is available, null-steering anti-jamming protects the protected bands.',
    },
    {
      id: 'denied',
      k: 'GNSS jammed or denied',
      title: 'Automatic fallback',
      body: 'GPS availability voting detects degradation and hands over without operator input.',
    },
    {
      id: 'visual',
      k: 'Visual navigation',
      title: 'Map-free continuity',
      body: 'Navigation continues by visual reference to the terrain below — no pre-loaded maps required.',
    },
  ],
  note: 'Illustrative visualisation of published operating principles. Terrain: licensed aerial imagery.',
};

export const PRODUCT = {
  index: '03',
  label: 'The product',
  headline: 'One pod. Two layers of resilience.',
  // [GP] key differentiators
  points: [
    'GNSS anti-jamming and GNSS-independent visual navigation in a single pod',
    'Map-free visual navigation — no pre-loaded maps required',
    'GPS availability voting with automatic fallback, without operator input',
    'Compatible with MAVLink flight controllers — rotary, FPV and VTOL',
    'Optional precision landing on moving or maritime platforms',
  ],
  // [GP] technical specifications, as published
  specs: [
    { k: 'Dimensions', v: '132 × 62.5 × 76.5 mm' },
    { k: 'Weight', v: '400 g, single pod' },
    { k: 'Protected GNSS bands', v: 'L1/E1 + L2 · L1/E1 + G1' },
    { k: 'GNSS protection', v: 'Null-steering anti-jamming' },
    { k: 'Anti-jamming gain', v: '−40 dB' },
    { k: 'Optical sensor', v: 'Visible / thermal / LRF' },
    { k: 'Field of view', v: '90–110°' },
    { k: 'Navigation accuracy', v: '~2–5% distance deviation; operational from 0 m altitude' },
    { k: 'Integration', v: 'MAVLink protocol' },
  ],
  specSource: 'Specifications as published by Globaz Technologies. Configuration-specific performance is confirmed during evaluation.',
  viewNote: 'Product view from the original photograph. A full 360° presentation requires multi-angle product photography or authorised CAD data.',
};

export const ANATOMY = {
  index: '04',
  label: 'Platform architecture',
  stages: [
    { id: 'original', kicker: 'Integrated platform', title: 'A complete airframe.', body: 'IroNav mounts beneath the central assembly of a coaxial multirotor platform.' },
    { id: 'propellers', kicker: 'Propulsion', title: 'Rotor assemblies.', body: 'Upper and lower rotors, separated along their motor axes.' },
    { id: 'motors', kicker: 'Propulsion', title: 'Motor assemblies.', body: 'Coaxial motor pairs with their X-plate mounts and clamp blocks.' },
    { id: 'arms', kicker: 'Structure', title: 'Carbon-fibre arms.', body: 'Tubular arms released from the central frame.' },
    { id: 'gear', kicker: 'Structure', title: 'Landing gear.', body: 'Carbon legs and skids lowered clear of the airframe.' },
    { id: 'electronics', kicker: 'Avionics', title: 'Upper equipment enclosure.', body: 'The upper enclosure and antennas lifted from the frame.' },
    { id: 'cables', kicker: 'Interfaces', title: 'Cabling and connectors.', body: 'RF leads and antennas separated where independently visible.' },
    { id: 'ironav', kicker: 'Navigation payload', title: 'IroNav', body: 'Autonomous visual navigation and GNSS anti-jamming. Developed by infiniDome.' },
    { id: 'exploded', kicker: 'Exploded view', title: 'Platform architecture.', body: 'Every isolated assembly in its exploded position.' },
    { id: 'reassemble', kicker: 'Integrated platform', title: 'Engineered for navigation resilience.', body: 'Each assembly returns to its exact position.' },
  ],
  note: 'Original product photograph separated into its visible assemblies.',
};

export const OPERATIONS = {
  index: '05',
  label: 'Operational applications',
  headline: 'Where navigation resilience matters.',
  // [GP] use cases, as published
  uses: [
    { title: 'GPS-denied urban operations', body: 'Autonomous navigation and landing where GPS is blocked by buildings or electronic warfare.' },
    { title: 'GPS-jammed military operations', body: 'Anti-jamming protects GPS while available; optical navigation sustains continuity when jammed.' },
    { title: 'ISR in contested environments', body: 'Sustained autonomous flight and data collection under active GPS denial.' },
    { title: 'Border and perimeter surveillance', body: 'Autonomous patrol in GPS-challenged terrain without pre-mapped routes.' },
    { title: 'Maritime moving-platform landing', body: 'Precision autonomous landing on underway vessels — optional upgrade module.' },
  ],
  films: [
    {
      id: 'vehicle',
      k: 'Visual reference in motion',
      title: 'Ground vehicle in view.',
      body: 'An aerial platform holds a moving ground vehicle within its field of view across changing perspectives.',
      label: 'Licensed aerial footage of a truck on a highway bridge, composited with the IroNav-integrated aircraft and an illustrative field-of-view graphic',
      disclaimer: 'Illustrative composite. Not a recorded IroNav demonstration; the beam depicts a field of view, not an emitted laser.',
      credit: { title: 'The Atchafalaya Basin Bridge And Whiskey Bay Pilot Channel Drone Video', author: 'Third Coast Drone', href: 'https://commons.wikimedia.org/wiki/File:The_Atchafalaya_Basin_Bridge_And_Whiskey_Bay_Pilot_Channel_Drone_Video.webm', licence: 'CC BY 3.0', licenceHref: 'https://creativecommons.org/licenses/by/3.0/', changes: 'Trimmed, reframed, graded and composited.' },
    },
    {
      id: 'installation',
      k: 'Infrastructure and perimeter',
      title: 'One installation, six viewpoints.',
      body: 'A former military storage installation observed from the air — perimeter, watchtower, hardened shelters and bunkers.',
      label: 'Licensed aerial footage of a former military ammunition storage installation from six viewpoints, composited with the IroNav-integrated aircraft',
      disclaimer: 'Illustrative composite. Not a recorded IroNav demonstration; the beam depicts a field of view, not an emitted laser.',
      credit: { title: 'Sondermunitionslager Dülmen-Visbeck', author: 'Dietmar Rabich', href: 'https://commons.wikimedia.org/wiki/File:Sondermunitionslager_D%C3%BClmen-Visbeck.webm', licence: 'CC BY-SA 4.0', licenceHref: 'https://creativecommons.org/licenses/by-sa/4.0/', changes: 'Trimmed, reframed, graded, annotated and composited; this adaptation is shared under CC BY-SA 4.0.' },
    },
  ],
};

export const INTEGRATION = {
  index: '06',
  label: 'Integration in India',
  headline: 'From platform assessment to lifecycle support.',
  intro: 'Platform fit is assessed against each customer’s aircraft configuration and mission requirement.',
  // [W] considerations + [G] "integration, field trials and post-delivery support", DAP 2020 / Make in India
  steps: [
    { n: '01', title: 'Mission requirement', body: 'Navigation requirements where satellite positioning may be disrupted or unavailable.' },
    { n: '02', title: 'Platform compatibility', body: 'Airframe interfaces, sensor placement, size, weight and power for the specific configuration.' },
    { n: '03', title: 'Integration and field trials', body: 'Integration on the customer platform and evaluation in representative conditions.' },
    { n: '04', title: 'Lifecycle support', body: 'Post-delivery support from Globaz Technologies in India.' },
  ],
  procurement: 'Globaz Technologies supports programmes under DAP 2020 and the Make in India framework.',
  caveat: 'Considerations for each configuration — not confirmed compatibility.',
};

export const CLOSING = {
  statement: 'IroNav — developed by infiniDome. Presented, integrated and supported in India by Globaz Technologies.',
  offices: [
    { k: 'Corporate office', v: '101, First Floor, Worldmark-4B, Aerocity, New Delhi 110037' },
    { k: 'Electronics facility', v: 'B-92, Sector 88, Noida 201305, Uttar Pradesh' },
  ],
  footnote: 'Visualisations on this page are illustrative and are not recorded product demonstrations. Third-party footage is credited where shown.',
};
