import { attachLightEffect } from "@hooks/renderApplicationV2/attachLightEffect.js";
import { hooks } from "@services/commonConsts.js";

/**
 * Configure theme settings and register theme-related hooks.
 */
export function configureThemes(): void {
  game.settings.register("sr3e", "theme", {
    name: "Theme",
    hint: "Choose a UI theme.",
    scope: "world",
    config: true,
    type: String,
    choices: { defaultDark: "Chummer Dark", defaultLight: "Chummer Light" },
    default: "defaultDark",
  });

  Hooks.on("ready", () => {
    const theme = game.settings.get("sr3e", "theme");
    document.body.classList.remove("theme-chummer", "theme-steel");
    document.body.classList.add(`theme-${theme}`);
  });

  setupMouseLightSourceEffect(["defaultDark", "defaultLight"]);
}

/**
 * Set up mouse light source effect for specified themes.
 * @param includedThemes - Array of theme names to enable the effect for
 */
export function setupMouseLightSourceEffect(includedThemes: string[]): void {
  Hooks.on(hooks.renderApplicationV2, (app: foundry.applications.api.ApplicationV2, html: HTMLElement) => {
    const activeTheme = game.settings.get("sr3e", "theme") as string;
    DEBUG && LOG.inspect("active theme", [__FILE__, __LINE__], activeTheme);
    if (includedThemes.includes(activeTheme)) {
      attachLightEffect(html, activeTheme);
    }
  });
}
