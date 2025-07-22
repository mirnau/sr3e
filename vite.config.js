import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import fs from "fs";

const projectRoot = path.resolve(__dirname);

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
         ...generateFolderAliases(),
         "@models": path.resolve(projectRoot, "module/models"),
         "@sheets": path.resolve(projectRoot, "module/foundry/sheets"),
         "@services": path.resolve(projectRoot, "module/services"),
         "@hooks": path.resolve(projectRoot, "module/foundry/hooks"),
         "@documents": path.resolve(projectRoot, "module/foundry/documents"),
         "@apps": path.resolve(projectRoot, "module/svelte/apps"),
         "@config": path.resolve(projectRoot, "module/foundry"),
         "@sveltecomponent": path.resolve(projectRoot, "module/svelte/apps/components"),
         "@sveltehelpers": path.resolve(projectRoot, "module/svelte/svelteHelpers"),
         "@injections": path.resolve(projectRoot, "module/svelte/apps/injections"),

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
