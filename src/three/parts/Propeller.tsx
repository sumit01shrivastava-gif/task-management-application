import { forwardRef } from 'react';
import * as THREE from 'three';
import { droneConfig } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg } from '../scene/DroneContext';

/**
 * Builds a single twisted, tapered blade as a closed lofted surface.
 * Blade extends along +X; the chord lies in XZ, thickness in Y.
 */
function bladeGeometry(radius: number, chord: number, twist: number, radialSteps: number, sectionSteps: number) {
  const hub = 0.06;
  const positions: number[] = [];
  const indices: number[] = [];
  const ring = sectionSteps * 2;
  for (let i = 0; i <= radialSteps; i++) {
    const t = i / radialSteps;
    const x = hub + t * (radius - hub);
    // planform: widen quickly from the root, then taper to a rounded tip
    const c = chord * (0.55 + 0.75 * Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.5) - 0.6 * Math.pow(t, 3)) * (t > 0.96 ? Math.sqrt((1 - t) / 0.04) * 0.85 + 0.15 : 1);
    const th = 0.018 * (1 - t * 0.7);
    const angle = twist * (1 - t) + 0.08;
    const sweep = -0.05 * Math.pow(t, 2);
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    for (let j = 0; j < ring; j++) {
      const u = j < sectionSteps ? j / (sectionSteps - 1) : 1 - (j - sectionSteps) / (sectionSteps - 1);
      const top = j < sectionSteps;
      const zc = (u - 0.35) * c; // chordwise
      const camber = 0.012 * Math.sin(u * Math.PI) * (1 - t * 0.5);
      const yc = camber + (top ? 1 : -1) * th * Math.sin(Math.PI * Math.pow(u, 0.6)) * 0.5;
      // rotate section by local pitch around X axis (blade axis)
      positions.push(x, yc * ca + zc * sa, -yc * sa + zc * ca + sweep);
    }
  }
  for (let i = 0; i < radialSteps; i++) {
    for (let j = 0; j < ring; j++) {
      const a = i * ring + j;
      const b = i * ring + ((j + 1) % ring);
      const c = (i + 1) * ring + j;
      const d = (i + 1) * ring + ((j + 1) % ring);
      indices.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

function usePropGeometry() {
  const seg = useSeg();
  const p = droneConfig.propeller;
  return {
    blade: useDisposable(() => bladeGeometry(p.radius, p.chord, p.pitchTwist, seg(28, 12), seg(10, 5)), [p.radius, p.chord, p.pitchTwist]),
    hub: useDisposable(() => new THREE.CylinderGeometry(0.06, 0.07, 0.05, seg(24, 10)), []),
    nut: useDisposable(() => new THREE.CylinderGeometry(0.032, 0.04, 0.04, 6), []),
  };
}
export type PropGeometry = ReturnType<typeof usePropGeometry>;
export { usePropGeometry };

/** Two-blade composite propeller. `mirror` flips it for counter-rotating motors. */
export const Propeller = forwardRef<THREE.Group, { geo: PropGeometry; mirror?: boolean }>(function Propeller({ geo, mirror }, ref) {
  const { mats } = useDrone();
  return (
    <group ref={ref} scale={[1, 1, mirror ? -1 : 1]}>
      <mesh geometry={geo.hub} material={mats.composite} castShadow />
      <mesh geometry={geo.nut} material={mats.aluminium} position={[0, 0.04, 0]} />
      <mesh geometry={geo.blade} material={mats.propeller} castShadow />
      <mesh geometry={geo.blade} material={mats.propeller} rotation={[0, Math.PI, 0]} castShadow />
    </group>
  );
});
