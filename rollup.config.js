import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'sr3e.js', // Entry point of your app
  output: {
    format: 'es', // Use ES modules (compatible with FoundryVTT)
    file: 'module/svelte/bundle.js', // Output JS file
    sourcemap: true, // Enable sourcemaps for debugging
  },
  plugins: [
    svelte(),
    resolve(),
    commonjs() // Convert CommonJS modules to ES modules
  ],
}