import { describe, it, expect, vi } from "vitest";
import {
    registerComposerForActor,
    unregisterComposerForActor,
    openComposer,
} from "./composerService.svelte";
import type { ProcedureSetup } from "./simpleSetups";

const setupStub = { kind: "firearm" } as unknown as ProcedureSetup;

describe("composer registry identity guard", () => {
    it("a superseded instance cannot clobber the live registration", () => {
        const instanceA = vi.fn();
        const instanceB = vi.fn();
        registerComposerForActor("actor-guard", instanceA);
        registerComposerForActor("actor-guard", instanceB);

        expect(unregisterComposerForActor("actor-guard", instanceA)).toBe(false);

        openComposer(setupStub, { id: "actor-guard" });
        expect(instanceB).toHaveBeenCalledWith(setupStub);
        expect(instanceA).not.toHaveBeenCalled();
    });

    it("the owning instance unregisters normally", () => {
        const openFn = vi.fn();
        registerComposerForActor("actor-owner", openFn);
        expect(unregisterComposerForActor("actor-owner", openFn)).toBe(true);
    });

    it("a setup deferred while unregistered is delivered on the next register", () => {
        openComposer(setupStub, { id: "actor-deferred" });

        const openFn = vi.fn();
        registerComposerForActor("actor-deferred", openFn);
        expect(openFn).toHaveBeenCalledWith(setupStub);
    });
});
