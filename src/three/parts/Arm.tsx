import * as THREE from 'three';
import { droneConfig, levels, armAngle } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg } from '../scene/DroneContext';

const ROOT = 0.45;

/** Square carbon plate with an X-pattern of triangular cut-outs, in the YZ plane. */
function xPlateGeometry(size: number, thickness: number) {
  const h = size / 2;
  const s = new THREE.Shape();
  s.moveTo(-h, -h);
  s.lineTo(h, -h);
  s.lineTo(h, h);
  s.lineTo(-h, h);
  s.closePath();
  const m = 0.045; // web width
  const i = h - 0.035; // inner margin
  const tris: [number, number][][] = [
    [[-i + m, -i], [i - m, -i], [0, -m]],
    [[-i + m, i], [0, m], [i - m, i]],
    [[-i, -i + m], [-m, 0], [-i, i - m]],
    [[i, -i + m], [i, i - m], [m, 0]],
  ];
  tris.forEach((t) => {
    const p = new THREE.Path();
    p.moveTo(t[0][0], t[0][1]);
    p.lineTo(t[1][0], t[1][1]);
    p.lineTo(t[2][0], t[2][1]);
    p.closePath();
    s.holes.push(p);
  });
  const g = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false });
  g.translate(0, 0, -thickness / 2);
  g.rotateY(Math.PI / 2); // plate normal → X
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let k = 0; k < pos.count; k++) {
    uv[k * 2] = pos.getZ(k) / size + 0.5;
    uv[k * 2 + 1] = pos.getY(k) / size + 0.5;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** Shared geometry for every arm. */
function useArmGeometry() {
  const seg = useSeg();
  const r = droneConfig.armRadius;
  const len = droneConfig.armLength - ROOT - 0.04;
  const m = droneConfig.mount;
  return {
    tube: useDisposable(() => {
      const g = new THREE.CylinderGeometry(r, r, len, seg(24, 10), 1, false);
      g.rotateX(Math.PI / 2);
      return g;
    }, [len, r]),
    len,
    clamp: useDisposable(() => new THREE.BoxGeometry(0.24, droneConfig.frame.plateGap - 0.01, 0.24), []),
    band: useDisposable(() => {
      const g = new THREE.CylinderGeometry(r * 1.28, r * 1.28, 0.07, seg(24, 10));
      g.rotateX(Math.PI / 2);
      return g;
    }, [r]),
    xPlate: useDisposable(() => xPlateGeometry(m.size, m.thickness), [m.size, m.thickness]),
    tipSleeve: useDisposable(() => {
      const g = new THREE.CylinderGeometry(r * 1.2, r * 1.2, 0.3, seg(24, 10));
      g.rotateX(Math.PI / 2);
      return g;
    }, [r]),
    block: useDisposable(() => new THREE.BoxGeometry(0.2, 0.26, 0.11), []),
    blockSlot: useDisposable(() => new THREE.BoxGeometry(0.205, 0.02, 0.06), []),
  };
}

export type ArmGeometry = ReturnType<typeof useArmGeometry>;
export { useArmGeometry };

/**
 * One carbon-fibre arm: root clamp inside the frame, strap bands, and the
 * coaxial motor mount (twin X-pattern carbon plates + aluminium clamp block).
 */
export function Arm({ index, geo }: { index: number; geo: ArmGeometry }) {
  const { mats } = useDrone();
  const a = armAngle(index);
  const mid = ROOT + geo.len / 2;
  const L = droneConfig.armLength;
  const spread = droneConfig.mount.spread;
  return (
    <group rotation={[0, a, 0]} position={[0, levels.armY, 0]}>
      <mesh geometry={geo.clamp} material={mats.composite} position={[0, 0, ROOT + 0.08]} castShadow />
      <mesh geometry={geo.tube} material={mats.carbonTube} position={[0, 0, mid]} castShadow receiveShadow />
      {[ROOT + 0.32, ROOT + 0.5].map((z) => (
        <mesh key={z} geometry={geo.band} material={mats.composite} position={[0, 0, z]} castShadow />
      ))}
      {/* coaxial motor mount */}
      <group position={[0, 0, L]}>
        <mesh geometry={geo.tipSleeve} material={mats.composite} position={[0, 0, -0.12]} castShadow />
        <mesh geometry={geo.xPlate} material={mats.carbonPlate} position={[spread, 0, 0]} castShadow />
        <mesh geometry={geo.xPlate} material={mats.carbonPlate} position={[-spread, 0, 0]} castShadow />
        <group position={[0, 0, 0.24]}>
          <mesh geometry={geo.block} material={mats.silverBlock} castShadow />
          <mesh geometry={geo.blockSlot} material={mats.anodisedDark} position={[0, 0.05, 0.03]} />
          <mesh geometry={geo.blockSlot} material={mats.anodisedDark} position={[0, -0.05, 0.03]} />
        </group>
      </group>
    </group>
  );
}
