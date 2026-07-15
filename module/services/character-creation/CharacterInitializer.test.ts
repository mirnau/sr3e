import { describe, expect, it, vi } from "vitest";
import { CharacterInitializer, type CharacterCreationSelections } from "./CharacterInitializer";

(globalThis as Record<string, unknown>).CONFIG = { SR3E: { TRANSACTION: { startingcreditstick: "sr3e.transaction.startingcreditstick" } } };

function skillTemplate(id: string, category: "active" | "knowledge" | "language", linkedAttribute: string) {
	const categoryField = `${category}Skill`;
	return {
		id,
		toObject: () => ({
			name: id,
			type: "skill",
			system: { skillType: category, [categoryField]: { value: 0, linkedAttribute, specializations: [] } },
		}),
		system: { [categoryField]: { linkedAttribute } },
	};
}

const worldItems: Record<string, unknown> = {
	"skill-pistols": skillTemplate("skill-pistols", "active", "quickness"),
	"skill-streetwise": skillTemplate("skill-streetwise", "knowledge", "intelligence"),
	"skill-english": skillTemplate("skill-english", "language", "intelligence"),
};

(globalThis as Record<string, unknown>).game = {
	i18n: { localize: (key: string) => key },
	items: { get: (id: string) => worldItems[id] ?? { toObject: () => ({ name: "Human" }) } },
};

function actor() {
	return {
		update: vi.fn().mockResolvedValue(undefined),
		createEmbeddedDocuments: vi.fn().mockResolvedValue(undefined),
		setFlag: vi.fn().mockResolvedValue(undefined),
	};
}

function baseSelections(): CharacterCreationSelections {
	return {
		metatypeId: "metatype1",
		magicId: "magic1",
		attributePriority: "C",
		skillPriority: "C",
		resourcePriority: "E",
		age: 25,
		height: 175,
		weight: 75,
	};
}

