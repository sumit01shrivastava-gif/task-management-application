import * as THREE from 'three';
import { droneConfig, levels, armAngle } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg, useAnchor } from '../scene/DroneContext';

/** Rounded polygon carbon plate with lightening holes, extruded along +Y. */
function usePlateGeometry(radius: number, thickness: number, holes: boolean) {
  const seg = useSeg();
  const n = droneConfig.armCount;
  return useDisposable(() => {
    const shape = new THREE.Shape();
    const corner = radius * 0.22;
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i < n; i++) {
      const a = armAngle(i);
      pts.push(new THREE.Vector2(Math.sin(a) * radius, Math.cos(a) * radius));
    }
    // rounded corners between edge midpoints
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const prev = pts[(i - 1 + n) % n];
      const next = pts[(i + 1) % n];
      const a = p.clone().lerp(prev, corner / p.distanceTo(prev));
      const b = p.clone().lerp(next, corner / p.distanceTo(next));
      if (i === 0) shape.moveTo(a.x, a.y);
      else shape.lineTo(a.x, a.y);
      shape.quadraticCurveTo(p.x, p.y, b.x, b.y);
    }
    shape.closePath();

    if (holes) {
      // lightening slots between arms
      for (let i = 0; i < n; i++) {
        const a = armAngle(i) + Math.PI / n;
        const r = radius * 0.58;
        const h = new THREE.Path();
        const cx = Math.sin(a) * r;
        const cy = Math.cos(a) * r;
        h.absellipse(cx, cy, radius * 0.16, radius * 0.07, 0, Math.PI * 2, false, -a);
        shape.holes.push(h);
      }
      const centre = new THREE.Path();
      centre.absarc(0, 0, radius * 0.16, 0, Math.PI * 2, true);
      shape.holes.push(centre);
    }

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: seg(10, 4),
    });
    geo.rotateX(-Math.PI / 2);
    // planar UVs for the weave
    const pos = geo.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = pos.getX(i) / (radius * 2) + 0.5;
      uv[i * 2 + 1] = pos.getZ(i) / (radius * 2) + 0.5;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    return geo;
  }, [radius, thickness, holes, n]);
}

/** Central carbon-fibre frame: top plate, bottom plate and aluminium standoffs. */
export function Frame() {
  const { mats } = useDrone();
  const seg = useSeg();
  const f = droneConfig.frame;
  const anchor = useAnchor('frame');
  const top = usePlateGeometry(f.radius, f.plateThickness, true);
  const bottom = usePlateGeometry(f.radius * 0.96, f.plateThickness, true);
  const standoff = useDisposable(() => new THREE.CylinderGeometry(0.018, 0.018, f.plateGap, seg(12)), [f.plateGap]);
  const screw = useDisposable(() => new THREE.CylinderGeometry(0.014, 0.014, 0.012, seg(10)), []);

  const standoffs = Array.from({ length: f.standoffs }, (_, i) => {
    const a = (i / f.standoffs) * Math.PI * 2 + Math.PI / f.standoffs;
    return [Math.sin(a) * f.radius * 0.36, Math.cos(a) * f.radius * 0.36] as const;
  });

  return (
    <group ref={anchor}>
      <mesh geometry={bottom} material={mats.carbonPlate} position={[0, levels.bottomPlateY, 0]} castShadow receiveShadow />
      <mesh geometry={top} material={mats.carbonPlate} position={[0, levels.topPlateY, 0]} castShadow receiveShadow />
      {standoffs.map(([x, z], i) => (
        <group key={i} position={[x, levels.topPlateY - f.plateGap / 2, z]}>
          <mesh geometry={standoff} material={mats.aluminium} castShadow />
          <mesh geometry={screw} material={mats.titanium} position={[0, f.plateGap / 2 + f.plateThickness + 0.006, 0]} />
          <mesh geometry={screw} material={mats.titanium} position={[0, -f.plateGap / 2 - f.plateThickness - 0.006, 0]} />
        </group>
      ))}
    </group>
  );
}
