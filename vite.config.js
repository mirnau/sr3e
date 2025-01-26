import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      onwarn: (warning, handler) => {
        // Suppress specific accessibility warnings
        if (["a11y_missing_attribute"].includes(warning.code)) {
          return;
        }
        handler(warning);
      }
    })
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
