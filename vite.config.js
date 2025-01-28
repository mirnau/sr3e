import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte()
  ],
  build: {
    sourcemap: true,
    minify: false,
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      input: 'sr3e.js',
      output: {
        format: 'es',
        dir: 'build',
        entryFileNames: 'bundle.js',
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});