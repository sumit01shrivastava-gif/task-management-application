import * as THREE from 'three';
import { droneConfig } from '../config/droneConfig';
import { useDisposable, useDrone, useSeg } from '../scene/DroneContext';

/**
 * One side of the landing gear (mirrored on X): two arched carbon legs that
 * splay outward from the frame to a skid with heavy rubber end caps.
 */
export function LandingGearSide({ side }: { side: 1 | -1 }) {
  const { mats } = useDrone();
  const seg = useSeg();
  const lg = droneConfig.landingGear;
  const r = lg.tubeRadius;
  const yBot = -lg.height;
  const zLeg = 0.3;

  const legs = useDisposable(() => {
    const make = (z: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(lg.topX, -0.02, z * 0.9),
          new THREE.Vector3(lg.topX + 0.1, -0.25, z * 0.95),
          new THREE.Vector3(lg.footX - 0.06, yBot * 0.72, z),
          new THREE.Vector3(lg.footX, yBot + 0.07, z),
        ]),
        seg(32, 12),
        r,
        seg(12, 7),
      );
    const geos = [make(zLeg), make(-zLeg)];
    return { geos, dispose: () => geos.forEach((g) => g.dispose()) };
  }, [lg.topX, lg.footX, yBot, r]);

  const skid = useDisposable(() => {
    const g = new THREE.CylinderGeometry(r * 1.05, r * 1.05, lg.skidLength, seg(18, 8));
    g.rotateX(Math.PI / 2);
    return g;
  }, [lg.skidLength, r]);
  const cap = useDisposable(() => {
    const g = new THREE.CylinderGeometry(r * 1.7, r * 1.7, 0.17, seg(24, 10));
    g.rotateX(Math.PI / 2);
    return g;
  }, [r]);
  const tee = useDisposable(() => new THREE.BoxGeometry(r * 3.2, r * 3, r * 3.4), [r]);
  const mount = useDisposable(() => new THREE.BoxGeometry(0.12, 0.05, 0.7), []);

  return (
    <group scale={[side, 1, 1]}>
      <mesh geometry={mount} material={mats.composite} position={[lg.topX, -0.02, 0]} castShadow />
      {legs.geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mats.carbonTube} castShadow />
      ))}
      <group position={[lg.footX, yBot, 0]}>
        <mesh geometry={skid} material={mats.carbonTube} castShadow receiveShadow />
        <mesh geometry={cap} material={mats.rubber} position={[0, 0, lg.skidLength / 2]} castShadow />
        <mesh geometry={cap} material={mats.rubber} position={[0, 0, -lg.skidLength / 2]} castShadow />
        <mesh geometry={tee} material={mats.composite} position={[0, 0.03, zLeg]} />
        <mesh geometry={tee} material={mats.composite} position={[0, 0.03, -zLeg]} />
      </group>
    </group>
  );
}
