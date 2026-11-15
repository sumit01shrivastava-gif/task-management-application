import * as THREE from 'three';
import { droneConfig } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg } from '../scene/DroneContext';

function useMotorGeometry() {
  const seg = useSeg();
  const { radius: r, height: h } = droneConfig.motor;
  return {
    base: useDisposable(() => new THREE.CylinderGeometry(r * 0.96, r, h * 0.2, seg(36, 12)), [r, h]),
    windings: useDisposable(() => new THREE.CylinderGeometry(r * 0.9, r * 0.9, h * 0.08, seg(36, 12)), [r, h]),
    bell: useDisposable(() => {
      // outrunner bell with a chamfered top; points ordered for outward normals
      const pts = [
        new THREE.Vector2(r * 0.97, 0),
        new THREE.Vector2(r, 0.004),
        new THREE.Vector2(r, h * 0.62),
        new THREE.Vector2(r * 0.9, h * 0.7),
        new THREE.Vector2(r * 0.45, h * 0.72),
        new THREE.Vector2(r * 0.001, h * 0.72),
      ];
      return new THREE.LatheGeometry(pts, seg(44, 16));
    }, [r, h]),
    band: useDisposable(() => new THREE.CylinderGeometry(r * 1.005, r * 1.005, h * 0.06, seg(44, 16), 1, true), [r, h]),
    rib: useDisposable(() => new THREE.BoxGeometry(0.02, h * 0.36, 0.01), [h]),
    cap: useDisposable(() => new THREE.CylinderGeometry(r * 0.42, r * 0.5, 0.035, seg(28, 10)), [r]),
    shaft: useDisposable(() => new THREE.CylinderGeometry(0.016, 0.016, 0.08, seg(10)), []),
  };
}
export type MotorGeometry = ReturnType<typeof useMotorGeometry>;
export { useMotorGeometry };

/**
 * Large brushless outrunner (black bell, gold band, aluminium cap).
 * Origin is the mounting face; the motor extends along +Y. The lower coaxial
 * motor is the same assembly rotated 180° about X.
 */
export function Motor({ geo }: { geo: MotorGeometry }) {
  const { mats } = useDrone();
  const { radius: r, height: h } = droneConfig.motor;
  const ribs = 12;
  return (
    <group>
      <mesh geometry={geo.base} material={mats.anodisedDark} position={[0, h * 0.1, 0]} castShadow />
      <mesh geometry={geo.windings} material={mats.copper} position={[0, h * 0.23, 0]} />
      <group position={[0, h * 0.27, 0]}>
        <mesh geometry={geo.bell} material={mats.motorBlack} castShadow />
        <mesh geometry={geo.band} material={mats.gold} position={[0, h * 0.06, 0]} />
        {Array.from({ length: ribs }, (_, i) => {
          const a = (i / ribs) * Math.PI * 2;
          return <mesh key={i} geometry={geo.rib} material={mats.anodisedDark} position={[Math.sin(a) * (r + 0.002), h * 0.34, Math.cos(a) * (r + 0.002)]} rotation={[0, a, 0]} />;
        })}
        <mesh geometry={geo.cap} material={mats.aluminium} position={[0, h * 0.73, 0]} />
        <mesh geometry={geo.shaft} material={mats.titanium} position={[0, h * 0.76, 0]} />
      </group>
    </group>
  );
}
