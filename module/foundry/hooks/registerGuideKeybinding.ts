import { GuideDialogApp } from "../applications/GuideDialogApp";

const MODULE_ID = "sr3e";

/**
 * Registers the F1 keybinding that toggles the player guide. Must run during
 * the "init" hook — Foundry only accepts keybinding registrations at that point.
 */
export function registerGuideKeybinding(): void {
    (game.keybindings as any).register(MODULE_ID, "toggleGuide", {
        name: "Toggle Guide",
        hint: "Opens or closes the SR3E player guide.",
        editable: [{ key: "F1" }],
        onDown: () => {
            GuideDialogApp.toggle();
            return true;
        },
        restricted: false,
    });
}
