import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { droneConfig } from '../config/droneConfig';
import { useDisposable, useDrone, useAnchor } from '../scene/DroneContext';

/** Large black power enclosure strapped to the top plate. */
export function Battery() {
  const { mats } = useDrone();
  const anchor = useAnchor('battery');
  const [w, h, l] = droneConfig.battery.size;
  const strap = useDisposable(() => new THREE.BoxGeometry(0.12, h + 0.03, l + 0.03), [h, l]);
  const buckle = useDisposable(() => new THREE.BoxGeometry(0.13, 0.08, 0.02), []);
  const seam = useDisposable(() => new THREE.BoxGeometry(w + 0.004, 0.01, l + 0.004), [w, l]);
  const lid = useDisposable(() => new THREE.BoxGeometry(w * 0.82, 0.03, l * 0.8), [w, l]);

  return (
    <group ref={anchor}>
      <RoundedBox args={[w, h, l]} radius={0.05} smoothness={4} material={mats.batteryWrap} castShadow receiveShadow />
      <mesh geometry={lid} material={mats.enclosure} position={[0, h / 2 + 0.01, 0]} castShadow />
      <mesh geometry={seam} material={mats.composite} position={[0, h * 0.18, 0]} />
      <mesh geometry={strap} material={mats.strap} position={[w * 0.2, 0, 0]} />
      <mesh geometry={buckle} material={mats.aluminium} position={[w * 0.2, h * 0.15, l / 2 + 0.02]} />
    </group>
  );
}
