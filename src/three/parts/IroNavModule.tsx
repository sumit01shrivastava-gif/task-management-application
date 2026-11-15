import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { droneConfig } from '../config/droneConfig';
import { useAnchor, useDisposable, useDrone, useSeg } from '../scene/DroneContext';
import { easeInOut, stagger } from '../rig/rig';
import { SmaConnector } from './Cables';

/**
 * IroNav module — reusable 3D object.
 *
 * Exterior follows the reference photograph: a black rounded enclosure with a
 * white chevron name panel on the front, an aluminium side bracket carrying
 * gold RF connectors, and a mounting plate to the frame above.
 *
 * The "internals" group is a CONCEPTUAL illustration (generic board, components,
 * connectors, enclosure layers). It does not depict IroNav's actual internal
 * architecture.
 *
 * Origin = centre of the enclosure. Internals explode along local ±Y / -Z.
 */
export function IroNavModule() {
  const { mats, rig } = useDrone();
  const m = mats.ironav;
  const seg = useSeg();
  const [w, h, d] = droneConfig.ironav.size;
  const lidH = h * 0.24;
  const shellH = h - lidH;

  const anchor = useAnchor('ironav');
  const aBracket = useAnchor('ironav.bracket');
  const aPorts = useAnchor('ironav.ports');
  const aPcb = useAnchor('int.pcb');
  const aChips = useAnchor('int.chips');
  const aConn = useAnchor('int.connectors');
  const aIface = useAnchor('int.interface');
  const aEncl = useAnchor('int.enclosure');

  const lid = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const bracket = useRef<THREE.Group>(null);
  const sideBracket = useRef<THREE.Group>(null);
  const heat = useRef<THREE.Group>(null);
  const pcb = useRef<THREE.Group>(null);
  const iface = useRef<THREE.Group>(null);
  const ports = useRef<THREE.Group>(null);
  const internals = useRef<THREE.Group>(null);
  const seam = useRef<THREE.Mesh>(null);

  const plate = useDisposable(() => new THREE.BoxGeometry(w * 0.8, 0.02, d * 0.8), [w, d]);
  const damper = useDisposable(() => new THREE.CylinderGeometry(0.03, 0.03, 0.05, seg(14, 8)), []);
  const panel = useDisposable(() => new THREE.PlaneGeometry(w * 0.92, w * 0.92 * (680 / 1024)), [w]);
  const sidePlate = useDisposable(() => new THREE.BoxGeometry(0.018, h * 0.86, d * 0.9), [h, d]);
  const screw = useDisposable(() => new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), []);
  const rearPort = useDisposable(() => new THREE.CylinderGeometry(0.035, 0.035, 0.04, seg(16, 8)), []);
  const seamGeo = useDisposable(() => new THREE.BoxGeometry(w + 0.004, 0.006, d + 0.004), [w, d]);
  const board = useDisposable(() => new THREE.BoxGeometry(w * 0.84, 0.014, d * 0.8), [w, d]);
  const smallBoard = useDisposable(() => new THREE.BoxGeometry(w * 0.5, 0.012, d * 0.3), [w, d]);
  const chipBig = useDisposable(() => new THREE.BoxGeometry(0.12, 0.016, 0.12), []);
  const chipLid = useDisposable(() => new THREE.BoxGeometry(0.09, 0.005, 0.09), []);
  const chipSmall = useDisposable(() => new THREE.BoxGeometry(0.05, 0.01, 0.036), []);
  const cap = useDisposable(() => new THREE.CylinderGeometry(0.01, 0.01, 0.022, 10), []);
  const header = useDisposable(() => new THREE.BoxGeometry(0.14, 0.026, 0.028), []);
  const pin = useDisposable(() => new THREE.BoxGeometry(0.005, 0.024, 0.005), []);
  const fin = useDisposable(() => new THREE.BoxGeometry(w * 0.7, 0.04, 0.012), [w]);
  const spreader = useDisposable(() => new THREE.BoxGeometry(w * 0.8, 0.02, d * 0.78), [w, d]);
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
    hole.moveTo(-hw + 0.02, -hd + 0.02);
    hole.lineTo(-hw + 0.02, hd - 0.02);
    hole.lineTo(hw - 0.02, hd - 0.02);
    hole.lineTo(hw - 0.02, -hd + 0.02);
    hole.closePath();
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [w, d]);

  useFrame(() => {
    const k = rig.internals;
    if (internals.current) internals.current.visible = k > 0.002;

    // Enclosure layers separate along a single vertical build axis.
    const lidK = stagger(k, 0, 0.7);
    const heatK = stagger(k, 0.08, 0.7);
    const pcbK = stagger(k, 0.14, 0.7);
    const ifaceK = stagger(k, 0.2, 0.7);
    const shellK = stagger(k, 0.05, 0.7);
    const sideK = stagger(k, 0.12, 0.7);
    const portK = stagger(k, 0.25, 0.7);

    const lidY = h / 2 - lidH / 2 + lidK * 0.75;
    if (lid.current) lid.current.position.y = lidY;
    if (bracket.current) bracket.current.position.y = h / 2 + lidK * 0.75 + lidK * 0.18;
    if (heat.current) heat.current.position.y = shellH / 2 - h / 2 + heatK * 0.52 - 0.03;
    if (pcb.current) pcb.current.position.y = shellH / 2 - h / 2 - 0.08 + pcbK * 0.3;
    if (iface.current) {
      iface.current.position.y = shellH / 2 - h / 2 - 0.14 + ifaceK * 0.06;
      iface.current.position.z = -d * 0.2 - ifaceK * 0.36;
    }
    if (shell.current) shell.current.position.y = -h / 2 + shellH / 2 - shellK * 0.42;
    if (sideBracket.current) sideBracket.current.position.x = w / 2 + 0.012 + sideK * 0.35;
    if (ports.current) ports.current.position.z = -d / 2 - portK * 0.3;
    if (seam.current) {
      (seam.current.material as THREE.MeshStandardMaterial).emissiveIntensity = rig.glow * 1.8;
      seam.current.position.y = h / 2 - lidH + lidK * 0.75;
    }
    m.gasket.emissiveIntensity = 0.25 + easeInOut(k) * 0.8;
  });

  return (
    <group ref={anchor}>
      {/* mounting plate + isolators up to the frame */}
      <group ref={bracket} position={[0, h / 2, 0]}>
        <group ref={aBracket} position={[-w * 0.3, 0.04, 0]} />
        <mesh geometry={plate} material={m.bracket} position={[0, 0.05, 0]} castShadow />
        {[
          [w * 0.32, d * 0.3],
          [-w * 0.32, d * 0.3],
          [w * 0.32, -d * 0.3],
          [-w * 0.32, -d * 0.3],
        ].map(([x, z], i) => (
          <mesh key={i} geometry={damper} material={mats.rubber} position={[x, 0.02, z]} />
        ))}
      </group>

      {/* upper enclosure section */}
      <group ref={lid} position={[0, h / 2 - lidH / 2, 0]}>
        <RoundedBox args={[w, lidH, d]} radius={0.03} smoothness={4} material={m.shell} castShadow />
      </group>

      {/* seam — lights up during the module reveal */}
      <mesh ref={seam} geometry={seamGeo} material={m.accent} position={[0, h / 2 - lidH, 0]} />

      {/* lower enclosure with the white chevron name panel on the front */}
      <group ref={shell} position={[0, -h / 2 + shellH / 2, 0]}>
        <RoundedBox args={[w, shellH, d]} radius={0.04} smoothness={4} material={m.shell} castShadow receiveShadow />
        <mesh geometry={panel} material={m.label} position={[w * 0.02, lidH / 2 - 0.01, d / 2 + 0.002]} />
      </group>

      {/* aluminium side bracket with gold RF connectors (+X face) */}
      <group ref={sideBracket} position={[w / 2 + 0.012, 0, 0]}>
        <mesh geometry={sidePlate} material={m.sidePlate} castShadow />
        {[
          [h * 0.36, d * 0.38],
          [h * 0.36, -d * 0.38],
          [-h * 0.36, d * 0.38],
          [-h * 0.36, -d * 0.38],
        ].map(([y, z], i) => (
          <mesh key={i} geometry={screw} material={mats.titanium} position={[0.012, y, z]} rotation={[0, 0, Math.PI / 2]} />
        ))}
        <group ref={aPorts} position={[0.06, h * 0.28, 0.06]} />
        {[0.14, 0.04, -0.06].map((z) => (
          <SmaConnector key={z} position={[0.01, h * 0.28, z]} rotation={[0, 0, -Math.PI / 2]} />
        ))}
        <SmaConnector position={[0.01, -h * 0.1, -0.12]} rotation={[0, 0, -Math.PI / 2]} />
      </group>

      {/* rear interface ports */}
      <group ref={ports} position={[0, 0, -d / 2]}>
        {[-0.18, 0.0, 0.18].map((x) => (
          <mesh key={x} geometry={rearPort} material={m.shellEdge} position={[x, -h * 0.1, -0.015]} rotation={[Math.PI / 2, 0, 0]} />
        ))}
        <group ref={aConn} position={[0, -h * 0.1, -0.04]} />
      </group>

      {/* ── Conceptual internals (illustrative only) ───────────────────── */}
      <group ref={internals} visible={false}>
        <group ref={aEncl} position={[w / 2, h / 2 + 0.6, 0]} />

        {/* heat spreader + gasket */}
        <group ref={heat} position={[0, shellH / 2 - h / 2, 0]}>
          <mesh geometry={spreader} material={mats.aluminium} castShadow />
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} geometry={fin} material={mats.aluminium} position={[0, 0.03, -d * 0.32 + i * d * 0.128]} />
          ))}
          <mesh geometry={gasketGeo} material={m.gasket} position={[0, -0.025, 0]} />
        </group>

        {/* main circuit board with processing components */}
        <group ref={pcb} position={[0, shellH / 2 - h / 2 - 0.08, 0]}>
          <group ref={aPcb} position={[-w * 0.42, 0, d * 0.2]} />
          <mesh geometry={board} material={m.pcb} castShadow receiveShadow />
          <group position={[-0.06, 0.015, 0.01]}>
            <mesh geometry={chipBig} material={m.chip} castShadow />
            <mesh geometry={chipLid} material={m.chipLid} position={[0, 0.011, 0]} />
            <group ref={aChips} position={[0, 0.025, 0]} />
          </group>
          {[
            [0.14, 0.08],
            [0.14, -0.01],
            [0.14, -0.1],
            [-0.22, -0.1],
            [-0.22, 0.1],
          ].map(([x, z], i) => (
            <mesh key={i} geometry={chipSmall} material={m.chip} position={[x, 0.012, z]} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} geometry={cap} material={mats.aluminium} position={[-0.24 + (i % 5) * 0.04, 0.018, i < 5 ? 0.0 : -0.04]} />
          ))}
          <group position={[0, 0.02, -d * 0.34]}>
            <mesh geometry={header} material={m.chip} />
            {Array.from({ length: 12 }, (_, i) => (
              <mesh key={i} geometry={pin} material={m.gold} position={[-0.055 + i * 0.01, 0.016, 0]} />
            ))}
          </group>
        </group>

        {/* interface board */}
        <group ref={iface} position={[0, shellH / 2 - h / 2 - 0.14, -d * 0.2]}>
          <group ref={aIface} position={[w * 0.26, 0, 0]} />
          <mesh geometry={smallBoard} material={m.pcb} castShadow />
          <mesh geometry={header} material={m.chip} position={[0, 0.02, 0]} />
          {[-0.1, 0.1].map((x) => (
            <mesh key={x} geometry={chipSmall} material={m.chipLid} position={[x, 0.012, 0.01]} />
          ))}
        </group>
      </group>
    </group>
  );
}
