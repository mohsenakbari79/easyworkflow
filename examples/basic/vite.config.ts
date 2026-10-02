import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Absolute path to the library source (examples/basic/../../src). */
const librarySrc = new URL('../../src', import.meta.url).pathname;

/**
 * Local demo Vite config.
 *
 * - `npm run dev`     → base `'/'` → http://localhost:5173/
 * - `npm run build`   → base `'/easyworkflow/'`
 * - `npm run preview` → base `'/easyworkflow/'` (must match build asset URLs)
 *
 * `vite preview` reports `command === 'serve'`, so use `isPreview`
 * to keep the GitHub Pages base path for preview.
 */
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/easyworkflow/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': librarySrc,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]',
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
}));
