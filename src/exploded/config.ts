import manifestJson from '../../public/media/ironav-layers/manifest.json';

/**
 * Image-layer exploded view of the ORIGINAL product photograph.
 *
 * Every layer is cut from `public/media/ironav-original.png` by
 * `scripts/segment_layers.py`; the layers partition the photo's pixels and
 * re-composite to it exactly. Nothing here is generated or redrawn.
 */

export type GroupId = 'propellers' | 'motors' | 'arms' | 'frame' | 'gear' | 'electronics' | 'cables' | 'ironav';

export interface LayerInfo {
  id: string;
  group: GroupId;
  label: string;
  file: string;
  x: number;
  y: number;
  w: number;
  h: number;
  soft: string;
  outline: { file: string; x: number; y: number; w: number; h: number };
  anchor: [number, number];
  /** Exploded-view displacement in original-image pixels. */
  explode: [number, number];
}

export const manifest = manifestJson as { source: string; width: number; height: number; layers: LayerInfo[] };

export const MEDIA_BASE = '/media/ironav-layers/';
export const ORIGINAL_SRC = '/media/ironav-original.png';
export const IMG_W = manifest.width;
export const IMG_H = manifest.height;
export const MODULE_ID = 'ironav-module';

export type Mode = 'desktop' | 'mobile';

/** Component groups in highlight order, with callout copy and motion character. */
export const GROUPS: {
  id: GroupId;
  title: string;
  sub: string;
  anchorLayer: string;
  labelOffset: [number, number];
  /** Stagger inside the separation (0–0.3). */
  delay: number;
  /** Apparent depth while separated: + towards camera, − away. */
  depth: number;
}[] = [
  { id: 'propellers', title: 'Propellers', sub: 'Upper and lower pairs', anchorLayer: 'prop-front-right-upper', labelOffset: [40, -60], delay: 0, depth: 0.06 },
  { id: 'motors', title: 'Motor assemblies', sub: 'With X-plate mounts', anchorLayer: 'motor-front-left-upper', labelOffset: [-120, -95], delay: 0.08, depth: 0.04 },
  { id: 'arms', title: 'Carbon-fibre arms', sub: 'Tubular structure', anchorLayer: 'arm-front-left', labelOffset: [-40, -120], delay: 0.16, depth: 0.015 },
  { id: 'frame', title: 'Central airframe', sub: 'Stacked carbon plates', anchorLayer: 'frame', labelOffset: [-330, 60], delay: 0, depth: 0 },
  { id: 'gear', title: 'Landing gear', sub: 'Carbon legs and skids', anchorLayer: 'gear-right', labelOffset: [150, 40], delay: 0.2, depth: -0.03 },
  { id: 'electronics', title: 'Upper electronic enclosure', sub: 'With antennas', anchorLayer: 'electronics', labelOffset: [-60, -150], delay: 0.06, depth: 0.03 },
  { id: 'cables', title: 'Cables & connectors', sub: 'Copper RF leads, helical antennas', anchorLayer: 'cable-helix', labelOffset: [70, 120], delay: 0.22, depth: 0.02 },
  { id: 'ironav', title: 'IroNav module', sub: 'Mounted beneath the central assembly', anchorLayer: 'ironav-module', labelOffset: [250, 110], delay: 0.28, depth: 0.05 },
];

/** Module annotations while the IroNav layer is in focus (original-image px). */
export const MODULE_NOTES: { title: string; sub: string; at: [number, number]; offset: [number, number] }[] = [
  { title: 'IroNav', sub: 'Name panel, as photographed', at: [520, 345], offset: [-150, -80] },
  { title: 'Interface connectors', sub: 'Visible RF connections', at: [640, 325], offset: [140, -70] },
  { title: 'Module enclosure', sub: 'Original photographic layer', at: [560, 425], offset: [120, 60] },
];

/**
 * Stage layout per mode.
 *  fit:    photo width as a fraction of the stage width at camera zoom 1
 *  anchor: where the camera centre lands on screen (fractions of the stage)
 *  maxCssPerPx: never magnify the photo beyond this many CSS px per image px
 */
export const LAYOUT = {
  desktop: { fit: 0.6, fitH: 0.6, anchor: [0.555, 0.52] as [number, number], maxCssPerPx: 1.25 },
  mobile: { fit: 1.0, fitH: 0.5, anchor: [0.5, 0.4] as [number, number], maxCssPerPx: 0.62 },
};

/** Responsive scaling of the explode distances. */
export const EXPLODE_FACTOR = {
  desktop: { x: 1, y: 1 },
  mobile: { x: 0.12, y: 1.5 },
};

/** IroNav focus: where the module travels (image px) and how much it is enlarged. */
export const FOCUS = {
  desktop: { cx: IMG_W * 0.5, cy: IMG_H * 0.46, scale: 1.45 },
  mobile: { cx: IMG_W * 0.5, cy: IMG_H * 0.42, scale: 1.6 },
};

