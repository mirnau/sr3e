import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["module/services/combat/**/*.test.ts", "module/ui/**/*.test.ts"],
        globals: false,
    },
});
