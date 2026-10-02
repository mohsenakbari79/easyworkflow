import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite config for the GitHub Pages demo app.
 *
 * Builds `examples/basic` with `base: '/easyworkflow/'` so assets resolve
 * correctly under https://<user>.github.io/easyworkflow/.
 * For a custom domain, change `base` to `'/'`.
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
