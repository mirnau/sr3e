import Log from "@services/Log.js";

// Make globally available in Foundry runtime
window.DEBUG = true;
window.LOG = Log;

// Optional: shorthand global
globalThis.DEBUG = window.DEBUG;
globalThis.LOG = window.LOG;

DEBUG && LOG.info("Debug is bootstrapped and active!")