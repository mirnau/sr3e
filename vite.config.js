import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    sourcemap: true, // Enable source maps (correct usage)
    minify: false, 
    outDir: 'build', // Output directory
    emptyOutDir: true, // Clean the output directory before each build
    rollupOptions: {
      input: 'sr3e.js', // Entry point for your system
      output: {
        format: 'es', // ES module format for Foundry
        dir: 'build', // Output directory
        entryFileNames: 'bundle.js', // Consolidate everything into bundle.js
      },
    },
  },
  server: {
    port: 3000, // Development server port
    open: false, // Prevent auto-opening the browser
  },
});
