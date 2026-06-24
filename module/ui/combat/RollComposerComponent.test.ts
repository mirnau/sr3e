// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import RollComposerComponent from "./RollComposerComponent.svelte";

afterEach(cleanup);

describe("RollComposerComponent", () => {
    it("settles when no targets exist", async () => {
        render(RollComposerComponent);

        await tick();

        expect(document.querySelector(".roll-composer-overlay")).toBeNull();
    });
});
