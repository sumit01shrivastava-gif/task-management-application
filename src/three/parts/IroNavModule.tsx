import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { droneConfig } from '../config/droneConfig';
import { useAnchor, useDisposable, useDrone, useSeg } from '../scene/DroneContext';
import { easeInOut, stagger } from '../rig/rig';

/**
 * IroNav module — reusable 3D object.
 *
 * The exterior follows the module's general appearance as a dark enclosure
 * mounted beneath the central assembly. The "internals" group is a CONCEPTUAL
 * illustration (generic board, components, connectors, enclosure layers); it
 * does not depict IroNav's actual internal architecture.
 *
 * Origin = centre of the enclosure. Internals explode along local +Y / -Y / -Z.
 */
export function IroNavModule() {
  const { mats, rig } = useDrone();
  const m = mats.ironav;
  const seg = useSeg();
  const [w, h, d] = droneConfig.ironav.size;
  const lidH = h * 0.34;
  const shellH = h - lidH;

  const anchor = useAnchor('ironav');
  const aLens = useAnchor('ironav.lens');
  const aPorts = useAnchor('ironav.ports');
  const aPcb = useAnchor('int.pcb');
  const aChips = useAnchor('int.chips');
  const aConn = useAnchor('int.connectors');
  const aIface = useAnchor('int.interface');
  const aEncl = useAnchor('int.enclosure');

  const lid = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const bracket = useRef<THREE.Group>(null);
  const heat = useRef<THREE.Group>(null);
  const pcb = useRef<THREE.Group>(null);
  const iface = useRef<THREE.Group>(null);
  const optic = useRef<THREE.Group>(null);
  const ports = useRef<THREE.Group>(null);
  const internals = useRef<THREE.Group>(null);
  const seam = useRef<THREE.Mesh>(null);

  // geometry
  const lensBezel = useDisposable(() => new THREE.CylinderGeometry(0.075, 0.085, 0.03, seg(40, 14)), []);
  const lensGlass = useDisposable(() => new THREE.CylinderGeometry(0.058, 0.058, 0.006, seg(40, 14)), []);
  const lensRing = useDisposable(() => new THREE.TorusGeometry(0.066, 0.004, 8, seg(48, 16)), []);
  const portShell = useDisposable(() => new THREE.CylinderGeometry(0.028, 0.028, 0.05, seg(18, 8)), []);
  const portKnurl = useDisposable(() => new THREE.CylinderGeometry(0.033, 0.033, 0.018, seg(18, 8)), []);
  const plate = useDisposable(() => new THREE.BoxGeometry(w * 0.82, 0.016, d * 0.86), [w, d]);
  const damper = useDisposable(() => new THREE.SphereGeometry(0.026, seg(14, 8), seg(10, 6)), []);
  const damperPin = useDisposable(() => new THREE.CylinderGeometry(0.008, 0.008, 0.11, 8), []);
  const label = useDisposable(() => new THREE.PlaneGeometry(0.2, 0.0625), []);
  const seamGeo = useDisposable(() => new THREE.BoxGeometry(w + 0.004, 0.006, d + 0.004), [w, d]);
  const finGeo = useDisposable(() => new THREE.BoxGeometry(w * 0.7, 0.028, 0.01), [w]);
  const board = useDisposable(() => new THREE.BoxGeometry(w * 0.86, 0.012, d * 0.82), [w, d]);
  const smallBoard = useDisposable(() => new THREE.BoxGeometry(w * 0.5, 0.01, d * 0.32), [w, d]);
  const chipBig = useDisposable(() => new THREE.BoxGeometry(0.095, 0.014, 0.095), []);
  const chipLid = useDisposable(() => new THREE.BoxGeometry(0.07, 0.004, 0.07), []);
  const chipSmall = useDisposable(() => new THREE.BoxGeometry(0.04, 0.008, 0.03), []);
  const cap = useDisposable(() => new THREE.CylinderGeometry(0.008, 0.008, 0.018, 10), []);
  const header = useDisposable(() => new THREE.BoxGeometry(0.11, 0.022, 0.024), []);
  const pin = useDisposable(() => new THREE.BoxGeometry(0.004, 0.02, 0.004), []);
  const opticBody = useDisposable(() => new THREE.CylinderGeometry(0.05, 0.05, 0.06, seg(28, 12)), []);
  const opticRing = useDisposable(() => new THREE.CylinderGeometry(0.062, 0.062, 0.012, seg(28, 12)), []);
  const gasketGeo = useDisposable(() => {
    const s = new THREE.Shape();
    const hw = w / 2 - 0.01;
    const hd = d / 2 - 0.01;
    s.moveTo(-hw, -hd);
    s.lineTo(hw, -hd);
    s.lineTo(hw, hd);
    s.lineTo(-hw, hd);
    s.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-hw + 0.018, -hd + 0.018);
    hole.lineTo(-hw + 0.018, hd - 0.018);
    hole.lineTo(hw - 0.018, hd - 0.018);
    hole.lineTo(hw - 0.018, -hd + 0.018);
    hole.closePath();
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [w, d]);

  useFrame(() => {
    const k = rig.internals;
    const show = k > 0.002;
    if (internals.current) internals.current.visible = show;

    // Enclosure layers separate along a single vertical build axis.
    const lidK = stagger(k, 0, 0.7);
    const heatK = stagger(k, 0.08, 0.7);
    const pcbK = stagger(k, 0.14, 0.7);
    const ifaceK = stagger(k, 0.2, 0.7);
    const shellK = stagger(k, 0.05, 0.7);
    const opticK = stagger(k, 0.18, 0.7);
    const portK = stagger(k, 0.25, 0.7);

    if (lid.current) lid.current.position.y = h / 2 - lidH / 2 + lidK * 0.62;
    if (bracket.current) bracket.current.position.y = h / 2 + 0.008 + lidK * 0.62 + lidK * 0.12;
    if (heat.current) heat.current.position.y = shellH / 2 - 0.02 + heatK * 0.42;
    if (pcb.current) pcb.current.position.y = shellH / 2 - 0.05 + pcbK * 0.22;
    if (iface.current) {
      iface.current.position.y = shellH / 2 - 0.075 + ifaceK * 0.04;
      iface.current.position.z = -d * 0.22 - ifaceK * 0.3;
    }
    if (shell.current) shell.current.position.y = -h / 2 + shellH / 2 - shellK * 0.36;
    if (optic.current) optic.current.position.y = -h / 2 + 0.05 - opticK * 0.18;
    if (ports.current) ports.current.position.z = -d / 2 - portK * 0.34;
    if (seam.current) {
      const mat = seam.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + rig.glow * 1.6;
      seam.current.position.y = h / 2 - lidH + lidK * 0.62;
    }
    m.gasket.emissiveIntensity = 0.25 + easeInOut(k) * 0.8;
  });

  return (
    <group ref={anchor}>
      {/* mounting bracket with vibration dampers (rides on top of the lid) */}
      <group ref={bracket} position={[0, h / 2 + 0.008, 0]}>
        <mesh geometry={plate} material={m.bracket} position={[0, 0.07, 0]} castShadow />
        {[
          [w * 0.33, d * 0.34],
          [-w * 0.33, d * 0.34],
          [w * 0.33, -d * 0.34],
          [-w * 0.33, -d * 0.34],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0.035, z]}>
            <mesh geometry={damper} material={mats.rubber} />
            <mesh geometry={damperPin} material={m.shellEdge} />
          </group>
        ))}
      </group>

      {/* upper enclosure lid */}
      <group ref={lid} position={[0, h / 2 - lidH / 2, 0]}>
        <RoundedBox args={[w, lidH, d]} radius={0.018} smoothness={3} material={m.shell} castShadow />
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} geometry={finGeo} material={m.shellEdge} position={[0, lidH / 2 + 0.006, -d * 0.3 + i * d * 0.15]} />
        ))}
      </group>

      {/* illuminated seam between lid and shell */}
      <mesh ref={seam} geometry={seamGeo} material={m.accent} position={[0, h / 2 - lidH, 0]} />

      {/* lower enclosure shell with downward-facing optical aperture */}
      <group ref={shell} position={[0, -h / 2 + shellH / 2, 0]}>
        <RoundedBox args={[w, shellH, d]} radius={0.02} smoothness={3} material={m.shell} castShadow receiveShadow />
        <mesh geometry={label} material={m.label} position={[-w * 0.18, 0.006, d / 2 + 0.0015]} />
        <group position={[w * 0.18, -shellH / 2 - 0.012, 0]}>
          <mesh geometry={lensBezel} material={m.shellEdge} />
          <mesh geometry={lensGlass} material={m.glass} position={[0, -0.016, 0]} />
          <mesh geometry={lensRing} material={m.accent} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.017, 0]} />
        </group>
        <group ref={aLens} position={[w * 0.18, -shellH / 2 - 0.03, 0]} />
      </group>

      {/* rear interface connectors (the external harness plugs in here) */}
      <group ref={ports} position={[0, 0, -d / 2]}>
        <group ref={aPorts} position={[0, 0.03, -0.02]} />
        {[0.16, -0.16].map((x) => (
          <group key={x} position={[x, h / 2 - 0.06, -0.012]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={portShell} material={m.shellEdge} />
            <mesh geometry={portKnurl} material={m.bracket} position={[0, 0.02, 0]} />
          </group>
        ))}
        <group ref={aConn} position={[0, h / 2 - 0.06, -0.03]} />
      </group>

      {/* ── Conceptual internals (illustrative only) ───────────────────── */}
      <group ref={internals} visible={false}>
        <group ref={aEncl} position={[w / 2, h / 2 - lidH / 2 + 0.62, 0]} />

        {/* heat spreader */}
        <group ref={heat} position={[0, shellH / 2 - 0.02, 0]}>
          <mesh geometry={plate} material={mats.aluminium} castShadow />
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} geometry={finGeo} material={mats.aluminium} position={[0, 0.02, -d * 0.32 + i * d * 0.128]} />
          ))}
          <mesh geometry={gasketGeo} material={m.gasket} position={[0, -0.02, 0]} />
        </group>

        {/* main circuit board with processing components */}
        <group ref={pcb} position={[0, shellH / 2 - 0.05, 0]}>
          <group ref={aPcb} position={[-w * 0.43, 0, d * 0.2]} />
          <mesh geometry={board} material={m.pcb} castShadow receiveShadow />
          <group position={[-0.04, 0.013, 0.01]}>
            <mesh geometry={chipBig} material={m.chip} castShadow />
            <mesh geometry={chipLid} material={m.chipLid} position={[0, 0.009, 0]} />
            <group ref={aChips} position={[0, 0.02, 0]} />
          </group>
          {[
            [0.1, 0.06],
            [0.1, -0.02],
            [0.1, -0.09],
            [-0.15, -0.08],
            [-0.15, 0.08],
          ].map(([x, z], i) => (
            <mesh key={i} geometry={chipSmall} material={m.chip} position={[x, 0.01, z]} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} geometry={cap} material={mats.aluminium} position={[-0.17 + (i % 5) * 0.03, 0.015, i < 5 ? 0.0 : -0.03]} />
          ))}
          <group position={[0, 0.017, -d * 0.36]}>
            <mesh geometry={header} material={m.chip} />
            {Array.from({ length: 10 }, (_, i) => (
              <mesh key={i} geometry={pin} material={m.gold} position={[-0.045 + i * 0.01, 0.014, 0]} />
            ))}
          </group>
        </group>

        {/* interface board */}
        <group ref={iface} position={[0, shellH / 2 - 0.075, -d * 0.22]}>
          <group ref={aIface} position={[w * 0.26, 0, 0]} />
          <mesh geometry={smallBoard} material={m.pcb} castShadow />
          <mesh geometry={header} material={m.chip} position={[0, 0.016, 0]} />
          {[-0.08, 0.08].map((x) => (
            <mesh key={x} geometry={chipSmall} material={m.chipLid} position={[x, 0.01, 0.01]} />
          ))}
        </group>

        {/* optical module */}
        <group ref={optic} position={[w * 0.18, -h / 2 + 0.05, 0]}>
          <mesh geometry={opticBody} material={mats.anodisedDark} />
          <mesh geometry={opticRing} material={m.shellEdge} position={[0, -0.03, 0]} />
          <mesh geometry={opticRing} material={m.shellEdge} position={[0, 0.026, 0]} />
        </group>
      </group>
    </group>
  );
}
