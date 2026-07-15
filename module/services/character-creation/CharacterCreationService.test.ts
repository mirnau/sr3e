import { describe, expect, it, vi } from "vitest";
import { CharacterCreationService } from "./CharacterCreationService";

(globalThis as Record<string, unknown>).CONFIG = {
	SR3E: { SKILL: { sorcery: "sr3e.skill.sorcery", conjuring: "sr3e.skill.conjuring" } },
};

function existingSkillItem(name: string, linkedAttribute: string) {
	return {
		id: name,
		name,
		type: "skill",
		system: { skillType: "active", activeSkill: { linkedAttribute } },
	};
}

function setup(items: unknown[]): { createSpy: ReturnType<typeof vi.fn> } {
	const createSpy = vi.fn().mockResolvedValue(undefined);
	(globalThis as Record<string, unknown>).Item = { create: createSpy };
	(globalThis as Record<string, unknown>).game = {
		i18n: {
			localize: (key: string) =>
				key === "sr3e.skill.sorcery" ? "Sorcery" : key === "sr3e.skill.conjuring" ? "Conjuring" : key,
		},
		items,
	};
	return { createSpy };
}

function skillCreations(createSpy: ReturnType<typeof vi.fn>) {
	return createSpy.mock.calls.filter((call) => (call[0] as { type?: string }).type === "skill");
}

describe("CharacterCreationService.ensureDefaultItemsExist (Sorcery/Conjuring bootstrap)", () => {
	it("creates Sorcery and Conjuring when neither exists", async () => {
		const { createSpy } = setup([]);

		await CharacterCreationService.Instance().ensureDefaultItemsExist();

		const creations = skillCreations(createSpy);
		expect(creations).toHaveLength(2);
		expect(creations.some((call) => (call[0] as { name: string }).name === "Sorcery")).toBe(true);
		expect(creations.some((call) => (call[0] as { name: string }).name === "Conjuring")).toBe(true);
	});

	it("skips creation when both already exist", async () => {
		const { createSpy } = setup([existingSkillItem("Sorcery", "willpower"), existingSkillItem("Conjuring", "charisma")]);

		await CharacterCreationService.Instance().ensureDefaultItemsExist();

		expect(skillCreations(createSpy)).toHaveLength(0);
	});
});
