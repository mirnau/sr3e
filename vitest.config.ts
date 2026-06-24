import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

export default defineConfig({
    plugins: [svelteTesting(), svelte({ compilerOptions: { runes: true } })],
    test: {
        environment: "node",
        include: ["module/**/*.test.ts"],
        globals: false,
    },
});
