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
        // Rolldown takes a function here. GSAP is split out so it caches
        // independently of the app code, which changes far more often.
        manualChunks(id: string) {
          if (id.includes('node_modules/gsap')) return 'gsap';
          return undefined;
        },
      },
    },
  },
});
