/**
 * IroNav landing page — content.
 *
 * Factual source: Globaz IroNav wireframe (comdez.co.uk/globaz-wireframes/ironav.html).
 * Positioning: visual navigation and GNSS interference protection; developed by
 * infiniDome for uncrewed aircraft; Globaz Technologies is the India contact for
 * integration enquiries, platform evaluation and support discussions.
 * No performance figures, specifications, certifications, compatibility claims,
 * documents or customer references are stated anywhere on the page.
 */

export const LINKS = {
  email: 'info@globaztechnologies.com',
  contactPage: 'https://www.globaztechnologies.com/contact',
  globaz: 'https://www.globaztechnologies.com',
  infinidome: 'https://infinidome.com/ironav/',
} as const;

export const mailto = (subject: string, body = '') =>
  `mailto:${LINKS.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;

export const NAV = [
  { id: 'overview', n: '01', label: 'Overview' },
  { id: 'anatomy', n: '02', label: 'Anatomy' },
  { id: 'motion', n: '03', label: 'Motion' },
  { id: 'technology', n: '04', label: 'Technology' },
  { id: 'integration', n: '05', label: 'Integration' },
  { id: 'evidence', n: '06', label: 'Evidence' },
] as const;

export const HERO = {
  category: 'Air Systems / Resilient Navigation',
  headline: ['Navigation', 'Beyond GNSS', 'Dependency.'],
  sub: 'Visual navigation and GNSS interference protection for uncrewed aircraft.',
  developer: 'Developed by infiniDome',
  india: 'Integration enquiries through Globaz Technologies',
  primary: 'Explore IroNav',
  secondary: 'Discuss Platform Integration',
};

export const INTRO = {
  index: '01',
  label: 'Overview',
  statement: 'For uncrewed aircraft that must plan for operation where satellite positioning may be disrupted or unavailable.',
  body: [
    'IroNav brings visual navigation and GNSS interference protection to uncrewed aircraft. It is developed by infiniDome.',
    'In India, Globaz Technologies is the contact for integration enquiries, platform evaluation and support discussions.',
  ],
  facts: [
    { k: 'Technology developer', v: 'infiniDome' },
    { k: 'Application', v: 'Uncrewed aircraft' },
    { k: 'India integration enquiries', v: 'Globaz Technologies' },
    { k: 'Configuration and availability', v: 'Discuss with Globaz' },
  ],
};

export const ANATOMY = {
  index: '02',
  label: 'Anatomy',
  stages: [
    { id: 'original', kicker: 'The aircraft', title: 'As photographed.', body: 'A multirotor platform with the IroNav module mounted beneath the central assembly. Scroll to take it apart, one assembly at a time.' },
    { id: 'propellers', kicker: 'Stage 01 · Propellers', title: 'Propellers, one by one.', body: 'Each propeller layer lifts away from its motor along its own axis.' },
    { id: 'motors', kicker: 'Stage 02 · Motor assemblies', title: 'Motors, with their mounts.', body: 'Upper and lower motor assemblies detach individually — X-plate mounts and clamp blocks included.' },
    { id: 'arms', kicker: 'Stage 03 · Carbon-fibre arms', title: 'Arms, released.', body: 'The tubular carbon-fibre arms separate progressively from the central frame.' },
    { id: 'gear', kicker: 'Stage 04 · Landing gear', title: 'Landing gear, lowered away.', body: 'Legs and skids detach and move downwards, clear of the airframe.' },
    { id: 'electronics', kicker: 'Stage 05 · Electronics', title: 'The upper enclosure lifts clear.', body: 'The upper electronic enclosure and its antennas separate from the frame.' },
    { id: 'cables', kicker: 'Stage 06 · Cables & connectors', title: 'Cabling, where it can be isolated.', body: 'Copper RF leads, helical antennas and the shielded cable separate. Cables that run inside other parts stay with them.' },
    { id: 'ironav', kicker: 'Stage 07 · The module', title: 'IroNav', body: 'Visual navigation and GNSS interference protection.' },
    { id: 'exploded', kicker: 'Exploded view', title: 'Twenty-three layers.', body: 'Every isolated component in one engineering layout — still exactly as the camera recorded it.' },
    { id: 'reassemble', kicker: 'Reassembly', title: 'Engineered for navigation resilience.', body: 'Every layer returns to its exact position. The photograph is restored pixel for pixel.' },
  ],
  moduleLine: 'Developed by infiniDome for uncrewed aircraft.',
  note: 'All imagery: the original product photograph and layers cut from it. No generated or reconstructed imagery.',
};

export const FILM = {
  index: '03',
  label: 'Motion studies',
  title: 'Studied in motion.',
  intro: 'Short loops built from the original product photograph — traced, approached and taken apart.',
  clips: [
    { id: 'module', n: '01', title: 'Approach', caption: 'A slow approach to the IroNav module beneath the central assembly.', aspect: '16 / 9' },
    { id: 'scan', n: '02', title: 'Line study', caption: 'The photograph and its own line trace, revealed by a scan.', aspect: '1160 / 558' },
    { id: 'layers', n: '03', title: 'Assemblies', caption: 'The photograph’s layers drift apart and return.', aspect: '1160 / 558' },
  ],
  note: 'Motion studies created from the original product photograph.',
};

export const TECH = {
  index: '04',
  label: 'Technology',
  headline: ['Visual Navigation.', 'Resilient Operations.'],
  intro: 'Three ideas define how IroNav is positioned by its developer.',
  pillars: [
    {
      id: 'visual',
      n: '01',
      title: 'Visual navigation',
      body: 'IroNav is positioned as a visual navigation technology for uncrewed aircraft — a reference that does not rest on satellite positioning alone.',
      video: {
        desktop: 'vehicle-desktop',
        mobile: 'vehicle-mobile',
        label: 'Aerial footage of a truck on a highway bridge, with the IroNav-integrated aircraft and an illustrative tracking beam composited in',
        caption: 'A moving ground vehicle kept in view from the air. The aircraft and beam are an illustrative composite.',
        credit: { title: 'The Atchafalaya Basin Bridge And Whiskey Bay Pilot Channel Drone Video', author: 'Third Coast Drone', href: 'https://commons.wikimedia.org/wiki/File:The_Atchafalaya_Basin_Bridge_And_Whiskey_Bay_Pilot_Channel_Drone_Video.webm' },
      },
    },
    {
      id: 'gnss',
      n: '02',
      title: 'GNSS interference protection',
      body: 'Alongside visual navigation, IroNav is presented by infiniDome as providing GNSS interference protection — relevant where satellite positioning may be disrupted or unavailable.',
      video: {
        desktop: 'building-desktop',
        mobile: 'building-mobile',
        label: 'Aerial footage exploring one lighthouse building from four viewpoints, with the IroNav-integrated aircraft composited in',
        caption: 'One structure, observed from four viewpoints. The aircraft and beam are an illustrative composite.',
        credit: { title: 'Cape Neddick Nubble Lighthouse - York, Maine 4k Drone flight - DJI Air2S', author: 'Dave Halter', href: 'https://commons.wikimedia.org/wiki/File:Cape_Neddick_Nubble_Lighthouse_-_York,_Maine_4k_Drone_flight_-_DJI_Air2S.webm' },
      },
    },
    {
      id: 'uas',
      n: '03',
      title: 'Uncrewed aircraft',
      body: 'Developed by infiniDome for uncrewed aircraft. Suitability for a specific airframe and mission is assessed case by case with Globaz Technologies.',
    },
  ] as { id: string; n: string; title: string; body: string; video?: { desktop: string; mobile: string; label: string; caption: string; credit: { title: string; author: string; href: string } } }[],
  footnote: 'Videos are illustrative composites of licensed third-party aerial footage with the IroNav product photograph and graphic overlays. They are not recordings of an IroNav demonstration, and the beam depicts a field of view, not an emitted laser. For technical detail, start with infiniDome’s published overview.',
};

export const INTEGRATION = {
  index: '05',
  label: 'Platform integration',
  title: 'Fit is assessed for your configuration.',
  intro: 'Every integration discussion starts from the aircraft you fly and the mission you plan for.',
  items: [
    {
      id: 'mission',
      n: '01',
      title: 'Mission requirement',
      body: 'Evaluate navigation requirements where satellite positioning may be disrupted or unavailable.',
      points: ['Operating environment', 'Where satellite positioning may be disrupted', 'Where it may be unavailable'],
    },
    {
      id: 'aircraft',
      n: '02',
      title: 'Aircraft compatibility',
      body: 'Review airframe interfaces, sensor placement, size, weight and power requirements for your configuration.',
      points: ['Airframe interfaces', 'Sensor placement', 'Size', 'Weight', 'Power requirements'],
    },
    {
      id: 'india',
      n: '03',
      title: 'Globaz’s role in India',
      body: 'Discuss the integration, evaluation and support scope for your programme.',
      points: ['Integration', 'Evaluation', 'Available support scope'],
    },
  ],
  caveat: 'Considerations for your configuration — not confirmed compatibility.',
};

export const EVIDENCE = {
  index: '06',
  label: 'Technical information',
  title: 'Technical information and evidence.',
  intro: 'Start with the OEM’s published technical overview. Ask Globaz which test results and integration documents are available for your configuration.',
  rows: [
    { n: '01', title: 'OEM product overview', body: 'infiniDome’s published overview of IroNav.', action: 'View on infiniDome', href: LINKS.infinidome, external: true },
    { n: '02', title: 'Integration information', body: 'Interfaces, placement and installation considerations for your airframe.', action: 'Ask Globaz', href: mailto('IroNav — Integration information'), external: false },
    { n: '03', title: 'Configuration discussions', body: 'Platform-specific technical questions, discussed with the Globaz team.', action: 'Start a discussion', href: mailto('IroNav — Configuration discussion'), external: false },
    { n: '04', title: 'Evaluation documentation', body: 'Which test results and integration documents are available for your configuration.', action: 'Request availability', href: mailto('IroNav — Evaluation documentation'), external: false },
  ],
};

export const ENQUIRY = {
  index: '07',
  label: 'Enquiry',
  title: 'Explore IroNav for Your Platform.',
  body: 'Discuss your aircraft configuration, integration requirements and technical evaluation with Globaz Technologies.',
  note: 'Share a brief, non-sensitive summary. The team can arrange the appropriate channel for programme and technical details.',
  paths: [
    { n: '01', title: 'Request a Technical Briefing', body: 'Discuss platform fit and available evaluation material.', subject: 'IroNav — Technical briefing request' },
    { n: '02', title: 'Discuss Platform Integration', body: 'Ask about integrating IroNav on your platform.', subject: 'IroNav — Platform integration' },
    { n: '03', title: 'Discuss an RFI/RFP', body: 'Discuss your requirement and India support scope.', subject: 'IroNav — RFI/RFP discussion' },
  ],
  offices: 'Corporate office in New Delhi · Electronics facility in Noida',
};
