import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { droneConfig } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg, useAnchor } from '../scene/DroneContext';

/**
 * Upper central equipment assembly: carbon equipment deck, avionics enclosure
 * with heat-sink fins, satellite-antenna mast and datalink antennas.
 * Origin = underside of the deck.
 */
export function UpperEquipment() {
  const { mats } = useDrone();
  const seg = useSeg();
  const anchor = useAnchor('upperEquipment');
  const u = droneConfig.upperEquipment;
  const [dw, dh, dl] = u.deckSize;
  const [ew, eh, el] = u.enclosure;

  const deck = useDisposable(() => new THREE.BoxGeometry(dw, dh, dl), [dw, dh, dl]);
  const leg = useDisposable(() => new THREE.CylinderGeometry(0.014, 0.014, 0.17, seg(10)), []);
  const fin = useDisposable(() => new THREE.BoxGeometry(ew * 0.82, 0.03, 0.012), [ew]);
  const mast = useDisposable(() => new THREE.CylinderGeometry(0.016, 0.02, u.mastHeight, seg(12)), [u.mastHeight]);
  const puck = useDisposable(() => new THREE.CylinderGeometry(0.09, 0.1, 0.035, seg(32, 12)), []);
  const puckTop = useDisposable(() => new THREE.SphereGeometry(0.09, seg(28, 10), seg(10, 4), 0, Math.PI * 2, 0, Math.PI * 0.32), []);
  const antenna = useDisposable(() => new THREE.CylinderGeometry(0.011, 0.014, 0.3, seg(10)), []);
  const antennaBase = useDisposable(() => new THREE.CylinderGeometry(0.022, 0.026, 0.04, seg(12)), []);
  const port = useDisposable(() => new THREE.BoxGeometry(0.05, 0.026, 0.02), []);
  const led = useDisposable(() => new THREE.SphereGeometry(0.009, 8, 6), []);

  const fins = 7;
  return (
    <group ref={anchor}>
      {/* deck standoffs reach down to the battery straps */}
      {[
        [dw / 2 - 0.05, dl / 2 - 0.05],
        [-dw / 2 + 0.05, dl / 2 - 0.05],
        [dw / 2 - 0.05, -dl / 2 + 0.05],
        [-dw / 2 + 0.05, -dl / 2 + 0.05],
      ].map(([x, z], i) => (
        <mesh key={i} geometry={leg} material={mats.aluminium} position={[x, -0.085, z]} />
      ))}
      <mesh geometry={deck} material={mats.carbonPlate} position={[0, dh / 2, 0]} castShadow receiveShadow />

      {/* avionics enclosure */}
      <group position={[0, dh + eh / 2, 0.08]}>
        <RoundedBox args={[ew, eh, el]} radius={0.022} smoothness={3} material={mats.enclosure} castShadow receiveShadow />
        {Array.from({ length: fins }, (_, i) => (
          <mesh key={i} geometry={fin} material={mats.anodisedDark} position={[0, eh / 2 + 0.015, -el / 2 + 0.06 + (i * (el - 0.12)) / (fins - 1)]} castShadow />
        ))}
        {[-0.12, -0.04, 0.04].map((x) => (
          <mesh key={x} geometry={port} material={mats.connector} position={[x, -eh * 0.15, el / 2 + 0.008]} />
        ))}
        <mesh geometry={led} material={mats.ledGreen} position={[0.14, eh * 0.18, el / 2 + 0.004]} />
        <mesh geometry={led} material={mats.ledRed} position={[0.17, eh * 0.18, el / 2 + 0.004]} />
      </group>

      {/* satellite-antenna mast */}
      <group position={[0, dh, -dl / 2 + 0.12]}>
        <mesh geometry={mast} material={mats.carbonTube} position={[0, u.mastHeight / 2, 0]} castShadow />
        <group position={[0, u.mastHeight, 0]}>
          <mesh geometry={puck} material={mats.composite} castShadow />
          <mesh geometry={puckTop} material={mats.titanium} position={[0, 0.0, 0]} castShadow />
        </group>
      </group>

      {/* datalink antennas */}
      {[1, -1].map((s) => (
        <group key={s} position={[s * (dw / 2 - 0.06), dh, -dl / 2 + 0.07]} rotation={[-0.25, 0, s * 0.35]}>
          <mesh geometry={antennaBase} material={mats.aluminium} position={[0, 0.02, 0]} />
          <mesh geometry={antenna} material={mats.rubber} position={[0, 0.18, 0]} castShadow />
        </group>
      ))}
    </group>
  );
}
