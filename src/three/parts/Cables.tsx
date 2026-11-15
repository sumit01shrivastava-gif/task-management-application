import { useMemo } from 'react';
import * as THREE from 'three';
import { droneConfig, levels, armDir, type Vec3 } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg } from '../scene/DroneContext';
import { ExplodeGroup } from '../scene/ExplodeGroup';

function Tube({ points, radius, material, tubular = 32 }: { points: Vec3[]; radius: number; material: THREE.Material; tubular?: number }) {
  const seg = useSeg();
  const key = JSON.stringify(points);
  const geo = useDisposable(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), seg(tubular, 10), radius, seg(8, 5)),
    [key, radius],
  );
  return <mesh geometry={geo} material={material} castShadow />;
}

function Connector({ position, rotation }: { position: Vec3; rotation?: Vec3 }) {
  const { mats } = useDrone();
  const seg = useSeg();
  const shell = useDisposable(() => new THREE.CylinderGeometry(0.026, 0.026, 0.06, seg(14, 8)), []);
  const knurl = useDisposable(() => new THREE.CylinderGeometry(0.03, 0.03, 0.022, seg(14, 8)), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={shell} material={mats.connector} />
      <mesh geometry={knurl} material={mats.anodisedDark} position={[0, -0.02, 0]} />
    </group>
  );
}

/**
 * External cables & connectors as their own assemblies:
 *  - motor leads running under each arm (move radially with the arms)
 *  - the left/right harness linking the upper equipment stack to the IroNav module
 */
export function Cables() {
  const { mats } = useDrone();
  const n = droneConfig.armCount;
  const dirs = useMemo(() => Array.from({ length: n }, (_, i) => armDir(i)), [n]);
  const yUnder = levels.armY - droneConfig.armRadius - 0.022;
  const ironavTop = levels.ironavY + droneConfig.ironav.size[1] / 2;
  const deckY = levels.deckY;
  const iz = droneConfig.ironav.forward;

  return (
    <group>
      {dirs.map((d, i) => {
        const p = (r: number, y: number): Vec3 => [d[0] * r, y, d[2] * r];
        const L = droneConfig.armLength;
        return (
          <ExplodeGroup key={i} part="cables" radialDir={d} name={`motor-lead-${i}`}>
            <Tube
              radius={0.012}
              material={mats.cable}
              points={[p(0.5, yUnder + 0.01), p(0.8, yUnder - 0.012), p(1.2, yUnder - 0.006), p(L - 0.24, yUnder - 0.01), p(L - 0.12, yUnder + 0.05), p(L - 0.08, levels.motorBaseY + 0.02)]}
            />
          </ExplodeGroup>
        );
      })}

      {[1, -1].map((s) => (
        <ExplodeGroup
          key={s}
          part="cables"
          name={`ironav-harness-${s}`}
          spec={{ offset: [s * 0.95, -0.25, 0.25], delay: 0.2 }}
        >
          <Tube
            radius={0.016}
            material={s > 0 ? mats.cableAccent : mats.cable}
            tubular={48}
            points={[
              [s * 0.15, deckY + 0.02, 0.32],
              [s * 0.3, deckY - 0.06, 0.38],
              [s * 0.5, levels.topPlateY + 0.06, 0.36],
              [s * 0.6, levels.armY, 0.28],
              [s * 0.48, levels.bottomPlateY - 0.12, 0.12],
              [s * 0.3, ironavTop - 0.03, -0.12 + iz],
              [s * 0.16, ironavTop - 0.06, -droneConfig.ironav.size[2] / 2 - 0.02 + iz],
            ]}
          />
          <Connector position={[s * 0.15, deckY + 0.02, 0.32]} rotation={[Math.PI / 2, 0, 0]} />
          <Connector position={[s * 0.16, ironavTop - 0.06, -droneConfig.ironav.size[2] / 2 - 0.02 + iz]} rotation={[Math.PI / 2, 0, 0]} />
        </ExplodeGroup>
      ))}
    </group>
  );
}
