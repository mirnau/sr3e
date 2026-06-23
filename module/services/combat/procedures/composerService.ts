import type { ProcedureSetup } from "./simpleSetups";

type OpenFn = (setup: ProcedureSetup, actor: unknown) => void;
let _open: OpenFn | null = null;

export function registerComposer(openFn: OpenFn): void {
    _open = openFn;
}

export function openComposer(setup: ProcedureSetup, actor: unknown): void {
    _open?.(setup, actor);
}
