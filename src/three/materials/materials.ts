import * as THREE from 'three';
import { carbonTextures, glowTexture, labelTexture, pcbTexture } from './textures';
import type { QualityTier } from '../../hooks/useQualityTier';

/**
 * Shared material library. Created once per canvas, disposed on unmount.
 * `airframe` materials can be dimmed during the IroNav reveal; IroNav materials
 * are kept separate so the module stays at full presence.
 */
export function createMaterials(tier: QualityTier) {
  const physical = tier !== 'low';
  const carbon = carbonTextures(tier === 'low' ? 128 : 256);

  const carbonPlate = new (physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)({
    color: '#c4c8ce',
    map: carbon.map,
    roughnessMap: carbon.roughnessMap,
    roughness: 0.55,
    metalness: 0.15,
    ...(physical ? { clearcoat: 1, clearcoatRoughness: 0.12 } : {}),
  });
  carbonPlate.map!.repeat.set(3, 3);

  const tubeMap = carbon.map.clone();
  tubeMap.repeat.set(1, 8);
  const tubeRough = carbon.roughnessMap.clone();
  tubeRough.repeat.set(1, 8);
  const carbonTube = new (physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)({
    color: '#d4d8dd',
    map: tubeMap,
    roughnessMap: tubeRough,
    roughness: 0.5,
    metalness: 0.15,
    ...(physical ? { clearcoat: 1, clearcoatRoughness: 0.1 } : {}),
  });

  const lib = {
    carbonPlate,
    carbonTube,
    aluminium: new THREE.MeshStandardMaterial({ color: '#9aa1a9', metalness: 1, roughness: 0.3 }),
    titanium: new THREE.MeshStandardMaterial({ color: '#c3c8ce', metalness: 1, roughness: 0.22 }),
    anodisedDark: new THREE.MeshStandardMaterial({ color: '#2b2f35', metalness: 0.85, roughness: 0.38 }),
    anodisedBlue: new THREE.MeshStandardMaterial({ color: '#1d3f73', metalness: 0.85, roughness: 0.32 }),
    composite: new THREE.MeshStandardMaterial({ color: '#16181b', metalness: 0.05, roughness: 0.78 }),
    enclosure: new THREE.MeshStandardMaterial({ color: '#111317', metalness: 0.35, roughness: 0.5 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#0d0e10', metalness: 0, roughness: 0.85 }),
    copper: new THREE.MeshStandardMaterial({ color: '#8a5a32', metalness: 1, roughness: 0.4 }),
    batteryWrap: new THREE.MeshStandardMaterial({ color: '#1b1e22', metalness: 0.2, roughness: 0.6 }),
    strap: new THREE.MeshStandardMaterial({ color: '#232629', metalness: 0, roughness: 0.95 }),
    cable: new THREE.MeshStandardMaterial({ color: '#0f1012', metalness: 0.1, roughness: 0.62 }),
    cableAccent: new THREE.MeshStandardMaterial({ color: '#26303d', metalness: 0.2, roughness: 0.55 }),
    connector: new THREE.MeshStandardMaterial({ color: '#b8bdc3', metalness: 1, roughness: 0.28 }),
    propeller: new THREE.MeshStandardMaterial({ color: '#141518', metalness: 0.2, roughness: 0.42, side: THREE.DoubleSide }),
    ledGreen: new THREE.MeshStandardMaterial({ color: '#0b1a10', emissive: '#2bd46a', emissiveIntensity: 1.2 }),
    ledRed: new THREE.MeshStandardMaterial({ color: '#1a0b0b', emissive: '#ff3b30', emissiveIntensity: 1.2 }),
  };

  // IroNav module materials (never dimmed)
  const ironav = {
    shell: new (physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)({
      color: '#1b1e23',
      metalness: 0.7,
      roughness: 0.34,
      ...(physical ? { clearcoat: 0.4, clearcoatRoughness: 0.3 } : {}),
    }),
    shellEdge: new THREE.MeshStandardMaterial({ color: '#7d858e', metalness: 1, roughness: 0.26 }),
    bracket: new THREE.MeshStandardMaterial({ color: '#3a3f46', metalness: 0.9, roughness: 0.35 }),
    glass: new (physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)({
      color: '#05070a',
      metalness: 0.2,
      roughness: 0.05,
      ...(physical ? { clearcoat: 1, clearcoatRoughness: 0.02 } : {}),
    }),
    accent: new THREE.MeshStandardMaterial({ color: '#0a1530', emissive: '#3d8bff', emissiveIntensity: 0.6 }),
    label: new THREE.MeshBasicMaterial({ map: labelTexture('IroNav', 'infiniDome'), transparent: true, depthWrite: false }),
    pcb: new THREE.MeshStandardMaterial({ map: pcbTexture(tier === 'low' ? 256 : 512), metalness: 0.3, roughness: 0.55 }),
    chip: new THREE.MeshStandardMaterial({ color: '#0c0d0f', metalness: 0.2, roughness: 0.4 }),
    chipLid: new THREE.MeshStandardMaterial({ color: '#a7acb2', metalness: 1, roughness: 0.3 }),
    gold: new THREE.MeshStandardMaterial({ color: '#c9a35c', metalness: 1, roughness: 0.3 }),
    gasket: new THREE.MeshStandardMaterial({ color: '#0e1a2e', emissive: '#1d4fa8', emissiveIntensity: 0.25, roughness: 0.7 }),
    glow: new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }),
  };

  const airframe = Object.values(lib);
  const baseColors = new Map<THREE.Material, { color: THREE.Color; env: number }>();
  airframe.forEach((m) => baseColors.set(m, { color: (m as THREE.MeshStandardMaterial).color.clone(), env: 1 }));

  let lastDim = -1;
  /** 0 = full, 1 = dimmed. Only touches materials when the value changes. */
  const setDim = (d: number) => {
    const v = Math.round(d * 100) / 100;
    if (v === lastDim) return;
    lastDim = v;
    const k = 1 - v * 0.82;
    airframe.forEach((m) => {
      const s = m as THREE.MeshStandardMaterial;
      const base = baseColors.get(m)!;
      s.color.copy(base.color).multiplyScalar(k);
      s.envMapIntensity = base.env * (1 - v * 0.75);
    });
  };

  const dispose = () => {
    const textures = new Set<THREE.Texture>();
    [...airframe, ...Object.values(ironav)].forEach((m) => {
      Object.values(m).forEach((v) => v instanceof THREE.Texture && textures.add(v));
      m.dispose();
    });
    textures.forEach((t) => t.dispose());
  };

  return { ...lib, ironav, setDim, dispose };
}

export type MaterialLibrary = ReturnType<typeof createMaterials>;
