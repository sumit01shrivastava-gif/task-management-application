import { useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { armDir, droneConfig, ironavFocus, levels, lowerExplode, type PartId } from './config/droneConfig';
import { createMaterials } from './materials/materials';
import { DroneContext, type DroneCtx, type ExplodeEntry } from './scene/DroneContext';
import { ExplodeGroup } from './scene/ExplodeGroup';
import { easeInOut, stagger, type Rig } from './rig/rig';
import type { QualityTier } from '../hooks/useQualityTier';
import { Frame } from './parts/Frame';
import { Arm, useArmGeometry } from './parts/Arm';
import { Motor, useMotorGeometry } from './parts/Motor';
import { Propeller, usePropGeometry } from './parts/Propeller';
import { LandingGearSide } from './parts/LandingGear';
import { Battery } from './parts/Battery';
import { UpperEquipment } from './parts/UpperEquipment';
import { Cables } from './parts/Cables';
import { IroNavModule } from './parts/IroNavModule';
import { AssemblyGuides } from './scene/AssemblyGuides';

interface Props {
  rig: Rig;
  tier: QualityTier;
  detail: number;
  still?: boolean;
  /** Extra scene content that needs the drone context (annotations). */
  children?: ReactNode;
  anchors?: Map<string, THREE.Object3D>;
}

const tmp = new THREE.Vector3();
const focusPos = new THREE.Vector3(...ironavFocus.position);
const focusQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ironavFocus.rotation));
const internalsQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ironavFocus.internalsRotation));
const qTmp = new THREE.Quaternion();
const identity = new THREE.Quaternion();

/**
 * The conceptual IroNav-integrated multirotor. Every major assembly is an
 * independent object registered with the explode rig.
 */
export function DroneAssembly3D({ rig, tier, detail, still = false, children, anchors: externalAnchors }: Props) {
  const mats = useMemo(() => createMaterials(tier), [tier]);
  useEffect(() => () => mats.dispose(), [mats]);

  const entries = useRef<ExplodeEntry[]>([]);
  const register = useCallback((e: ExplodeEntry) => {
    entries.current.push(e);
    return () => {
      entries.current = entries.current.filter((x) => x !== e);
    };
  }, []);
  const anchors = useMemo(() => externalAnchors ?? new Map<string, THREE.Object3D>(), [externalAnchors]);
  const ctx: DroneCtx = useMemo(() => ({ mats, rig, detail, still, register, anchors }), [mats, rig, detail, still, register, anchors]);

  return (
    <DroneContext.Provider value={ctx}>
      <DroneParts entries={entries} />
      {children}
    </DroneContext.Provider>
  );
}

