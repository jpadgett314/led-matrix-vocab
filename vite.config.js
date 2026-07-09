import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: 'app',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
