import Log from "./module/services/Log.js";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname);

const generateFolderAliases = () => {
   const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
   return Object.fromEntries(
      entries.filter((e) => e.isDirectory()).map((dir) => [`@/${dir.name}`, path.join(projectRoot, dir.name)])
   );
};

function sr3eInjectLocation() {
   return {
      name: "sr3e-inject-location",
      enforce: "pre",
      transform(code, id) {
         // ignore deps/virtual/query modules
         if (id.includes("node_modules")) return null;
         if (id.startsWith("\0")) return null;
         if (id.includes("?")) return null;

         if (!/(\.svelte|\.js|\.ts)$/.test(id)) return null;
         if (!code.includes("__FILE__") && !code.includes("__LINE__") && !code.includes("__DIR__")) return null;

         const relFile = path.relative(process.cwd(), id).split(path.sep).join("/");
         const dir = path.dirname(relFile).split(path.sep).join("/");

         let out = "";
         let last = 0;

         const replaceAll = (pattern, replacer) => {
            pattern.lastIndex = 0;
            for (;;) {
               const m = pattern.exec(code);
               if (!m) break;
               out += code.slice(last, m.index);
               out += replacer(m, m.index);
               last = m.index + m[0].length;
            }
            code = out + code.slice(last);
            out = "";
            last = 0;
         };

         // __FILE__ // Test
         replaceAll(/__FILE__/g, () => JSON.stringify(relFile));

         // __DIR__
         replaceAll(/__DIR__/g, () => JSON.stringify(dir));

         // __LINE__
         replaceAll(/__LINE__/g, (_, idx) => {
            const segment = code.slice(0, idx);
            const line = 1 + (segment.match(/\n/g)?.length ?? 0);
            return String(line);
         });

         return { code, map: null };
      },
   };
}

export default defineConfig({
   define: {
      DEBUG: JSON.stringify(true),
   },
   plugins: [
      sr3eInjectLocation(),
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
      sourcemap: true, // keep this for readable file/line in dev/staging
      minify: "esbuild", // set to 'esbuild' (or 'terser') when you want minified output
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
