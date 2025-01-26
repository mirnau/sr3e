import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    sourcemap: true, // Generate source maps for debugging
    outDir: 'build', // Output directory for build files
    emptyOutDir: true, // Clean the output directory before each build
    rollupOptions: {
      input: 'sr3e.js', // Set your entry module
      output: {
        entryFileNames: 'bundle.js',   // Static filename for the main JS file
        chunkFileNames: '[name].js', // Optional: Static filenames for chunks
        assetFileNames: '[name].[ext]', // Static filenames for assets (e.g., CSS, images)
      },
    },
  },
  server: {
    port: 3000, // Dev server port
    open: false, // Don’t auto-open the browser
  },
});
