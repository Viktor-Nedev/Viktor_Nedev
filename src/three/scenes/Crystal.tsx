import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { damp3 } from 'maath/easing';
import * as THREE from 'three';
import { useDirector, remap } from '../SceneDirector';

/**
 * The hero object: a faceted shard cluster that rotates slowly, drifts with
 * the pointer, and breaks apart as the page scrolls away from the hero.
 *
 * Built from instanced tetrahedra rather than a single mesh so the "shatter"
 * is real geometry moving, not a texture trick - and it still costs one draw
 * call.
 */
export function Crystal({ count = 34 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const { progress, pointer } = useDirector();

  // Fixed random layout, generated once. Each shard keeps its own axis and
  // speed so the cluster never looks like a single rigid object.
  const shards = useMemo(() => {
    const rng = mulberry32(0x5eed);
    return Array.from({ length: count }, () => {
      const dir = new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize();
      return {
        dir,
        radius: 0.8 + rng() * 0.9,
        scale: 0.055 + rng() * 0.11,
        spin: (rng() - 0.5) * 0.9,
        axis: new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize(),
        phase: rng() * Math.PI * 2,
      };
    });
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const initialised = useRef(false);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;

    // The hero occupies roughly the first eighth of the page; the cluster
    // expands and fades as the visitor scrolls past it.
    const burst = remap(p, 0, 0.1);

    if (group.current) {
      group.current.rotation.y = t * 0.12;
      group.current.rotation.x = Math.sin(t * 0.18) * 0.12;

      // Pointer parallax, damped and clamped so it never feels loose.
      target.set(1.55 + pointer.current.x * 0.22, 0.15 + pointer.current.y * 0.16, -1.2);
      damp3(group.current.position, target, 0.55, delta);
    }

    if (!mesh.current) return;

    // Colour is static, so it is written once rather than every frame.
    if (!initialised.current) {
      const rng = mulberry32(0xc0ffee);
      const a = new THREE.Color('#6EE7F9');
      const b = new THREE.Color('#A78BFA');
      const c = new THREE.Color();
      shards.forEach((_, i) => {
        mesh.current!.setColorAt(i, c.copy(a).lerp(b, rng()));
      });
      if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
      initialised.current = true;
    }

    shards.forEach((shard, i) => {
      const spread = shard.radius * (1 + burst * 3.4);
      const wobble = Math.sin(t * 0.7 + shard.phase) * 0.05;

      dummy.position.copy(shard.dir).multiplyScalar(spread + wobble);
      dummy.quaternion.setFromAxisAngle(shard.axis, t * shard.spin + shard.phase);
      dummy.scale.setScalar(shard.scale * (1 - burst * 0.55));
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} position={[1.55, 0.15, -1.2]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <tetrahedronGeometry args={[1, 0]} />
        {/* Flat shading keeps the facets crisp; the emissive rim is what
            reads as "glass" without paying for real transmission. */}
        <meshStandardMaterial
          emissive="#0A1420"
          emissiveIntensity={0.6}
          metalness={0.55}
          roughness={0.3}
          transparent
          opacity={0.68}
          flatShading
        />
      </instancedMesh>

      {/* A wireframe core gives the cluster a centre of gravity without
          painting a solid silhouette over the background. */}
      <mesh scale={0.62}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#6EE7F9" wireframe transparent opacity={0.13} />
      </mesh>
    </group>
  );
}

/** Small deterministic PRNG so the layout is identical on every load. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
