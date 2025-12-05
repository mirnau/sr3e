import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { i18nScaffold } from "./vite-plugins/i18n-scaffold";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname);

export default defineConfig({
  define: {
    DEBUG: JSON.stringify(true),
  },
  plugins: [
    svelte({
      compilerOptions: { runes: true },
    }),
    i18nScaffold({
      configDir: 'lang/config',
      langDir: 'lang',
      systemNamespace: 'sr3e'
    }),
  ],
  resolve: {
    alias: {
      "@root": projectRoot,
    },
  },
  publicDir: false,
  build: {
    sourcemap: true,
    minify: "esbuild",
    outDir: "build",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        bundle: path.resolve(projectRoot, "sr3e.ts"),
        "chummer-light": path.resolve(projectRoot, "styles/chummer-light.scss"),
        "chummer-dark": path.resolve(projectRoot, "styles/chummer-dark.scss"),
      },
      output: {
        format: "es",
        dir: "build",
        entryFileNames: "bundle/[name].js",
        chunkFileNames: "bundle/[name].js",
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? "";
          if (name.endsWith(".css")) {
            const parsed = path.parse(name);
            return `themes/${parsed.name}${parsed.ext}`;
          }
          const parsed = path.parse(name);
          return `bundle/assets/${parsed.name}${parsed.ext}`;
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
