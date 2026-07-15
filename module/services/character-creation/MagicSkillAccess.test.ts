import { describe, expect, it } from "vitest";
import { getMagicSkillAccess } from "./MagicSkillAccess";

describe("getMagicSkillAccess", () => {
	it("gives adepts neither skill", () => {
		expect(getMagicSkillAccess({ archetype: "adept" })).toEqual({ sorcery: false, conjuring: false });
	});

	it("gives fullmages both skills", () => {
		expect(getMagicSkillAccess({ archetype: "magician", magicianType: "fullmage" })).toEqual({
			sorcery: true,
			conjuring: true,
		});
	});

	it("gives sorcerer-aspected mages Sorcery only", () => {
		expect(
			getMagicSkillAccess({ archetype: "magician", magicianType: "aspectedmage", aspect: "sorcerer" })
		).toEqual({ sorcery: true, conjuring: false });
	});

	it("gives conjurer-aspected mages Conjuring only", () => {
		expect(
			getMagicSkillAccess({ archetype: "magician", magicianType: "aspectedmage", aspect: "conjurer" })
		).toEqual({ sorcery: false, conjuring: true });
	});

	it("gives elementalist-aspected mages both skills", () => {
		expect(
			getMagicSkillAccess({ archetype: "magician", magicianType: "aspectedmage", aspect: "elementalist" })
		).toEqual({ sorcery: true, conjuring: true });
	});

	it("gives custom-aspected mages both skills", () => {
		expect(
			getMagicSkillAccess({ archetype: "magician", magicianType: "aspectedmage", aspect: "custom" })
		).toEqual({ sorcery: true, conjuring: true });
	});

	it("gives Unawakened (no archetype) neither skill", () => {
		expect(getMagicSkillAccess(undefined)).toEqual({ sorcery: false, conjuring: false });
		expect(getMagicSkillAccess({})).toEqual({ sorcery: false, conjuring: false });
	});
});