/**
 * The disassembly sequence. Each stage owns a dedicated scroll interval and
 * detaches its layers one after another, in the order listed. Layers detached
 * in earlier stages stay in their exploded positions.
 */
export type StageId =
  | 'original'
  | 'propellers'
  | 'motors'
  | 'arms'
  | 'gear'
  | 'electronics'
  | 'cables'
  | 'ironav'
  | 'exploded'
  | 'reassemble';

export const SEQUENCE: { id: StageId; label: string; group?: GroupId; layers: string[] }[] = [
  { id: 'original', label: 'Aircraft', layers: [] },
  {
    id: 'propellers',
    label: 'Propellers',
    group: 'propellers',
    layers: ['prop-front-left-upper', 'prop-front-right-upper', 'prop-rear-right-upper', 'prop-front-left-lower', 'prop-rear-right-lower'],
  },
  {
    id: 'motors',
    label: 'Motors',
    group: 'motors',
    layers: ['motor-front-left-upper', 'motor-front-right-upper', 'motor-rear-right-upper', 'motor-front-left-lower', 'motor-front-right-lower', 'motor-rear-right-lower'],
  },
  { id: 'arms', label: 'Arms', group: 'arms', layers: ['arm-front-left', 'arm-front-right', 'arm-rear-right'] },
  { id: 'gear', label: 'Landing gear', group: 'gear', layers: ['gear-left', 'gear-right'] },
  { id: 'electronics', label: 'Electronics', group: 'electronics', layers: ['electronics'] },
  { id: 'cables', label: 'Cables', group: 'cables', layers: ['cable-top-antenna', 'cable-lead-left', 'cable-black', 'cable-helix'] },
  { id: 'ironav', label: 'IroNav', group: 'ironav', layers: ['ironav-module'] },
  { id: 'exploded', label: 'Exploded', layers: [] },
  { id: 'reassemble', label: 'Reassembly', layers: [] },
];

type Cam = { x: number; y: number; z: number };

/**
 * Camera keyframe for each stage (centre in image px, zoom × fit scale).
 * 'original' is used for both the first and the last frame, so the closing
 * frame is the opening frame — the original photograph, exactly.
 */
export const CAMERA: Record<Mode, Record<StageId, Cam>> = {
  desktop: {
    original: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 1 },
    propellers: { x: IMG_W * 0.49, y: IMG_H * 0.5, z: 0.82 },
    motors: { x: IMG_W * 0.49, y: IMG_H * 0.5, z: 0.82 },
    arms: { x: IMG_W * 0.48, y: IMG_H * 0.5, z: 0.81 },
    gear: { x: IMG_W * 0.48, y: IMG_H * 0.58, z: 0.8 },
    electronics: { x: IMG_W * 0.47, y: IMG_H * 0.5, z: 0.77 },
    cables: { x: IMG_W * 0.46, y: IMG_H * 0.52, z: 0.75 },
    ironav: { x: IMG_W * 0.5, y: IMG_H * 0.46, z: 1.0 },
    exploded: { x: IMG_W * 0.45, y: IMG_H * 0.5, z: 0.73 },
    reassemble: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 1 },
  },
  mobile: {
    original: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 1.0 },
    // while parts separate, frame the whole airframe with margin so nothing clips
    propellers: { x: IMG_W * 0.5, y: IMG_H * 0.48, z: 0.88 },
    motors: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 0.88 },
    arms: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 0.88 },
    gear: { x: IMG_W * 0.5, y: IMG_H * 0.58, z: 0.88 },
    electronics: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 0.88 },
    cables: { x: IMG_W * 0.5, y: IMG_H * 0.52, z: 0.88 },
    ironav: { x: IMG_W * 0.5, y: IMG_H * 0.42, z: 1.12 },
    exploded: { x: IMG_W * 0.5, y: IMG_H * 0.52, z: 0.86 },
    reassemble: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 1.0 },
  },
};

/** Centre (image px) of a stage's layers in their exploded positions — target for the close-up. */
export function stageCentroid(stage: StageId, mode: Mode) {
  const seq = SEQUENCE.find((s) => s.id === stage);
  const f = EXPLODE_FACTOR[mode];
  const ls = manifest.layers.filter((l) => seq?.layers.includes(l.id));
  if (!ls.length) return { x: IMG_W / 2, y: IMG_H / 2 };
  const x = ls.reduce((a, l) => a + l.x + l.w / 2 + l.explode[0] * f.x, 0) / ls.length;
  const y = ls.reduce((a, l) => a + l.y + l.h / 2 + l.explode[1] * f.y, 0) / ls.length;
  return { x, y };
}

/** How far each stage's close-up pushes in, relative to the stage's camera zoom. */
export const CLOSEUP: Partial<Record<StageId, number>> = {
  propellers: 1.22,
  motors: 1.42,
  arms: 1.38,
  gear: 1.3,
  electronics: 1.55,
  cables: 1.3,
};
