import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { compression } from 'vite-plugin-compression2';

// base differs per host: GitHub Pages serves under /Viktor_Nedev/, Vercel and dev at /.
// CI sets VITE_BASE; everything else falls back to '/'.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    compression({ algorithms: ['brotliCompress', 'gzip'] }),
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Rolldown takes a function here. Splitting the heavy 3D and
        // animation libraries keeps the initial chunk small.
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('@react-three')) return 'r3f';
          if (id.includes('node_modules/gsap')) return 'gsap';
          return undefined;
        },
      },
    },
  },
});
