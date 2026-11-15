import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { DroneAssembly3D } from './DroneAssembly3D';
import { RigCamera } from './scene/Stage';
import { createRig, type Rig } from './rig/rig';

const POSES: Record<string, Partial<Rig>> = {
  assembled: { camX: 5.3, camY: 2.05, camZ: 6.6, tgtY: 0.05, yaw: -0.35 },
  exploded: { camX: 7.2, camY: 3.9, camZ: 9.8, tgtY: 0.45, yaw: -0.35, explode: 1 },
  module: { camX: 1.55, camY: 0.95, camZ: 5.3, tgtY: 1.17, tgtZ: 2.0, yaw: 0, explode: 1, focus: 1, dim: 1, glow: 0.6 },
};

/** Transparent single-frame render used to produce still imagery. */
export default function RenderStudio({ pose }: { pose: string }) {
  const rig = useMemo(() => ({ ...createRig(), ...(POSES[pose] ?? POSES.assembled) }), [pose]);
  const modulePose = pose === 'module';
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'transparent' }}>
      <Canvas
        dpr={2}
        shadows="percentage"
        camera={{ fov: 30, position: [rig.camX, rig.camY, rig.camZ] }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3, outputColorSpace: THREE.SRGBColorSpace }}
        onCreated={({ gl, scene }) => {
          document.documentElement.style.background = 'transparent';
          document.body.style.background = 'transparent';
          scene.background = null;
          gl.setClearColor(0x000000, 0);
          setTimeout(() => document.body.setAttribute('data-ready', '1'), 1500);
        }}
      >
        <RigCamera rig={rig} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} color="#e8edf3" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#cfd6de" position={[-6, 2, 3]} rotation={[0, Math.PI / 2.4, 0]} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={1.1} color="#9fc2ff" position={[6, 1.5, -3]} rotation={[0, -Math.PI / 2.2, 0]} scale={[5, 2, 1]} />
          <Lightformer form="ring" intensity={0.8} color="#ffffff" position={[2, 3, 6]} scale={2.5} />
        </Environment>
        <ambientLight intensity={0.15} />
        <directionalLight position={[4, 7, 5]} intensity={2.3} />
        <directionalLight position={[-5, 2.5, -4]} intensity={1.4} color="#7fa8ff" />
        <DroneAssembly3D rig={rig} tier="high" detail={1} still={!modulePose} />
      </Canvas>
    </div>
  );
}
