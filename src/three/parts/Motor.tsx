import * as THREE from 'three';
import { droneConfig } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg } from '../scene/DroneContext';

function useMotorGeometry() {
  const seg = useSeg();
  const { radius: r, height: h } = droneConfig.motor;
  return {
    base: useDisposable(() => new THREE.CylinderGeometry(r * 0.92, r * 0.98, h * 0.28, seg(32, 12)), [r, h]),
    windings: useDisposable(() => new THREE.CylinderGeometry(r * 0.86, r * 0.86, h * 0.14, seg(32, 12)), [r, h]),
    bell: useDisposable(() => {
      // lathe profile for an outrunner bell with chamfered top
      const pts = [
        new THREE.Vector2(r * 0.001, h * 0.62),
        new THREE.Vector2(r * 0.55, h * 0.62),
        new THREE.Vector2(r * 0.94, h * 0.55),
        new THREE.Vector2(r, h * 0.46),
        new THREE.Vector2(r, 0),
        new THREE.Vector2(r * 0.95, 0),
      ];
      return new THREE.LatheGeometry(pts.reverse(), seg(40, 14));
    }, [r, h]),
    vent: useDisposable(() => new THREE.BoxGeometry(0.03, h * 0.26, 0.012), [h]),
    cap: useDisposable(() => new THREE.CylinderGeometry(r * 0.32, r * 0.36, 0.03, seg(24, 10)), [r]),
    shaft: useDisposable(() => new THREE.CylinderGeometry(0.014, 0.014, 0.08, seg(10)), []),
    ring: useDisposable(() => new THREE.TorusGeometry(r * 0.98, 0.006, 6, seg(40, 14)), [r]),
  };
}
export type MotorGeometry = ReturnType<typeof useMotorGeometry>;
export { useMotorGeometry };

/** Brushless outrunner motor assembly. Origin is the motor base on the mount. */
export function Motor({ geo }: { geo: MotorGeometry }) {
  const { mats } = useDrone();
  const { radius: r, height: h } = droneConfig.motor;
  const vents = 10;
  return (
    <group>
      <mesh geometry={geo.base} material={mats.anodisedDark} position={[0, h * 0.14, 0]} castShadow />
      <mesh geometry={geo.windings} material={mats.copper} position={[0, h * 0.33, 0]} />
      <group position={[0, h * 0.38, 0]}>
        <mesh geometry={geo.bell} material={mats.titanium} castShadow />
        <mesh geometry={geo.ring} material={mats.anodisedBlue} rotation={[Math.PI / 2, 0, 0]} position={[0, h * 0.06, 0]} />
        {Array.from({ length: vents }, (_, i) => {
          const a = (i / vents) * Math.PI * 2;
          return (
            <mesh
              key={i}
              geometry={geo.vent}
              material={mats.composite}
              position={[Math.sin(a) * (r + 0.001), h * 0.24, Math.cos(a) * (r + 0.001)]}
              rotation={[0, a, 0]}
            />
          );
        })}
        <mesh geometry={geo.cap} material={mats.aluminium} position={[0, h * 0.63, 0]} />
        <mesh geometry={geo.shaft} material={mats.titanium} position={[0, h * 0.66, 0]} />
      </group>
    </group>
  );
}
