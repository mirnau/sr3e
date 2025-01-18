import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-only';

export default {
  input: 'sr3e.js',
  output: {
    format: 'es',
    file: 'module/svelte/bundle.js',
  },
  plugins: [
    svelte(),
    resolve(),
    commonjs(),
  ],
};
