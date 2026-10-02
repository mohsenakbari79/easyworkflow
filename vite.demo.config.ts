import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite config for the GitHub Pages demo app (used by `npm run build:demo`).
 *
 * Always builds with `base: '/easyworkflow/'` so assets resolve under
 * https://<user>.github.io/easyworkflow/.
 * Output: examples/basic/dist (matches .github/workflows/deploy-demo.yml).
 */
export default defineConfig({
  root: resolve(__dirname, 'examples/basic'),
  base: '/easyworkflow/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'examples/basic/dist'),
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]',
    },
  },
});
