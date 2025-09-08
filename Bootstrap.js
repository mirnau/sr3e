import Log from "@services/Log.js";

// Make globally available in Foundry runtime
// DEBUG is a build-time constant from Vite (true in dev, false in prod)
window.DEBUG = DEBUG;
window.LOG = Log;

// Optional: shorthand global
globalThis.DEBUG = window.DEBUG;
globalThis.LOG = window.LOG;

DEBUG && LOG.info("Debug is bootstrapped and active!")
