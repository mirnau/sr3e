import { attachLightEffect } from "@hooks/renderApplicationV2/attachLightEffect.js";
import { hooks } from "@services/commonConsts.js";

export function configureThemes() {
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
}export function setupMouseLightSourceEffect(includedThemes) {
   Hooks.on(hooks.renderApplicationV2, (app, html) => {
      const activeTheme = game.settings.get("sr3e", "theme");
      console.log("active theme", activeTheme);
      if (includedThemes.includes(activeTheme)) {
         attachLightEffect(html, activeTheme);
      }
   });
}

