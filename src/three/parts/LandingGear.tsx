import * as THREE from 'three';
import { droneConfig } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg } from '../scene/DroneContext';

/** Tube mesh between two points. */
function tubeBetween(a: THREE.Vector3, b: THREE.Vector3, r: number, radial: number) {
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(r, r, len, radial, 1);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  g.applyQuaternion(q);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}

/**
 * One side of the skid landing gear (mirrored on X).
 * Two raked struts from the bottom-plate mount down to a longitudinal skid.
 */
export function LandingGearSide({ side }: { side: 1 | -1 }) {
  const { mats } = useDrone();
  const seg = useSeg();
  const lg = droneConfig.landingGear;
  const r = lg.tubeRadius;
  const yTop = -0.04;
  const yBot = -lg.height;
  const xTop = lg.spreadX * 0.62;
  const xBot = lg.spreadX * 1.18;

  const geo = useDisposable(() => {
    const parts = [
      tubeBetween(new THREE.Vector3(xTop, yTop, 0.24), new THREE.Vector3(xBot, yBot + 0.03, 0.42), r, seg(14, 8)),
      tubeBetween(new THREE.Vector3(xTop, yTop, -0.24), new THREE.Vector3(xBot, yBot + 0.03, -0.42), r, seg(14, 8)),
    ];
    const merged = mergeSimple(parts);
    parts.forEach((p) => p.dispose());
    return merged;
  }, [xTop, xBot, yTop, yBot, r]);

  const skid = useDisposable(() => {
    const g = new THREE.CylinderGeometry(r * 1.1, r * 1.1, lg.skidLength, seg(16, 8));
    g.rotateX(Math.PI / 2);
    return g;
  }, [lg.skidLength, r]);
  const cap = useDisposable(() => new THREE.SphereGeometry(r * 1.35, seg(12, 6), seg(8, 4)), [r]);
  const tee = useDisposable(() => new THREE.BoxGeometry(r * 3.4, r * 3.2, r * 4.2), [r]);
  const mount = useDisposable(() => new THREE.BoxGeometry(0.1, 0.05, 0.62), []);
  const foot = useDisposable(() => new THREE.BoxGeometry(r * 3, r * 1.4, 0.32), [r]);

  return (
    <group scale={[side, 1, 1]}>
      <mesh geometry={mount} material={mats.anodisedDark} position={[xTop, yTop + 0.015, 0]} castShadow />
      <mesh geometry={geo} material={mats.carbonTube} castShadow />
      <group position={[xBot, yBot, 0]}>
        <mesh geometry={skid} material={mats.carbonTube} castShadow receiveShadow />
        <mesh geometry={cap} material={mats.rubber} position={[0, 0, lg.skidLength / 2]} />
        <mesh geometry={cap} material={mats.rubber} position={[0, 0, -lg.skidLength / 2]} />
        <mesh geometry={tee} material={mats.aluminium} position={[0, 0.02, 0.42]} castShadow />
        <mesh geometry={tee} material={mats.aluminium} position={[0, 0.02, -0.42]} castShadow />
        <mesh geometry={foot} material={mats.rubber} position={[0, -r * 0.9, 0.62]} />
        <mesh geometry={foot} material={mats.rubber} position={[0, -r * 0.9, -0.62]} />
      </group>
    </group>
  );
}

/** Minimal non-indexed merge for a handful of primitive geometries. */
function mergeSimple(geos: THREE.BufferGeometry[]) {
  const nonIndexed = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  let count = 0;
  nonIndexed.forEach((g) => (count += g.attributes.position.count));
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  let o = 0;
  nonIndexed.forEach((g) => {
    pos.set(g.attributes.position.array as Float32Array, o * 3);
    nor.set(g.attributes.normal.array as Float32Array, o * 3);
    uv.set(g.attributes.uv.array as Float32Array, o * 2);
    o += g.attributes.position.count;
    if (g !== geos[nonIndexed.indexOf(g)]) g.dispose();
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return out;
}
