import * as THREE from 'three';
import { droneConfig, levels, armAngle } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg } from '../scene/DroneContext';

const ROOT = 0.34;

/** Shared geometry for every arm (instanced by reference). */
function useArmGeometry() {
  const seg = useSeg();
  const len = droneConfig.armLength - ROOT - 0.04;
  return {
    tube: useDisposable(() => {
      const g = new THREE.CylinderGeometry(droneConfig.armRadius, droneConfig.armRadius, len, seg(20, 8), 1, false);
      g.rotateX(Math.PI / 2);
      return g;
    }, [len]),
    len,
    clamp: useDisposable(() => new THREE.BoxGeometry(0.16, 0.15, 0.16), []),
    hinge: useDisposable(() => {
      const g = new THREE.CylinderGeometry(droneConfig.armRadius * 1.45, droneConfig.armRadius * 1.45, 0.11, seg(20, 8));
      g.rotateX(Math.PI / 2);
      return g;
    }, []),
    hingeBolt: useDisposable(() => new THREE.CylinderGeometry(0.018, 0.018, 0.17, seg(10)), []),
    mount: useDisposable(() => new THREE.CylinderGeometry(droneConfig.motor.mountRadius, droneConfig.motor.mountRadius * 0.92, 0.03, seg(28, 10)), []),
    mountClamp: useDisposable(() => {
      const g = new THREE.CylinderGeometry(droneConfig.armRadius * 1.5, droneConfig.armRadius * 1.5, 0.15, seg(20, 8));
      g.rotateX(Math.PI / 2);
      return g;
    }, []),
    cap: useDisposable(() => new THREE.SphereGeometry(droneConfig.armRadius * 1.02, seg(14, 8), seg(8, 4), 0, Math.PI * 2, 0, Math.PI / 2), []),
  };
}

export type ArmGeometry = ReturnType<typeof useArmGeometry>;
export { useArmGeometry };

/** One carbon-fibre structural arm with root clamp, folding joint and motor mount. */
export function Arm({ index, geo }: { index: number; geo: ArmGeometry }) {
  const { mats } = useDrone();
  const a = armAngle(index);
  const mid = ROOT + geo.len / 2;
  return (
    <group rotation={[0, a, 0]} position={[0, levels.armY, 0]}>
      {/* root clamp sits between the plates */}
      <mesh geometry={geo.clamp} material={mats.anodisedDark} position={[0, 0, ROOT + 0.06]} castShadow />
      <mesh geometry={geo.tube} material={mats.carbonTube} position={[0, 0, mid]} castShadow receiveShadow />
      {/* folding joint */}
      <group position={[0, 0, ROOT + 0.32]}>
        <mesh geometry={geo.hinge} material={mats.aluminium} castShadow />
        <mesh geometry={geo.hingeBolt} material={mats.titanium} />
      </group>
      {/* motor mount at tip */}
      <group position={[0, 0, droneConfig.armLength]}>
        <mesh geometry={geo.mountClamp} material={mats.anodisedDark} position={[0, 0, -0.08]} castShadow />
        <mesh geometry={geo.mount} material={mats.carbonPlate} position={[0, droneConfig.armRadius + 0.012, 0]} castShadow />
      </group>
    </group>
  );
}
