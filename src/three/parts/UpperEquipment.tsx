import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { droneConfig } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg, useAnchor } from '../scene/DroneContext';

/**
 * Upper central equipment assembly: secondary electronics box behind the power
 * enclosure, two vertical antennas and a small copper helical antenna.
 * Origin = top surface of the top plate.
 */
export function UpperEquipment() {
  const { mats } = useDrone();
  const seg = useSeg();
  const anchor = useAnchor('upperEquipment');
  const u = droneConfig.upperEquipment;
  const [bw, bh, bd] = u.box;

  const antenna = useDisposable(() => new THREE.CylinderGeometry(0.022, 0.03, u.antennaHeight, seg(14, 8)), [u.antennaHeight]);
  const antennaBase = useDisposable(() => new THREE.CylinderGeometry(0.036, 0.04, 0.06, seg(14, 8)), []);
  const port = useDisposable(() => new THREE.BoxGeometry(0.06, 0.03, 0.02), []);
  const label = useDisposable(() => new THREE.BoxGeometry(bw * 0.6, 0.06, 0.004), [bw]);
  const helix = useDisposable(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const a = t * Math.PI * 2 * 5;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.035, t * 0.16, Math.sin(a) * 0.035));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg(160, 60), 0.005, 6);
  }, []);
  const stub = useDisposable(() => new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6), []);
  const led = useDisposable(() => new THREE.SphereGeometry(0.012, 8, 6), []);

  return (
    <group ref={anchor}>
      {/* electronics box (rear right) */}
      <group position={[0.46, bh / 2, -0.18]}>
        <RoundedBox args={[bw, bh, bd]} radius={0.03} smoothness={3} material={mats.enclosure} castShadow receiveShadow />
        <mesh geometry={label} material={mats.titanium} position={[0, bh * 0.15, bd / 2 + 0.002]} />
        <mesh geometry={port} material={mats.connector} position={[-0.08, -bh * 0.2, bd / 2 + 0.01]} />
        <mesh geometry={port} material={mats.connector} position={[0.06, -bh * 0.2, bd / 2 + 0.01]} />
        <mesh geometry={led} material={mats.ledGreen} position={[0.13, bh * 0.32, bd / 2 + 0.004]} />
      </group>

      {/* vertical antennas at the front corners */}
      {[-0.58, 0.58].map((x) => (
        <group key={x} position={[x, 0, 0.32]}>
          <mesh geometry={antennaBase} material={mats.composite} position={[0, 0.03, 0]} />
          <mesh geometry={antenna} material={mats.rubber} position={[0, u.antennaHeight / 2 + 0.05, 0]} castShadow />
        </group>
      ))}

      {/* copper helical antenna (front left) */}
      <group position={[-0.42, 0, 0.36]}>
        <mesh geometry={stub} material={mats.coax} position={[0, 0.06, 0]} />
        <mesh geometry={helix} material={mats.coax} position={[0, 0.1, 0]} />
      </group>
    </group>
  );
}
