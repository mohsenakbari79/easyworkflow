import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/** Vite config for the Playwright E2E harness app. */
export default defineConfig({
  root: resolve(__dirname, 'harness'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]',
    },
  },
});
