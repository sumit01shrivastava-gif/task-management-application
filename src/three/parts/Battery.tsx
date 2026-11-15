import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { droneConfig } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg, useAnchor } from '../scene/DroneContext';

/** Battery / power enclosure strapped to the top plate. */
export function Battery() {
  const { mats } = useDrone();
  const seg = useSeg();
  const anchor = useAnchor('battery');
  const [w, h, l] = droneConfig.battery.size;
  const strap = useDisposable(() => new THREE.BoxGeometry(w + 0.03, h + 0.025, 0.07), [w, h]);
  const buckle = useDisposable(() => new THREE.BoxGeometry(0.1, 0.02, 0.08), []);
  const band = useDisposable(() => new THREE.BoxGeometry(w + 0.004, 0.012, l * 0.6), [w, l]);
  const plug = useDisposable(() => new THREE.BoxGeometry(0.07, 0.05, 0.09), []);
  const lead = useDisposable(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, 0, -l / 2),
      new THREE.Vector3(0.12, -0.02, -l / 2 - 0.08),
      new THREE.Vector3(0.16, -0.08, -l / 2 - 0.12),
    ]);
    return new THREE.TubeGeometry(curve, seg(16, 6), 0.018, seg(8, 5));
  }, [l]);

  return (
    <group ref={anchor}>
      <RoundedBox args={[w, h, l]} radius={0.03} smoothness={3} material={mats.batteryWrap} castShadow receiveShadow />
      <mesh geometry={band} material={mats.anodisedBlue} position={[0, h / 2 + 0.001, 0]} />
      {[-l * 0.28, l * 0.28].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh geometry={strap} material={mats.strap} />
          <mesh geometry={buckle} material={mats.aluminium} position={[0, h / 2 + 0.017, 0]} />
        </group>
      ))}
      <mesh geometry={lead} material={mats.cable} />
      <mesh geometry={plug} material={mats.composite} position={[0.16, -0.1, -l / 2 - 0.14]} />
    </group>
  );
}
