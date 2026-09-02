import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDirector } from '../SceneDirector';

/**
 * A slow drift of points behind everything else.
 *
 * All motion happens in the vertex shader - moving thousands of points from
 * JavaScript each frame would dominate the frame budget for what is only a
 * background texture.
 */
export function Particles({ count = 2000 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const { progress, velocity } = useDirector();

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distributed through a wide slab so parallax reads as depth.
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3;
      seeds[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uVelocity: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uProgress.value = progress.current;
    // Clamped so a violent flick cannot smear the field off screen.
    uniforms.uVelocity.value = THREE.MathUtils.clamp(velocity.current * 0.02, -1.5, 1.5);
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          attribute float aSeed;
          uniform float uTime;
          uniform float uProgress;
          uniform float uVelocity;
          varying float vAlpha;

          void main() {
            vec3 pos = position;

            // Gentle independent drift per point.
            pos.y += sin(uTime * 0.22 + aSeed * 6.28) * 0.42;
            pos.x += cos(uTime * 0.17 + aSeed * 6.28) * 0.32;

            // The field streams past as the page scrolls, and stretches
            // with scroll velocity.
            pos.y += uProgress * 9.0;
            pos.y += uVelocity * (0.4 + aSeed);
            // Wrap so the slab never empties out.
            pos.y = mod(pos.y + 8.0, 16.0) - 8.0;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (14.0 * (0.35 + aSeed * 0.65)) / -mv.z;

            // Distant points fade, and everything dims past the hero.
            vAlpha = smoothstep(-18.0, -2.0, mv.z) * (0.42 + aSeed * 0.4)
                   * (1.0 - smoothstep(0.0, 0.35, uProgress) * 0.55);
          }
        `}
        fragmentShader={/* glsl */ `
          varying float vAlpha;

          void main() {
            // Round, soft-edged point sprite.
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            if (d > 0.5) discard;
            float mask = smoothstep(0.5, 0.05, d);
            gl_FragColor = vec4(mix(vec3(0.43, 0.90, 0.98), vec3(0.65, 0.55, 0.98), vAlpha), mask * vAlpha);
          }
        `}
      />
    </points>
  );
}
