import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true
      },
      onwarn(warning, handler) {
        if (warning.code === 'event_directive_deprecated') return;
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
