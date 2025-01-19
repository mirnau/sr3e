/**
 * Mounts a Svelte app to the DOM.
 * @param {Object} App - The Svelte app to mount.
 * @param {HTMLElement} target - The DOM element to mount the app into.
 * @param {Object} props - Properties to pass to the Svelte app.
 * @returns {Object} - The mounted Svelte app instance.
 */
export function mountSvelteApp(App, target, props = {}) {
    return new App({
      target,
      props,
    });
  }
  
  /**
   * Unmounts a Svelte app.
   * @param {Object} app - The Svelte app instance to destroy.s
   */
  export function unmountSvelteApp(app) {
    if (app && app.$destroy) {
      app.$destroy();
    }
  }