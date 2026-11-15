import * as THREE from 'three';
import { droneConfig, levels } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg, useAnchor } from '../scene/DroneContext';

/** Chamfered rectangular carbon plate with lightening holes, extruded along +Y. */
function usePlateGeometry(w: number, d: number, thickness: number) {
  const seg = useSeg();
  return useDisposable(() => {
    const c = 0.16; // corner chamfer
    const hw = w / 2;
    const hd = d / 2;
    const s = new THREE.Shape();
    s.moveTo(-hw + c, -hd);
    s.lineTo(hw - c, -hd);
    s.lineTo(hw, -hd + c);
    s.lineTo(hw, hd - c);
    s.lineTo(hw - c, hd);
    s.lineTo(-hw + c, hd);
    s.lineTo(-hw, hd - c);
    s.lineTo(-hw, -hd + c);
    s.closePath();
    // lightening slots
    for (const x of [-0.3, 0, 0.3]) {
      const h = new THREE.Path();
      h.absellipse(x, 0, 0.09, 0.22, 0, Math.PI * 2, true, 0);
      s.holes.push(h);
    }
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: seg(12, 6),
    });
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = pos.getX(i) / w + 0.5;
      uv[i * 2 + 1] = pos.getZ(i) / w + 0.5;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    return geo;
  }, [w, d, thickness]);
}

/** Vertical side plate with a row of triangular cut-outs (as on the reference airframe). */
function useSidePlateGeometry(len: number, h: number) {
  return useDisposable(() => {
    const s = new THREE.Shape();
    s.moveTo(-len / 2, -h / 2);
    s.lineTo(len / 2, -h / 2);
    s.lineTo(len / 2, h / 2);
    s.lineTo(-len / 2, h / 2);
    s.closePath();
    const n = 6;
    const step = (len - 0.12) / n;
    for (let i = 0; i < n; i++) {
      const x0 = -len / 2 + 0.06 + i * step + 0.015;
      const x1 = x0 + step - 0.03;
      const up = i % 2 === 0;
      const t = new THREE.Path();
      const yb = -h / 2 + 0.05;
      const yt = h / 2 - 0.05;
      if (up) {
        t.moveTo(x0, yb);
        t.lineTo(x1, yb);
        t.lineTo((x0 + x1) / 2, yt);
      } else {
        t.moveTo(x0, yt);
        t.lineTo((x0 + x1) / 2, yb);
        t.lineTo(x1, yt);
      }
      t.closePath();
      s.holes.push(t);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false });
    g.translate(0, 0, -0.01);
    const pos = g.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = pos.getX(i) / len + 0.5;
      uv[i * 2 + 1] = pos.getY(i) / len + 0.5;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
  }, [len, h]);
}

/** Central carbon-fibre frame: top & bottom plates, triangulated side plates, standoffs, power wiring. */
export function Frame() {
  const { mats } = useDrone();
  const seg = useSeg();
  const f = droneConfig.frame;
  const anchor = useAnchor('frame');
  const plate = usePlateGeometry(f.width, f.depth, f.plateThickness);
  const side = useSidePlateGeometry(f.width - 0.42, f.plateGap + f.plateThickness * 2);
  const standoff = useDisposable(() => new THREE.CylinderGeometry(0.018, 0.018, f.plateGap, seg(12)), [f.plateGap]);
  const wire = useDisposable(() => {
    const parts = [
      [[0.18, 0.06, 0.3], [0.32, 0.15, 0.42], [0.46, 0.08, 0.38]],
      [[0.22, 0.2, 0.32], [0.4, 0.12, 0.45], [0.52, 0.2, 0.36]],
      [[-0.2, 0.08, -0.3], [-0.36, 0.18, -0.42], [-0.5, 0.1, -0.36]],
    ];
    const geos = parts.map((p) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map((v) => new THREE.Vector3(v[0], v[1], v[2]))), 16, 0.013, 6));
    return { geos, dispose: () => geos.forEach((g) => g.dispose()) };
  }, []);
  const midY = f.plateThickness + f.plateGap / 2;
  const standoffs: [number, number][] = [
    [0.42, 0.3],
    [-0.42, 0.3],
    [0.42, -0.3],
    [-0.42, -0.3],
    [0, 0.38],
    [0, -0.38],
  ];

  return (
    <group ref={anchor}>
      <mesh geometry={plate} material={mats.carbonPlate} position={[0, levels.bottomPlateY, 0]} castShadow receiveShadow />
      <mesh geometry={plate} material={mats.carbonPlate} position={[0, levels.topPlateY, 0]} castShadow receiveShadow />
      {[1, -1].map((s) => (
        <mesh key={s} geometry={side} material={mats.carbonPlate} position={[0, midY, s * (f.depth / 2 - 0.01)]} castShadow />
      ))}
      {standoffs.map(([x, z], i) => (
        <mesh key={i} geometry={standoff} material={mats.aluminium} position={[x, midY, z]} />
      ))}
      {wire.geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mats.wireRed} />
      ))}
    </group>
  );
}
