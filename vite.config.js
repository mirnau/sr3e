import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import fs from "fs";

const projectRoot = path.resolve(__dirname, "systems/sr3e");

// Dynamically map all folders under systems/sr3e to @/folder
const generateFolderAliases = () => {
   const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
   return Object.fromEntries(
      entries.filter((e) => e.isDirectory()).map((dir) => [`@/${dir.name}`, path.join(projectRoot, dir.name)])
   );
};

export default defineConfig({
   plugins: [
      svelte({
         compilerOptions: { runes: true },
         onwarn(warning, handler) {
            if (warning.code === "event_directive_deprecated") return;
            handler(warning);
         },
      }),
   ],

   resolve: {
      alias: {
         "@": path.resolve(__dirname), // root of your system
         "@models": path.resolve(__dirname, "module/models"),
         "@sheets": path.resolve(__dirname, "module/foundry/sheets"),
         "@services": path.resolve(__dirname, "module/services"),
         "@hooks": path.resolve(__dirname, "module/foundry/hooks"),
         "@documents": path.resolve(__dirname, "module/foundry/documents"),
         "@apps": path.resolve(__dirname, "module/svelte/apps"),
         "@config": path.resolve(__dirname, "module/foundry"),
         "@sveltecomponent": path.resolve(__dirname, "module/svelte/apps/components"),
      },
   },

   build: {
      sourcemap: true,
      minify: false,
      outDir: "build",
      emptyOutDir: true,
      rollupOptions: {
         input: "sr3e.js",
         output: {
            format: "es",
            dir: "build",
            entryFileNames: "bundle.js",
         },
      },
   },
   server: {
      port: 3000,
      open: false,
   },
});
