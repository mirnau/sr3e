const ROLL_BUTTON_SELECTOR = ".token-initiative button.roll, .token-initiative button[data-action='rollInitiative']";
const ICON_CLASS = "sr3e-initiative-dice-icon";
const BUTTON_CLASS = "sr3e-initiative-dice-button";

// Foundry's combat tracker renders its "roll initiative" button with no <i>
// child at all — the d20 glyph comes from a mask-image/background-image set
// via --initiative-icon custom properties on the <button> itself. That mask
// doesn't render in this theme, leaving the button blank, so we inject a
// real fa-dice icon and mark the button so CSS can suppress the native mask.
function applyDiceIcon(root: HTMLElement): void {
    root.querySelectorAll<HTMLButtonElement>(ROLL_BUTTON_SELECTOR).forEach(button => {
        button.classList.add(BUTTON_CLASS);
        if (button.querySelector(`.${ICON_CLASS}`)) return;

        const icon = document.createElement("i");
        icon.className = `fa-solid fa-dice ${ICON_CLASS}`;
        button.appendChild(icon);
    });
}

export function registerInitiativePlaceholderIconHook(): void {
    Hooks.on("renderCombatTracker", (_app: unknown, html: unknown) => {
        const root = html instanceof HTMLElement ? html : (html as { get?: (i: number) => HTMLElement })?.get?.(0);
        if (root) applyDiceIcon(root);
    });
}
