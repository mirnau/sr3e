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

         "@root": projectRoot,
         "@applications": path.resolve(projectRoot, "module/foundry/applications"),
         "@masonry": path.resolve(projectRoot, "module/foundry/masonry"),
         "@models": path.resolve(projectRoot, "module/models"),
         "@sheets": path.resolve(projectRoot, "module/foundry/sheets"),
         "@services": path.resolve(projectRoot, "module/services"),
         "@rules": path.resolve(projectRoot, "module/services/procedure/rules"),
         "@families": path.resolve(projectRoot, "module/services/procedure/families"),
         "@common": path.resolve(projectRoot, "module/services/procedure/common"),
         "@game": path.resolve(projectRoot, "module/services/procedure/game"),
         "@registry": path.resolve(projectRoot, "module/services/procedure/registry"),
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
