import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/led-matrix-vocab/' : '/',
  root: 'app',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: 'inline',
  },
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        sourcemap: 'inline'
      }
    }
  },
  server: {
    sourcemapIgnoreList: false
  },
});
