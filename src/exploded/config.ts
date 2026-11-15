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
  { id: 'cables', title: 'Cables & connectors', sub: 'Copper RF leads, helical antennas', anchorLayer: 'cable-helix', labelOffset: [-170, 70], delay: 0.22, depth: 0.02 },
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
 * Camera keyframes per stage: centre (image px) and zoom (×fit scale).
 * The first and last keyframes are identical, so the closing frame is the
 * opening frame — the original photograph, exactly.
 */
export const CAMERA = {
  desktop: {
    original: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 1 },
    highlight: { x: IMG_W * 0.54, y: IMG_H * 0.5, z: 1.07 },
    separate: { x: IMG_W * 0.5, y: IMG_H * 0.52, z: 0.9 },
    exploded: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 0.8 },
    ironav: { x: IMG_W * 0.5, y: IMG_H * 0.46, z: 1.0 },
  },
  mobile: {
    original: { x: IMG_W * 0.5, y: IMG_H * 0.52, z: 1.42 },
    highlight: { x: IMG_W * 0.36, y: IMG_H * 0.5, z: 1.42 },
    highlight2: { x: IMG_W * 0.66, y: IMG_H * 0.52, z: 1.42 },
    separate: { x: IMG_W * 0.5, y: IMG_H * 0.5, z: 1.05 },
    exploded: { x: IMG_W * 0.5, y: IMG_H * 0.48, z: 0.98 },
    ironav: { x: IMG_W * 0.5, y: IMG_H * 0.42, z: 1.12 },
  },
};
