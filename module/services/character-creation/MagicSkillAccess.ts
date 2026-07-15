/**
 * Pure mapping from a magic item's archetype/magicianType/aspect to whether the
 * character has access to the Sorcery and/or Conjuring skills. No Actor/Foundry
 * dependency — takes plain data in, returns plain data out.
 */

export interface MagicAccessData {
	archetype?: string;
	magicianType?: string;
	aspect?: string;
}

export interface MagicSkillAccess {
	sorcery: boolean;
	conjuring: boolean;
}

const NO_ACCESS: MagicSkillAccess = { sorcery: false, conjuring: false };
const FULL_ACCESS: MagicSkillAccess = { sorcery: true, conjuring: true };

/**
 * Determines Sorcery/Conjuring access from a magic item's system data.
 * Adepts get neither. Fullmages get both. Aspected mages get the skill matching
 * their aspect (sorcerer -> Sorcery, conjurer -> Conjuring), or both for
 * elementalist/custom aspects. Unawakened (no archetype) gets neither.
 */
export function getMagicSkillAccess(magic: MagicAccessData | undefined): MagicSkillAccess {
	if (!magic?.archetype || magic.archetype === "adept") return NO_ACCESS;
	if (magic.archetype !== "magician") return NO_ACCESS;
	if (magic.magicianType !== "aspectedmage") return FULL_ACCESS;

	switch (magic.aspect) {
		case "sorcerer":
			return { sorcery: true, conjuring: false };
		case "conjurer":
			return { sorcery: false, conjuring: true };
		default:
			return FULL_ACCESS;
	}
}
