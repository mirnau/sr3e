// Blocks re-clicking a roll's dice while a reroll/buy request is in flight,
// so a slow round trip doesn't tempt (and cost) a second click. Clears itself
// on completion; a successful action re-renders the message anyway, making
// this element stale, but clearing is harmless on a detached node.
export function withDiePending(group: HTMLElement | null, task: () => Promise<void>): void {
    if (!group || group.dataset.sr3ePending) return;

    group.dataset.sr3ePending = "true";
    const dice = group.querySelectorAll<HTMLElement>(".sr3e-die");
    dice.forEach(d => d.classList.add("sr3e-die-pending"));

    void task().finally(() => {
        delete group.dataset.sr3ePending;
        dice.forEach(d => d.classList.remove("sr3e-die-pending"));
    });
}
