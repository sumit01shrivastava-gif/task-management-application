import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PartId } from '../config/droneConfig';
import { useDrone, type ExplodeEntry } from './DroneContext';

const MAX = 64;

/**
 * Dashed build-axis lines from each part's assembled position to its current
 * exploded position — the visual cue that keeps the exploded view readable.
 */
export function AssemblyGuides({ entries, parts }: { entries: React.RefObject<ExplodeEntry[]>; parts: PartId[] }) {
  const { rig } = useDrone();
  const { line, geo, mat } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 2 * 3), 3));
    const mat = new THREE.LineDashedMaterial({ color: '#5aa0ff', dashSize: 0.05, gapSize: 0.04, transparent: true, opacity: 0, depthWrite: false });
    const line = new THREE.LineSegments(geo, mat);
    line.frustumCulled = false;
    return { line, geo, mat };
  }, []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );

  useFrame(() => {
    const o = rig.guides * (rig.explode > 0.02 ? 1 : 0);
    line.visible = o > 0.01;
    if (!line.visible) return;
    mat.opacity = o * 0.55;
    const arr = geo.attributes.position.array as Float32Array;
    let i = 0;
    for (const e of entries.current ?? []) {
      if (!parts.includes(e.part) || i >= MAX) continue;
      if (e.part === 'ironav' && rig.focus > 0.05) continue;
      arr.set([e.base.x, e.base.y, e.base.z, e.object.position.x, e.object.position.y, e.object.position.z], i * 6);
      i++;
    }
    geo.setDrawRange(0, i * 2);
    geo.attributes.position.needsUpdate = true;
    line.computeLineDistances();
  });

  return <primitive object={line} />;
}
