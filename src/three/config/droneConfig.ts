/**
 * Conceptual airframe definition.
 *
 * All dimensions are in scene units (≈ 1 unit = 10 cm). The procedural parts in
 * `three/parts` read from here, and `explode` describes the deliberate path each
 * assembly follows in the exploded view. A CAD-derived GLB can replace any part:
 * keep the same `PartId`, mount the GLB node in the matching slot of
 * `DroneAssembly3D`, and the scroll animation continues to work unchanged.
 */

export type Vec3 = [number, number, number];

export const PART_IDS = [
  'upperEquipment',
  'battery',
  'frame',
  'arms',
  'motors',
  'propellers',
  'landingGear',
  'cables',
  'ironav',
] as const;
export type PartId = (typeof PART_IDS)[number];

export const droneConfig = {
  /** Multirotor configuration. Change to 4 / 6 / 8 to match the reference airframe. */
  armCount: 6,
  /** Angle offset so that two arms straddle the nose (+Z is forward). */
  armPhase: Math.PI / 6,
  armLength: 1.78, // centre → motor axis
  armRadius: 0.052,

  frame: {
    radius: 0.6,
    plateThickness: 0.034,
    plateGap: 0.2, // bottom plate top → top plate bottom
    standoffs: 8,
  },

  motor: { radius: 0.165, height: 0.17, mountRadius: 0.2 },
  propeller: { radius: 0.74, chord: 0.14, pitchTwist: 0.42 },

  battery: { size: [0.42, 0.2, 0.86] as Vec3 },

  upperEquipment: {
    deckSize: [0.62, 0.025, 0.74] as Vec3,
    deckHeight: 0.19, // above battery top
    enclosure: [0.42, 0.15, 0.4] as Vec3,
    mastHeight: 0.42,
  },

  landingGear: { height: 0.82, spreadX: 0.42, skidLength: 1.72, tubeRadius: 0.032 },

  ironav: {
    size: [0.48, 0.17, 0.36] as Vec3,
    mountDrop: 0.25, // below bottom plate
    forward: 0.08,
  },
};

/** Derived vertical datum lines for the stack (y-up). */
export const levels = (() => {
  const f = droneConfig.frame;
  const bottomPlateY = 0;
  const topPlateY = f.plateThickness + f.plateGap;
  const armY = f.plateThickness + f.plateGap / 2;
  const topSurface = topPlateY + f.plateThickness;
  const batteryY = topSurface + droneConfig.battery.size[1] / 2 + 0.01;
  const deckY = topSurface + droneConfig.battery.size[1] + droneConfig.upperEquipment.deckHeight - 0.13;
  const motorBaseY = armY + droneConfig.armRadius + 0.03;
  const propY = motorBaseY + droneConfig.motor.height + 0.06;
  const ironavY = -droneConfig.ironav.mountDrop;
  return { bottomPlateY, topPlateY, armY, topSurface, batteryY, deckY, motorBaseY, propY, ironavY };
})();

export const armAngle = (i: number) => droneConfig.armPhase + (i / droneConfig.armCount) * Math.PI * 2;
export const armDir = (i: number): Vec3 => [Math.sin(armAngle(i)), 0, Math.cos(armAngle(i))];

/**
 * Exploded-view choreography.
 *  - `offset` is a fixed translation (drone-local units).
 *  - `radial` adds movement outward along each arm's axis (radial parts only).
 *  - `delay` (0-0.35) staggers when the part starts moving inside the explode stage.
 */
export interface ExplodeSpec {
  offset: Vec3;
  radial?: number;
  delay: number;
}

export const explodeConfig: Record<PartId, ExplodeSpec> = {
  propellers: { offset: [0, 1.3, 0], radial: 0.5, delay: 0 },
  upperEquipment: { offset: [0, 1.6, -0.05], delay: 0.04 },
  motors: { offset: [0, 0.7, 0], radial: 0.5, delay: 0.1 },
  battery: { offset: [0, 0.85, 0], delay: 0.12 },
  arms: { offset: [0, 0.02, 0], radial: 0.72, delay: 0.18 },
  cables: { offset: [0, 0.32, 0], radial: 0.3, delay: 0.16 },
  frame: { offset: [0, 0, 0], delay: 0 },
  landingGear: { offset: [0, -1.05, 0], radial: 0, delay: 0.22 },
  ironav: { offset: [0, -1.55, 0.55], delay: 0.28 },
};

/** Where the IroNav module travels during the reveal (drone-local). */
export const ironavFocus = {
  position: [0, 1.0, 2.0] as Vec3,
  rotation: [-0.32, 0.55, 0] as Vec3,
  /** Orientation while the conceptual internals are exploded (top towards camera). */
  internalsRotation: [0.42, 0.5, 0] as Vec3,
  scale: 1.6,
};
