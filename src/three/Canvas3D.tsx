import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { SceneDirector } from './SceneDirector';
import { Crystal } from './scenes/Crystal';
import { Particles } from './scenes/Particles';
import { useDeviceTier } from '../hooks/useDeviceTier';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScroll } from '../hooks/useLenis';

/**
 * One persistent WebGL canvas behind the whole page.
 *
 * A canvas per section would mean several WebGL contexts competing; mobile
 * Safari reclaims them aggressively and the extras simply go black. One
 * context, one render loop, scenes driven by scroll progress.
 */
export function Canvas3D() {
  const { progress, velocity } = useScroll();
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const [lost, setLost] = useState(false);
  const [dpr, setDpr] = useState(tier.dpr[1]);
  const [faded, setFaded] = useState(false);

  useEffect(() => setDpr(tier.dpr[1]), [tier.dpr]);

  // Fade the canvas back once the hero is behind us. A boolean threshold
  // rather than a per-frame opacity keeps this off the render loop.
  useEffect(() => {
    const onScroll = () => setFaded(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reduced motion gets a static gradient rather than a live scene: honouring
  // the preference should not mean an empty black page.
  if (reduced || lost) {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 50% at 62% 28%, rgba(142,214,240,0.32), transparent 68%),' +
              'radial-gradient(60% 45% at 20% 72%, rgba(168,182,242,0.26), transparent 70%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
      style={{ opacity: faded ? 0.28 : 1 }}
    >
      <Canvas
        dpr={[tier.dpr[0], dpr]}
        gl={{ antialias: tier.tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 4.2], fov: 46 }}
        onCreated={({ gl }) => {
          // A dead black canvas is worse than no canvas: fall back to the
          // static gradient if the context is lost.
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setLost(true);
          });
        }}
      >
        {/* Capability probes lie; frame timing does not. Drop DPR when the
            measured rate sags, raise it again when there is headroom. */}
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(tier.dpr[0], d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(tier.dpr[1], d + 0.25))}
        />
        <AdaptiveDpr pixelated />

        <SceneDirector progress={progress} velocity={velocity}>
          {/* Bright ambient, as on an overcast snowfield: shadows on ice are
              filled by light bouncing off everything around them. */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[3, 5, 4]} intensity={2.2} color="#ffffff" />
          <pointLight position={[-4, -2, 2]} intensity={18} color="#8fa6f5" distance={14} />
          <pointLight position={[3, 2, -1]} intensity={14} color="#7fd4ef" distance={12} />

          <Suspense fallback={null}>
            <Particles count={tier.particles} />
            <Crystal count={tier.tier === 'low' ? 18 : 34} />
          </Suspense>
        </SceneDirector>
      </Canvas>
    </div>
  );
}
