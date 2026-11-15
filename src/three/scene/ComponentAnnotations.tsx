import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Rig } from '../rig/rig';

import { ANNOTATIONS } from './annotationSpecs';

/**
 * Leader lines are drawn in 3D; the label cards are plain DOM elements (owned
 * by the page layout) that this component positions each frame by projecting
 * the label point to screen space.
 */
export function ComponentAnnotations({
  rig,
  anchors,
  labels,
  compact,
}: {
  rig: Rig;
  anchors: Map<string, THREE.Object3D>;
  /** DOM label elements, indexed like ANNOTATIONS. */
  labels: React.RefObject<(HTMLElement | null)[]>;
  compact?: boolean;
}) {
  const { camera, size } = useThree();
  const items = useMemo(
    () =>
      ANNOTATIONS.map((spec) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#7fb2ff', transparent: true, opacity: 0, depthTest: false }));
        line.renderOrder = 10;
        line.frustumCulled = false;
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), new THREE.MeshBasicMaterial({ color: '#8fc0ff', transparent: true, opacity: 0, depthTest: false }));
        dot.renderOrder = 11;
        return { spec, line, dot, geo, a: new THREE.Vector3(), b: new THREE.Vector3(), e: new THREE.Vector3(), p: new THREE.Vector3() };
      }),
    [],
  );
  useEffect(
    () => () =>
      items.forEach(({ geo, line, dot }) => {
        geo.dispose();
        (line.material as THREE.Material).dispose();
        dot.geometry.dispose();
        (dot.material as THREE.Material).dispose();
      }),
    [items],
  );

  useFrame(() => {
    items.forEach((it, i) => {
      const { spec, line, dot, geo, a, b, e, p } = it;
      const el = labels.current?.[i];
      const o = compact && spec.desktopOnly ? 0 : rig[spec.channel];
      const anchor = anchors.get(spec.anchor);
      const visible = o > 0.01 && !!anchor;
      line.visible = dot.visible = visible;
      if (el) {
        el.style.opacity = String(visible ? o : 0);
        el.style.visibility = visible ? 'visible' : 'hidden';
      }
      if (!visible || !anchor) return;
      anchor.getWorldPosition(a);
      b.set(a.x + spec.offset[0], a.y + spec.offset[1], a.z + spec.offset[2]);
      e.set(a.x + spec.offset[0] * 0.55, b.y, a.z + spec.offset[2] * 0.55);
      (geo.attributes.position.array as Float32Array).set([a.x, a.y, a.z, e.x, e.y, e.z, b.x, b.y, b.z]);
      geo.attributes.position.needsUpdate = true;
      (line.material as THREE.LineBasicMaterial).opacity = o * 0.8;
      (dot.material as THREE.MeshBasicMaterial).opacity = o;
      dot.position.copy(a);
      if (el) {
        p.copy(b).project(camera);
        let x = (p.x * 0.5 + 0.5) * size.width;
        // keep the card inside the viewport
        const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
        if ((spec.align ?? 'right') === 'right') x = Math.min(x, size.width - w - 16);
        else x = Math.max(x, w + 16);
        const y = (-p.y * 0.5 + 0.5) * size.height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    });
  });

  return (
    <>
      {items.map((it, i) => (
        <group key={i}>
          <primitive object={it.line} />
          <primitive object={it.dot} />
        </group>
      ))}
    </>
  );
}
