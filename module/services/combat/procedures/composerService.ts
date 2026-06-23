import type { ProcedureSetup } from "./simpleSetups";

let _open: ((setup: ProcedureSetup) => void) | null = null;

export function registerComposer(openFn: (setup: ProcedureSetup) => void): void {
    _open = openFn;
}

export function openComposer(setup: ProcedureSetup): void {
    _open?.(setup);
}
