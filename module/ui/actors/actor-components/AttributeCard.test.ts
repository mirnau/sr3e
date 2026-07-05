// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import AttributeCard from "./AttributeCard.svelte";

function getProperty(obj: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], obj);
}

(globalThis as Record<string, unknown>).foundry = { utils: { getProperty } };
(globalThis as Record<string, unknown>).CONFIG = { SR3E: {} };

function actor() {
    return {
        uuid: "Actor.a1",
        id: "a1",
        documentName: "Actor",
        system: {
            attributes: { essence: { value: 6, mod: -2 } },
            creation: { attributePoints: 0 },
        },
        getFlag: vi.fn(),
        update: vi.fn().mockResolvedValue(undefined),
    };
}

describe("AttributeCard", () => {
    afterEach(cleanup);

    it("displays SimpleStat total, including ActiveEffect modifier", () => {
        render(AttributeCard, {
            props: {
                actor: actor() as never,
                attributeKey: "essence",
                label: "Essence",
            },
        });

        expect(screen.getByText("4.0")).toBeTruthy();
    });
});
