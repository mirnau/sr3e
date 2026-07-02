const UNFOCUSED_CLASS = "sr3e-window-unfocused";

function getOpenWindows(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(".application"));
}

function focusWindow(target: HTMLElement): void {
    getOpenWindows().forEach(win => {
        win.classList.toggle(UNFOCUSED_CLASS, win !== target);
    });
}

// A single remaining window should never read as unfocused, even if it
// was the background window a moment before its sibling closed.
function reconcileSingleWindow(): void {
    const windows = getOpenWindows();
    if (windows.length <= 1) {
        windows.forEach(win => win.classList.remove(UNFOCUSED_CLASS));
    }
}

function handlePointerDown(event: PointerEvent): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>(".application");
    if (target) focusWindow(target);
}

function findApplicationIn(node: Node): HTMLElement | null {
    if (!(node instanceof HTMLElement)) return null;
    return node.matches(".application") ? node : node.querySelector<HTMLElement>(".application");
}

function handleWindowListChange(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
            const applicationEl = findApplicationIn(node);
            if (applicationEl) focusWindow(applicationEl);
        }
    }
    reconcileSingleWindow();
}

// ApplicationV2 windows are DOM siblings, not OS windows, so we track
// "focus" ourselves: last-clicked or newly-opened .application wins,
// every other open window gets desaturated via CSS.
export function registerWindowFocusDimHook(): void {
    document.addEventListener("pointerdown", handlePointerDown, true);
    new MutationObserver(handleWindowListChange).observe(document.body, {
        childList: true,
        subtree: true,
    });
}
