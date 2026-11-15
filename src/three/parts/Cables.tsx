import { useMemo } from 'react';
import * as THREE from 'three';
import { droneConfig, levels, armDir, type Vec3 } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg, useAnchor } from '../scene/DroneContext';
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

/** Gold SMA-style connector; axis along +Y. */
export function SmaConnector({ position, rotation }: { position: Vec3; rotation?: Vec3 }) {
  const { mats } = useDrone();
  const seg = useSeg();
  const hex = useDisposable(() => new THREE.CylinderGeometry(0.024, 0.024, 0.026, 6), []);
  const body = useDisposable(() => new THREE.CylinderGeometry(0.016, 0.016, 0.05, seg(12, 8)), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={hex} material={mats.gold} />
      <mesh geometry={body} material={mats.gold} position={[0, 0.035, 0]} />
    </group>
  );
}

/** Copper helical antenna; axis along -Y from its feed point. */
function HelixAntenna({ position, rotation }: { position: Vec3; rotation?: Vec3 }) {
  const { mats } = useDrone();
  const seg = useSeg();
  const geo = useDisposable(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 140; i++) {
      const t = i / 140;
      const a = t * Math.PI * 2 * 5.5;
      const rad = 0.05 + t * 0.012;
      pts.push(new THREE.Vector3(Math.cos(a) * rad, -t * 0.2, Math.sin(a) * rad));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg(200, 70), 0.007, 6);
  }, []);
  return <mesh geometry={geo} material={mats.coax} position={position} rotation={rotation} castShadow />;
}

/**
 * External cables & connectors, as seen on the reference aircraft:
 *  - black motor leads under each arm (travel radially with the arms)
 *  - copper semi-rigid coax from the IroNav module's side connectors into the frame
 *  - copper lead along the front-left arm ending in a free SMA connector
 *  - copper helical antenna hanging beside the module
 *  - heavy black cable from the module's side
 */
export function Cables() {
  const { mats } = useDrone();
  const anchor = useAnchor('cables');
  const n = droneConfig.armCount;
  const dirs = useMemo(() => Array.from({ length: n }, (_, i) => armDir(i)), [n]);
  const yUnder = levels.armY - droneConfig.armRadius - 0.02;
  const [w, h] = droneConfig.ironav.size;
  const iy = levels.ironavY;
  const iz = droneConfig.ironav.forward;
  const side = w / 2 + 0.06; // x of connector tips on the module's +X face

  return (
    <group>
      {dirs.map((d, i) => {
        const p = (r: number, y: number): Vec3 => [d[0] * r, y, d[2] * r];
        const L = droneConfig.armLength;
        return (
          <ExplodeGroup key={i} part="cables" radialDir={d} name={`motor-lead-${i}`}>
            <Tube radius={0.014} material={mats.cable} points={[p(0.55, yUnder + 0.02), p(0.9, yUnder - 0.01), p(1.25, yUnder), p(L - 0.2, yUnder - 0.005), p(L - 0.12, yUnder + 0.05)]} />
          </ExplodeGroup>
        );
      })}

      {/* coax: module side connectors → frame */}
      <ExplodeGroup part="cables" name="coax-module-frame" spec={{ offset: [0.75, -0.55, 0.55], delay: 0.2 }}>
        <group ref={anchor}>
          {[0.14, 0.04, -0.06].map((z, k) => (
            <group key={z}>
              <Tube
                radius={0.011}
                material={mats.coax}
                points={[
                  [side + 0.03, iy + h * 0.28, iz + z],
                  [side + 0.12 + k * 0.02, iy + h * 0.32, iz + z + 0.02],
                  [side + 0.1 + k * 0.03, -0.02, iz + z + 0.05],
                  [0.32 + k * 0.05, levels.bottomPlateY + 0.02, 0.36 - k * 0.04],
                ]}
              />
            </group>
          ))}
        </group>
      </ExplodeGroup>

      {/* copper lead along the front-left arm to a free connector */}
      <ExplodeGroup part="cables" name="coax-arm-lead" spec={{ offset: [-0.55, 0.45, 0.55], delay: 0.14 }}>
        <Tube
          radius={0.011}
          material={mats.coax}
          tubular={56}
          points={[
            [-0.42, levels.topSurface + 0.06, 0.36],
            [-0.5, levels.topSurface - 0.02, 0.42],
            [-0.58, levels.armY + 0.1, 0.58],
            [-0.82, levels.armY + 0.1, 0.82],
            [-0.98, levels.armY + 0.04, 0.96],
            [-1.02, levels.armY - 0.2, 1.0],
            [-1.0, -0.35, 0.98],
            [-0.98, -0.5, 0.96],
          ]}
        />
        <SmaConnector position={[-0.98, -0.53, 0.96]} rotation={[Math.PI, 0, 0]} />
      </ExplodeGroup>

      {/* helical antenna hanging beside the module */}
      <ExplodeGroup part="cables" name="helix-antenna" spec={{ offset: [-0.85, -0.85, 0.7], delay: 0.24 }}>
        <SmaConnector position={[-w * 0.2, iy - h / 2 - 0.02, iz + 0.2]} rotation={[Math.PI, 0, 0]} />
        <Tube
          radius={0.011}
          material={mats.coax}
          points={[
            [-w * 0.2, iy - h / 2 - 0.06, iz + 0.2],
            [-w * 0.3, iy - h / 2 - 0.16, iz + 0.28],
            [-w * 0.45, iy - h / 2 - 0.2, iz + 0.32],
          ]}
        />
        <HelixAntenna position={[-w * 0.47, iy - h / 2 - 0.2, iz + 0.32]} rotation={[0.25, 0, -0.55]} />
      </ExplodeGroup>

      {/* heavy black cable from the module side */}
      <ExplodeGroup part="cables" name="black-cable" spec={{ offset: [0.7, -0.75, -0.3], delay: 0.22 }}>
        <Tube
          radius={0.026}
          material={mats.cable}
          tubular={40}
          points={[
            [side - 0.04, iy - h * 0.1, iz - 0.12],
            [side + 0.12, iy - h * 0.2, iz - 0.12],
            [side + 0.26, iy - h * 0.55, iz - 0.25],
            [side + 0.36, iy - h * 0.95, iz - 0.4],
          ]}
        />
      </ExplodeGroup>
    </group>
  );
}
