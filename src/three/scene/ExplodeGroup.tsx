import { useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { explodeConfig, type ExplodeSpec, type PartId } from '../config/droneConfig';
import { useDrone } from './DroneContext';

interface Props {
  part: PartId;
  /** Arm index for parts that travel radially along their arm. */
  radialDir?: [number, number, number];
  /** Override the part-level choreography for a sub-assembly. */
  spec?: Partial<ExplodeSpec>;
  position?: [number, number, number];
  name?: string;
  children: ReactNode;
}

/**
 * Wraps an independently animatable assembly. Its assembled transform is the
 * `position` prop; the rig applies the exploded offset every frame.
 */
export function ExplodeGroup({ part, radialDir, spec, position = [0, 0, 0], name, children }: Props) {
  const ref = useRef<THREE.Group>(null);
  const { register } = useDrone();
  const px = position[0];
  const py = position[1];
  const pz = position[2];
  const offset = spec?.offset;
  const radial = spec?.radial;
  const delay = spec?.delay;

  useEffect(() => {
    if (!ref.current) return;
    const baseSpec = explodeConfig[part];
    return register({
      object: ref.current,
      part,
      spec: {
        offset: offset ?? baseSpec.offset,
        radial: radial ?? baseSpec.radial,
        delay: delay ?? baseSpec.delay,
      },
      dir: radialDir,
      base: new THREE.Vector3(px, py, pz),
    });
  }, [register, part, radialDir, offset, radial, delay, px, py, pz]);

  return (
    <group ref={ref} position={position} name={name ?? part}>
      {children}
    </group>
  );
}
