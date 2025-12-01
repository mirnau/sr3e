import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  ],
  resolve: {
    alias: {
      "@root": projectRoot,
    },
  },
  build: {
    sourcemap: true,
    minify: "esbuild",
    outDir: "build",
    emptyOutDir: true,
    watch: {
      include: [
        "styles/**",
        "module/**",
        "lang/**",
        "*.ts",
        "*.js",
        "*.json",
        "*.svelte",
      ],
    },
    rollupOptions: {
      input: {
        app: path.resolve(projectRoot, "sr3e.ts"),
        "chummer-light": path.resolve(projectRoot, "styles/chummer-light.scss"),
        "chummer-dark": path.resolve(projectRoot, "styles/chummer-dark.scss"),
      },
      output: {
        format: "es",
        dir: "build",
        entryFileNames: "bundle/[name].js",
        chunkFileNames: "bundle/[name].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name && assetInfo.name.endsWith(".css")
            ? "themes/[name]"
            : "bundle/assets/[name]",
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