function DroneParts({ entries }: { entries: React.RefObject<ExplodeEntry[]> }) {
  const { mats, rig, still } = useMemoCtx();

  const root = useRef<THREE.Group>(null);
  const airframe = useRef<THREE.Group>(null);
  const props = useRef<(THREE.Group | null)[]>([]);
  const glow = useRef<THREE.Sprite>(null);
  const ironavLight = useRef<THREE.PointLight>(null);

  const n = droneConfig.armCount;
  const dirs = useMemo(() => Array.from({ length: n }, (_, i) => armDir(i)), [n]);
  const armGeo = useArmGeometry();
  const motorGeo = useMotorGeometry();
  const propGeo = usePropGeometry();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const e = rig.explode;

    // Orientation + subtle hover
    if (root.current) {
      root.current.rotation.set(rig.pitch, rig.yaw, rig.roll);
      const hover = still ? 0 : Math.sin(t * 0.9) * 0.035 * (1 - e * 0.6);
      root.current.position.y = 0.15 + hover;
      if (!still) {
        root.current.rotation.z += Math.sin(t * 0.6) * 0.008;
        root.current.rotation.x += Math.cos(t * 0.5) * 0.006;
      }
    }

    // Exploded positions
    for (const entry of entries.current) {
      const { spec, dir, base, object, part } = entry;
      const k = stagger(e, spec.delay, 0.62);
      object.position.set(base.x + spec.offset[0] * k, base.y + spec.offset[1] * k, base.z + spec.offset[2] * k);
      if (dir && spec.radial) {
        object.position.x += dir[0] * spec.radial * k;
        object.position.z += dir[2] * spec.radial * k;
      }
      if (part === 'ironav') {
        // IroNav reveal: travel from exploded slot to the presentation point
        const f = easeInOut(rig.focus);
        if (f > 0) {
          tmp.copy(object.position).lerp(focusPos, f);
          object.position.copy(tmp);
        }
        // tilt the module towards the camera while its internals are shown
        qTmp.slerpQuaternions(focusQuat, internalsQuat, easeInOut(rig.internals));
        object.quaternion.slerpQuaternions(identity, qTmp, f);
        object.scale.setScalar(1 + (ironavFocus.scale - 1) * f);
      }
    }

    // Propeller idle spin (slows to a stop as the aircraft separates)
    const spin = still ? 0 : 0.55 * (1 - Math.min(1, e * 3));
    props.current.forEach((p, i) => {
      if (p) p.rotation.y += (i % 2 ? -1 : 1) * spin * dt;
    });

    mats.setDim(rig.dim);

    // IroNav illumination
    if (glow.current) {
      const mat = glow.current.material as THREE.SpriteMaterial;
      mat.opacity = rig.glow * 0.55;
      glow.current.visible = rig.glow > 0.01;
    }
    if (ironavLight.current) ironavLight.current.intensity = rig.glow * 3.2 * (1 - rig.internals * 0.7);
  });

  const ironavAt: [number, number, number] = [0, levels.ironavY, droneConfig.ironav.forward];

  return (
    <>
      <group ref={root}>
        <group ref={airframe}>
          <ExplodeGroup part="frame">
            <Frame />
          </ExplodeGroup>

          {dirs.map((d, i) => (
            <ExplodeGroup key={`arm${i}`} part="arms" radialDir={d} name={`arm-${i}`}>
              <Arm index={i} geo={armGeo} />
            </ExplodeGroup>
          ))}

          {dirs.map((d, i) => (
            <ExplodeGroup key={`motor${i}`} part="motors" radialDir={d} name={`motor-${i}`} position={[d[0] * droneConfig.armLength, levels.motorBaseY, d[2] * droneConfig.armLength]}>
              <MotorAnchor index={i}>
                <Motor geo={motorGeo} />
              </MotorAnchor>
            </ExplodeGroup>
          ))}

          {dirs.map((d, i) => (
            <ExplodeGroup key={`prop${i}`} part="propellers" radialDir={d} name={`prop-${i}`} position={[d[0] * droneConfig.armLength, levels.propY, d[2] * droneConfig.armLength]}>
              <Propeller geo={propGeo} mirror={i % 2 === 1} ref={(el) => void (props.current[i] = el)} />
            </ExplodeGroup>
          ))}

          {/* lower (inverted) coaxial motors and propellers */}
          {droneConfig.coaxial &&
            dirs.map((d, i) => (
              <ExplodeGroup key={`lmotor${i}`} part="motors" radialDir={d} spec={lowerExplode.motors} name={`lower-motor-${i}`} position={[d[0] * droneConfig.armLength, levels.lowerMotorBaseY, d[2] * droneConfig.armLength]}>
                <group rotation={[Math.PI, 0, 0]}>
                  <Motor geo={motorGeo} />
                </group>
              </ExplodeGroup>
            ))}
          {droneConfig.coaxial &&
            dirs.map((d, i) => (
              <ExplodeGroup key={`lprop${i}`} part="propellers" radialDir={d} spec={lowerExplode.propellers} name={`lower-prop-${i}`} position={[d[0] * droneConfig.armLength, levels.lowerPropY, d[2] * droneConfig.armLength]}>
                <group rotation={[Math.PI, 0, 0]}>
                  <Propeller geo={propGeo} mirror={i % 2 === 0} ref={(el) => void (props.current[n + i] = el)} />
                </group>
              </ExplodeGroup>
            ))}

          {([1, -1] as const).map((s) => (
            <ExplodeGroup key={`lg${s}`} part="landingGear" name={`landing-gear-${s}`} spec={{ offset: [s * 0.5, -0.9, 0] }}>
              <LandingGearSide side={s} />
            </ExplodeGroup>
          ))}

          <ExplodeGroup part="battery" position={[droneConfig.battery.offsetX, levels.batteryY, 0.04]}>
            <Battery />
          </ExplodeGroup>

          <ExplodeGroup part="upperEquipment" position={[0, levels.deckY, 0]}>
            <UpperEquipment />
          </ExplodeGroup>

          <Cables />

          <ExplodeGroup part="ironav" position={ironavAt}>
            <IroNavModule />
            <pointLight ref={ironavLight} color="#4d94ff" intensity={0} distance={2.4} decay={2} position={[0, 0.25, 0.45]} />
            <sprite ref={glow} material={mats.ironav.glow} scale={[1.1, 0.8, 1]} position={[0, 0, -0.12]} visible={false} />
          </ExplodeGroup>
        </group>
        <AssemblyGuides entries={entries} parts={GUIDED_PARTS} />
      </group>
    </>
  );
}

const GUIDED_PARTS: PartId[] = ['propellers', 'motors', 'arms', 'upperEquipment', 'battery', 'landingGear', 'ironav'];

function MotorAnchor({ index, children }: { index: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { anchors } = useMemoCtx();
  useEffect(() => {
    if (index === 0 && ref.current) anchors.set('motor', ref.current);
    return () => {
      if (index === 0) anchors.delete('motor');
    };
  }, [anchors, index]);
  return <group ref={ref}>{children}</group>;
}

function useMemoCtx() {
  return useContext(DroneContext)!;
}
