import type { Config } from "@sveltejs/vite-plugin-svelte";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config: Config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
  },
};

export default config;
