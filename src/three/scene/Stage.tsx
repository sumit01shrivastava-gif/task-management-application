import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import type { Rig } from '../rig/rig';

/**
 * Studio environment: local Lightformer HDRI (no network fetch), key/rim/fill
 * lights, an engineering grid floor and contact shadows.
 */
export function Stage({ shadows, rig }: { shadows: boolean; rig?: Rig }) {
  return (
    <>
      <color attach="background" args={['#050607']} />
      <fog attach="fog" args={['#050607', 9, 26]} />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#e8edf3" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#cfd6de" position={[-6, 2, 3]} rotation={[0, Math.PI / 2.4, 0]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#9fc2ff" position={[6, 1.5, -3]} rotation={[0, -Math.PI / 2.2, 0]} scale={[5, 2, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#ffffff" position={[2, 3, 6]} scale={2.5} />
        <Lightformer form="rect" intensity={0.15} color="#3d8bff" position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[8, 8, 1]} />
      </Environment>

      <ambientLight intensity={0.2} />
      <directionalLight
        position={[4, 7, 5]}
        intensity={3.1}
        color="#f4f6f8"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-5, 2.5, -4]} intensity={1.1} color="#9db9e6" />
      <directionalLight position={[-3, 1.5, 5]} intensity={0.7} color="#e9edf2" />
      <spotLight position={[0, 6, -6]} angle={0.5} penumbra={1} intensity={30} color="#bcd4ff" distance={20} />

      <GridFloor rig={rig} />
      <ContactShadows position={[0, -0.84, 0]} scale={9} blur={2.6} far={3.5} opacity={0.65} resolution={shadows ? 512 : 256} frames={shadows ? Infinity : 1} />
    </>
  );
}

/** Infinite-look technical grid that fades into the fog. */
function GridFloor({ rig }: { rig?: Rig }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uOpacity: { value: 1 }, uColor: { value: new THREE.Color('#5d7fae') } },
        vertexShader: /* glsl */ `
          varying vec3 vPos;
          void main(){ vPos = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vPos,1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform float uOpacity; uniform vec3 uColor; varying vec3 vPos;
          float grid(vec2 p, float s){ vec2 g = abs(fract(p / s - 0.5) - 0.5) / fwidth(p / s); return 1.0 - min(min(g.x, g.y), 1.0); }
          void main(){
            float d = length(vPos.xz);
            float fine = grid(vPos.xz, 0.25) * 0.18;
            float major = grid(vPos.xz, 1.0) * 0.45;
            float axis = (1.0 - min(abs(vPos.x) / fwidth(vPos.x), 1.0)) + (1.0 - min(abs(vPos.z) / fwidth(vPos.z), 1.0));
            float a = max(max(fine, major), axis * 0.6) * smoothstep(9.0, 1.5, d) * uOpacity;
            gl_FragColor = vec4(uColor, a * 0.55);
          }
        `,
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  const geo = useMemo(() => new THREE.PlaneGeometry(24, 24).rotateX(-Math.PI / 2), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(() => {
    // fade the floor during the close-up module reveal
    if (rig) mat.uniforms.uOpacity.value = 1 - rig.focus * 0.6;
  });
  return <mesh geometry={geo} material={mat} position={[0, -0.86, 0]} renderOrder={-1} />;
}

/** Drives the camera from rig channels and applies a responsive view offset. */
export function RigCamera({ rig, offsetX = 0, offsetY = 0 }: { rig: Rig; offsetX?: number; offsetY?: number }) {
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (offsetX || offsetY) cam.setViewOffset(size.width, size.height, offsetX * size.width, offsetY * size.height, size.width, size.height);
    else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }, [camera, size, offsetX, offsetY]);
  useFrame(() => {
    camera.position.set(rig.camX, rig.camY, rig.camZ);
    target.set(rig.tgtX, rig.tgtY, rig.tgtZ);
    camera.lookAt(target);
  });
  return null;
}