describe("CharacterInitializer.initializeCharacter", () => {
	it("initializes all attributes to 1 and the pool to points-6 when no attributes were generated", async () => {
		const testActor = actor();

		await CharacterInitializer.Instance().initializeCharacter(testActor as never, baseSelections());

		const updateData = testActor.update.mock.calls[0]![0] as Record<string, unknown>;
		expect(updateData["system.attributes.strength.value"]).toBe(1);
		expect(updateData["system.attributes.quickness.value"]).toBe(1);
		expect(updateData["system.attributes.body.value"]).toBe(1);
		expect(updateData["system.attributes.charisma.value"]).toBe(1);
		expect(updateData["system.attributes.intelligence.value"]).toBe(1);
		expect(updateData["system.attributes.willpower.value"]).toBe(1);
		expect(updateData["system.creation.attributePoints"]).toBe(24 - 6);
		expect(updateData["system.creation.knowledgePoints"]).toBeUndefined();
		expect(updateData["system.creation.languagePoints"]).toBeUndefined();
		expect(testActor.setFlag).toHaveBeenCalledWith("sr3e", "attributeAssignmentLocked", false);
	});

	it("initializes attributes to the generated roll and zeroes the pool when attributes were generated", async () => {
		const testActor = actor();
		const selections = {
			...baseSelections(),
			generatedAttributes: {
				strength: 3,
				quickness: 4,
				body: 2,
				charisma: 5,
				intelligence: 6,
				willpower: 4,
			},
		};

		await CharacterInitializer.Instance().initializeCharacter(testActor as never, selections);

		const updateData = testActor.update.mock.calls[0]![0] as Record<string, unknown>;
		expect(updateData["system.attributes.strength.value"]).toBe(3);
		expect(updateData["system.attributes.quickness.value"]).toBe(4);
		expect(updateData["system.attributes.body.value"]).toBe(2);
		expect(updateData["system.attributes.charisma.value"]).toBe(5);
		expect(updateData["system.attributes.intelligence.value"]).toBe(6);
		expect(updateData["system.attributes.willpower.value"]).toBe(4);
		expect(updateData["system.creation.attributePoints"]).toBe(0);
		expect(updateData["system.creation.knowledgePoints"]).toBe(6 * 5);
		expect(updateData["system.creation.languagePoints"]).toBe(Math.floor(6 * 1.5));
		expect(testActor.setFlag).toHaveBeenCalledWith("sr3e", "attributeAssignmentLocked", true);
	});

	it("embeds ticked skills at their rolled ratings and sets pools to the real remainder", async () => {
		const testActor = actor();
		const selections = {
			...baseSelections(),
			generatedAttributes: {
				strength: 3,
				quickness: 5,
				body: 2,
				charisma: 3,
				intelligence: 4,
				willpower: 3,
			},
			skillSelections: [
				{ skillItemId: "skill-pistols", category: "active" as const, rating: 3 },
				{ skillItemId: "skill-streetwise", category: "knowledge" as const, rating: 2 },
				{ skillItemId: "skill-english", category: "language" as const, rating: 1 },
			],
		};

		await CharacterInitializer.Instance().initializeCharacter(testActor as never, selections);

		const updateData = testActor.update.mock.calls[0]![0] as Record<string, unknown>;
		// Pistols: linked to Quickness (5), rating 3 -> all 3 levels below 5 -> cost 1 each -> spent 3
		const activePool = Math.floor(34 * 0.6); // skillPriority C -> 34 total, 60% active
		expect(updateData["system.creation.activePoints"]).toBe(activePool - 3);
		// Streetwise: linked to Intelligence (4), rating 2 -> both levels below 4 -> cost 1 each -> spent 2
		expect(updateData["system.creation.knowledgePoints"]).toBe(4 * 5 - 2);
		// English: linked to Intelligence (4), rating 1 -> 1 level below 4 -> cost 1 -> spent 1
		expect(updateData["system.creation.languagePoints"]).toBe(Math.floor(4 * 1.5) - 1);

		const skillEmbedCall = testActor.createEmbeddedDocuments.mock.calls.find((call) =>
			(call[1] as Array<{ type: string }>).some((item) => item.type === "skill")
		);
		const embeddedSkills = skillEmbedCall![1] as Array<{ name: string; system: Record<string, { value: number }> }>;
		expect(embeddedSkills).toHaveLength(3);
		expect(embeddedSkills.find((s) => s.name === "skill-pistols")?.system["activeSkill"]?.value).toBe(3);
		expect(embeddedSkills.find((s) => s.name === "skill-streetwise")?.system["knowledgeSkill"]?.value).toBe(2);
		expect(embeddedSkills.find((s) => s.name === "skill-english")?.system["languageSkill"]?.value).toBe(1);
	});

	it("does not touch skill pools or embed skills when no skills were selected", async () => {
		const testActor = actor();

		await CharacterInitializer.Instance().initializeCharacter(testActor as never, baseSelections());

		const skillEmbedCall = testActor.createEmbeddedDocuments.mock.calls.find((call) =>
			(call[1] as Array<{ type: string }>).some((item) => item.type === "skill")
		);
		expect(skillEmbedCall).toBeUndefined();
	});

	it("burns all four creation point pools to zero when burnUnusedPoints is set, even with no rolls", async () => {
		const testActor = actor();
		const selections = { ...baseSelections(), burnUnusedPoints: true };

		await CharacterInitializer.Instance().initializeCharacter(testActor as never, selections);

		const updateData = testActor.update.mock.calls[0]![0] as Record<string, unknown>;
		expect(updateData["system.creation.attributePoints"]).toBe(0);
		expect(updateData["system.creation.activePoints"]).toBe(0);
		expect(updateData["system.creation.knowledgePoints"]).toBe(0);
		expect(updateData["system.creation.languagePoints"]).toBe(0);
		expect(testActor.setFlag).toHaveBeenCalledWith("sr3e", "attributeAssignmentLocked", true);
	});

	it("burns leftover points even when attributes/skills were partially rolled", async () => {
		const testActor = actor();
		const selections = {
			...baseSelections(),
			generatedAttributes: {
				strength: 3,
				quickness: 5,
				body: 2,
				charisma: 3,
				intelligence: 4,
				willpower: 3,
			},
			skillSelections: [{ skillItemId: "skill-pistols", category: "active" as const, rating: 3 }],
			burnUnusedPoints: true,
		};

		await CharacterInitializer.Instance().initializeCharacter(testActor as never, selections);

		const updateData = testActor.update.mock.calls[0]![0] as Record<string, unknown>;
		expect(updateData["system.creation.attributePoints"]).toBe(0);
		expect(updateData["system.creation.activePoints"]).toBe(0);
		expect(updateData["system.creation.knowledgePoints"]).toBe(0);
		expect(updateData["system.creation.languagePoints"]).toBe(0);
	});
});
