import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { DroneAssembly3D } from './DroneAssembly3D';
import { ComponentAnnotations } from './scene/ComponentAnnotations';
import { RigCamera, Stage } from './scene/Stage';
import type { Rig } from './rig/rig';
import { tierSettings, type QualityTier } from '../hooks/useQualityTier';

interface Props {
  rig: Rig;
  tier: QualityTier;
  /** Render loop runs only while the section is on screen. */
  active: boolean;
  still?: boolean;
  annotations?: boolean;
  /** Horizontal / vertical framing offset as a fraction of the viewport. */
  offsetX?: number;
  offsetY?: number;
  fov?: number;
  /** DOM label elements for annotations (indexed like ANNOTATIONS). */
  labels?: React.RefObject<(HTMLElement | null)[]>;
}

/**
 * The 3D canvas used by both the hero and the scroll experience. Lazy-loaded
 * so three.js never blocks first paint.
 */
export default function ExperienceCanvas({ rig, tier, active, still, annotations = true, offsetX, offsetY, fov = 32, labels }: Props) {
  const settings = tierSettings[tier];
  const anchors = useMemo(() => new Map<string, THREE.Object3D>(), []);
  return (
    <Canvas
      className="r3f-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={settings.dpr}
      shadows={settings.shadows ? 'percentage' : false}
      camera={{ position: [rig.camX, rig.camY, rig.camZ], fov, near: 0.1, far: 60 }}
      gl={{
        antialias: tier !== 'low',
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.32,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <RigCamera rig={rig} offsetX={offsetX} offsetY={offsetY} />
        <Stage shadows={settings.shadows} rig={rig} />
        <DroneAssembly3D rig={rig} tier={tier} detail={settings.segments} still={still} anchors={anchors}>
          {annotations && labels && settings.annotations && <ComponentAnnotations rig={rig} anchors={anchors} labels={labels} compact={tier === 'low'} />}
        </DroneAssembly3D>
      </Suspense>
    </Canvas>
  );
}
