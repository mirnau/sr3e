// Loader file to enable TypeScript support for gulpfile.ts
import { register } from "tsx/esm/api";

const unregister = register();

// Import and re-export the TypeScript gulpfile
export * from "./gulpfile.ts";
export { default } from "./gulpfile.ts";
