import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import type { MaterialLibrary } from '../materials/materials';
import type { Rig } from '../rig/rig';
import type { ExplodeSpec, PartId } from '../config/droneConfig';

export interface ExplodeEntry {
  object: THREE.Object3D;
  part: PartId;
  spec: ExplodeSpec;
  /** Unit radial direction for per-arm parts. */
  dir?: [number, number, number];
  base: THREE.Vector3;
}

export interface DroneCtx {
  mats: MaterialLibrary;
  rig: Rig;
  /** Geometry detail multiplier (0.45 – 1). */
  detail: number;
  /** Disable idle motion (prefers-reduced-motion). */
  still: boolean;
  register: (e: ExplodeEntry) => () => void;
  anchors: Map<string, THREE.Object3D>;
}

export const DroneContext = createContext<DroneCtx | null>(null);

export const useDrone = () => {
  const c = useContext(DroneContext);
  if (!c) throw new Error('useDrone must be used inside <DroneAssembly3D>');
  return c;
};

/** Scales a segment count by the quality tier. */
export const useSeg = () => {
  const { detail } = useDrone();
  return (n: number, min = 6) => Math.max(min, Math.round(n * detail));
};

/** Memoised geometry/objects with automatic GPU disposal. */
export function useDisposable<T extends { dispose: () => void }>(factory: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

/** Registers a named anchor (used by annotations to find parts). */
export function useAnchor(name: string) {
  const { anchors } = useDrone();
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    if (ref.current) anchors.set(name, ref.current);
    return () => {
      anchors.delete(name);
    };
  }, [anchors, name]);
  return ref;
}
