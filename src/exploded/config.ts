import manifestJson from '../../public/media/ironav-layers/manifest.json';

/**
 * Image-layer exploded view of the ORIGINAL product photograph.
 *
 * Every layer is cut from `public/media/ironav-original.png` by
 * `scripts/segment_layers.py`; the layers partition the photo's pixels and
 * re-composite to it exactly. Nothing here is generated or redrawn.
 */

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

export type GroupId = 'propellers' | 'motors' | 'arms' | 'frame' | 'gear' | 'electronics' | 'cables' | 'ironav';

export const manifest = manifestJson as { source: string; width: number; height: number; layers: LayerInfo[] };

export const MEDIA_BASE = '/media/ironav-layers/';
export const ORIGINAL_SRC = '/media/ironav-original.png';
export const IMG_W = manifest.width;
export const IMG_H = manifest.height;

/** Order in which components are highlighted, with their callout copy. */
export const GROUPS: { id: GroupId; title: string; sub: string; anchorLayer: string; labelOffset: [number, number]; delay: number }[] = [
  { id: 'propellers', title: 'Propellers', sub: 'Upper and lower pairs', anchorLayer: 'prop-front-right-upper', labelOffset: [40, -60], delay: 0 },
  { id: 'motors', title: 'Motor assemblies', sub: 'With X-plate mounts', anchorLayer: 'motor-front-left-upper', labelOffset: [-120, -95], delay: 0.08 },
  { id: 'arms', title: 'Carbon-fibre arms', sub: 'Tubular structure', anchorLayer: 'arm-front-left', labelOffset: [-40, -120], delay: 0.16 },
  { id: 'frame', title: 'Central airframe', sub: 'Stacked carbon plates', anchorLayer: 'frame', labelOffset: [-330, 60], delay: 0 },
  { id: 'gear', title: 'Landing gear', sub: 'Carbon legs and skids', anchorLayer: 'gear-right', labelOffset: [150, 40], delay: 0.2 },
  { id: 'electronics', title: 'Upper electronic enclosure', sub: 'With antennas', anchorLayer: 'electronics', labelOffset: [-60, -150], delay: 0.06 },
  { id: 'cables', title: 'Cables & connectors', sub: 'Copper RF leads, helical antennas', anchorLayer: 'cable-helix', labelOffset: [-170, 70], delay: 0.22 },
  { id: 'ironav', title: 'IroNav module', sub: 'Mounted beneath the central assembly', anchorLayer: 'ironav-module', labelOffset: [250, 110], delay: 0.28 },
];

/** Module-specific annotations shown while the IroNav layer is in focus (module-local image px). */
export const MODULE_NOTES: { title: string; sub: string; at: [number, number]; offset: [number, number] }[] = [
  { title: 'IroNav', sub: 'Name panel, as photographed', at: [520, 345], offset: [-150, -80] },
  { title: 'Interface connectors', sub: 'Visible RF connections', at: [640, 325], offset: [140, -70] },
  { title: 'Module enclosure', sub: 'Original photographic layer', at: [560, 425], offset: [120, 60] },
];

/** Stage padding around the photo (image px) so separated layers never clip. */
export const STAGE_PAD = {
  desktop: { x: 175, y: 140 },
  mobile: { x: 40, y: 190 },
};

/** Responsive scaling of the explode distances. */
export const EXPLODE_FACTOR = {
  desktop: { x: 1, y: 1 },
  mobile: { x: 0.12, y: 1.55 },
};

/** IroNav focus: target centre (image px) and scale. */
export const FOCUS = {
  desktop: { cx: IMG_W * 0.5, cy: IMG_H * 0.46, scale: 2.1 },
  mobile: { cx: IMG_W * 0.5, cy: IMG_H * 0.42, scale: 2.4 },
};

export const MODULE_ID = 'ironav-module';
