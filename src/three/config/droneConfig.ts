/**
 * Conceptual airframe definition, matched to the reference photograph
 * (IMG_5771.png): a coaxial X8 — four carbon-fibre arms, each carrying an
 * upper and a lower motor/propeller — with a stacked-plate central frame, a
 * strapped power enclosure on top and the IroNav module beneath.
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
  /** Arm count (X configuration). */
  armCount: 4,
  /** Angle offset so the arms sit on the diagonals (+Z is forward). */
  armPhase: Math.PI / 4,
  /** Coaxial: a motor/propeller above and below every arm tip. */
  coaxial: true,
  armLength: 1.58, // centre → motor axis
  armRadius: 0.088,

  frame: {
    width: 1.3, // X
    depth: 1.0, // Z
    plateThickness: 0.034,
    plateGap: 0.27, // bottom plate top → top plate bottom
  },

  /** Vertical X-pattern clamp plates at each arm tip. */
  mount: { size: 0.34, thickness: 0.022, spread: 0.1 },

  motor: { radius: 0.19, height: 0.25 },
  propeller: { radius: 0.84, chord: 0.17, pitchTwist: 0.42 },

  battery: { size: [0.9, 0.42, 0.62] as Vec3, offsetX: -0.08 },

  upperEquipment: {
    box: [0.36, 0.32, 0.5] as Vec3,
    antennaHeight: 0.46,
  },

  landingGear: { height: 1.0, topX: 0.42, footX: 0.86, skidLength: 1.25, tubeRadius: 0.06 },

  ironav: {
    size: [0.74, 0.5, 0.5] as Vec3,
    mountDrop: 0.06, // gap below bottom plate
    forward: 0.06,
  },
};

/** Derived vertical datum lines for the stack (y-up). */
export const levels = (() => {
  const f = droneConfig.frame;
  const bottomPlateY = 0;
  const topPlateY = f.plateThickness + f.plateGap;
  const armY = f.plateThickness + f.plateGap / 2;
  const topSurface = topPlateY + f.plateThickness;
  const batteryY = topSurface + droneConfig.battery.size[1] / 2 + 0.005;
  const deckY = topSurface;
  const mountHalf = droneConfig.mount.size / 2;
  const motorBaseY = armY + mountHalf;
  const propY = motorBaseY + droneConfig.motor.height + 0.05;
  const lowerMotorBaseY = armY - mountHalf;
  const lowerPropY = lowerMotorBaseY - droneConfig.motor.height - 0.05;
  const ironavY = -droneConfig.ironav.mountDrop - droneConfig.ironav.size[1] / 2;
  return { bottomPlateY, topPlateY, armY, topSurface, batteryY, deckY, motorBaseY, propY, lowerMotorBaseY, lowerPropY, ironavY };
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
  propellers: { offset: [0, 1.15, 0], radial: 0.55, delay: 0 },
  upperEquipment: { offset: [0.35, 1.45, -0.25], delay: 0.04 },
  motors: { offset: [0, 0.6, 0], radial: 0.5, delay: 0.1 },
  battery: { offset: [0, 0.85, 0], delay: 0.12 },
  arms: { offset: [0, 0, 0], radial: 0.7, delay: 0.18 },
  cables: { offset: [0, 0.3, 0], radial: 0.3, delay: 0.16 },
  frame: { offset: [0, 0, 0], delay: 0 },
  landingGear: { offset: [0, -1.0, 0], radial: 0, delay: 0.22 },
  ironav: { offset: [0, -1.3, 0.8], delay: 0.28 },
};

/** Lower (inverted) coaxial motor and propeller travel downward and outward. */
export const lowerExplode = {
  motors: { offset: [0, -0.55, 0] as Vec3, radial: 0.5, delay: 0.1 },
  propellers: { offset: [0, -0.95, 0] as Vec3, radial: 0.65, delay: 0.02 },
};

/** Where the IroNav module travels during the reveal (drone-local). */
export const ironavFocus = {
  position: [0, 1.0, 2.0] as Vec3,
  rotation: [-0.22, 0.5, 0] as Vec3,
  scale: 1.3,
  /** Orientation while the conceptual internals are exploded (top towards camera). */
  internalsRotation: [0.42, 0.5, 0] as Vec3,
};
